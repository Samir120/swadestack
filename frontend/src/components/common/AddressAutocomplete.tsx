import React, { useRef, useEffect, useCallback } from 'react';
import { useGooglePlacesAutocomplete, AddressComponents } from '../../hooks/useGooglePlacesAutocomplete';

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onAddressSelect?: (address: AddressComponents) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  name?: string;
  language?: string;
}

/**
 * AddressAutocomplete Component
 *
 * A text input with Google Places Autocomplete for address suggestions.
 * When a place is selected, it parses the address components and calls onAddressSelect
 * with the parsed data (address, city, postalCode, country).
 *
 * Usage:
 * ```tsx
 * <AddressAutocomplete
 *   value={formData.address}
 *   onChange={(value) => setFormData({ ...formData, address: value })}
 *   onAddressSelect={(address) => {
 *     setFormData({
 *       ...formData,
 *       address: address.address,
 *       city: address.city,
 *       postalCode: address.postalCode,
 *       country: address.countryCode,
 *     });
 *   }}
 *   placeholder="Enter your address"
 * />
 * ```
 */
const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  value,
  onChange,
  onAddressSelect,
  placeholder,
  className = '',
  disabled = false,
  required = false,
  id,
  name,
  language: _language = 'en',
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  // Track when a place was just selected to ignore Google's automatic input value update
  const justSelectedRef = useRef<boolean>(false);
  const selectedAddressRef = useRef<string>('');
  // Debounce timer for input changes
  const pendingChangeRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handlePlaceSelected = useCallback((address: AddressComponents) => {
    // Clear any pending onChange calls
    if (pendingChangeRef.current) {
      clearTimeout(pendingChangeRef.current);
      pendingChangeRef.current = null;
    }

    // Mark that we just selected a place
    justSelectedRef.current = true;
    selectedAddressRef.current = address.address;

    // Call the callback with full address components
    // This ensures all fields get populated (city, postalCode, country)
    // Don't call onChange separately as it would use stale closure and overwrite other fields
    if (onAddressSelect) {
      onAddressSelect(address);
    } else {
      // Only call onChange if onAddressSelect is not provided
      onChange(address.address);
    }

    // Force the input to show only the street address after Google sets the full address
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.value = address.address;
      }
    }, 0);

    // Reset the flag after a delay to allow normal typing again
    setTimeout(() => {
      justSelectedRef.current = false;
    }, 200);
  }, [onChange, onAddressSelect]);

  const { isReady } = useGooglePlacesAutocomplete(inputRef, {
    onPlaceSelected: handlePlaceSelected,
    componentRestrictions: { country: 'se' }, // Restrict to Sweden
  });

  // Parse formatted address string (fallback when Google doesn't provide components)
  const parseFormattedAddressString = useCallback((formatted: string) => {
    const parts = formatted.split(',').map(p => p.trim());
    const result = {
      address: parts[0] || '',
      city: '',
      postalCode: '',
      country: '',
      countryCode: '',
    };

    if (parts.length >= 2) {
      const secondPart = parts[1];
      // Swedish postal codes: "XXX XX" format
      const postalMatch = secondPart.match(/^(\d{3}\s?\d{2})\s+(.+)$/);
      if (postalMatch) {
        result.postalCode = postalMatch[1];
        result.city = postalMatch[2];
      } else {
        result.city = secondPart;
      }
    }

    if (parts.length >= 3) {
      const lastPart = parts[parts.length - 1];
      if (lastPart.toLowerCase() === 'sweden' || lastPart.toLowerCase() === 'sverige') {
        result.country = 'Sweden';
        result.countryCode = 'SE';
      } else {
        result.country = lastPart;
      }
    }

    return result;
  }, []);

  // Fetch postal code using Google Geocoding API
  const fetchPostalCode = useCallback(async (address: string, city: string): Promise<string> => {
    if (!window.google?.maps) return '';

    return new Promise((resolve) => {
      const geocoder = new (window as any).google.maps.Geocoder();
      const fullAddress = `${address}, ${city}, Sweden`;

      geocoder.geocode({ address: fullAddress }, (results: any, status: any) => {
        if (status === 'OK' && results && results[0]) {
          const addressComponents = results[0].address_components;
          for (const component of addressComponents) {
            if (component.types.includes('postal_code')) {
              resolve(component.long_name);
              return;
            }
          }
        }
        resolve('');
      });
    });
  }, []);

  // Handle input change with debouncing to allow place_changed event to fire first
  // Google sets the input value BEFORE firing place_changed, so we need to delay
  // our onChange to give place_changed a chance to set the flag
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    // Clear any pending change
    if (pendingChangeRef.current) {
      clearTimeout(pendingChangeRef.current);
    }

    // Debounce the change to allow place_changed to fire first and set the flag
    pendingChangeRef.current = setTimeout(() => {
      pendingChangeRef.current = null;

      // If we just selected a place, ignore this change
      if (justSelectedRef.current) {
        return;
      }

      // Check if this looks like a Google-formatted address (contains comma and country)
      // This is a fallback for when place_changed doesn't fire properly
      if (newValue.includes(',') && (newValue.toLowerCase().includes('sweden') || newValue.toLowerCase().includes('sverige'))) {
        const parsed = parseFormattedAddressString(newValue);

        // Mark as selected to prevent re-triggering
        justSelectedRef.current = true;
        selectedAddressRef.current = parsed.address;

        // Update all fields - only call onAddressSelect, not onChange
        // as onChange would use stale closure and overwrite other fields
        if (onAddressSelect) {
          onAddressSelect(parsed);
        } else {
          onChange(parsed.address);
        }

        // Force input to show only street address
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.value = parsed.address;
          }
          justSelectedRef.current = false;
        }, 50);

        return;
      }

      onChange(newValue);
    }, 50); // Increased debounce to 50ms
  }, [onChange, onAddressSelect, parseFormattedAddressString]);

  // Cleanup pending timeout on unmount
  useEffect(() => {
    return () => {
      if (pendingChangeRef.current) {
        clearTimeout(pendingChangeRef.current);
      }
    };
  }, []);

  // Watch for Google's direct DOM manipulation of the input value
  // React's onChange doesn't fire when Google sets input.value directly
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    let lastValue = input.value;

    // Use a polling approach to detect when Google changes the input value
    const checkForGoogleUpdate = setInterval(() => {
      const currentValue = input.value;

      // If value changed and it looks like a Google formatted address
      if (currentValue !== lastValue &&
          currentValue.includes(',') &&
          (currentValue.toLowerCase().includes('sweden') || currentValue.toLowerCase().includes('sverige'))) {

        lastValue = currentValue;

        // Don't process if we already handled this
        if (justSelectedRef.current) {
          return;
        }

        // Parse and update
        const parsed = parseFormattedAddressString(currentValue);

        justSelectedRef.current = true;
        selectedAddressRef.current = parsed.address;

        // If no postal code in parsed result, fetch it via Geocoding API
        if (!parsed.postalCode && parsed.address && parsed.city) {
          fetchPostalCode(parsed.address, parsed.city).then((postalCode) => {
            if (postalCode) {
              parsed.postalCode = postalCode;
            }

            // Call onAddressSelect which sets ALL fields including address
            if (onAddressSelect) {
              onAddressSelect(parsed);
            } else {
              onChange(parsed.address);
            }
          });
        } else {
          // Call onAddressSelect which sets ALL fields including address
          if (onAddressSelect) {
            onAddressSelect(parsed);
          } else {
            onChange(parsed.address);
          }
        }

        // Update input to show only street
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.value = parsed.address;
          }
          lastValue = parsed.address;
          justSelectedRef.current = false;
        }, 100);
      } else if (currentValue !== lastValue) {
        lastValue = currentValue;
      }
    }, 100);

    return () => clearInterval(checkForGoogleUpdate);
  }, [onChange, onAddressSelect, parseFormattedAddressString, fetchPostalCode]);

  // Prevent form submission on Enter when autocomplete dropdown is open
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        // Check if autocomplete dropdown is visible
        const pacContainer = document.querySelector('.pac-container');
        if (pacContainer && pacContainer.querySelectorAll('.pac-item').length > 0) {
          e.preventDefault();
        }
      }
    };

    input.addEventListener('keydown', handleKeyDown);
    return () => input.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        id={id}
        name={name}
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
        className={className}
        disabled={disabled}
        required={required}
        autoComplete="off"
      />
      {/* Show subtle indicator when autocomplete is ready */}
      {isReady && !disabled && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg
            className="w-4 h-4 text-neutral-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>
      )}
    </div>
  );
};

export default AddressAutocomplete;
