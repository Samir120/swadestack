import { useEffect, useRef, useState, useCallback } from 'react';

// Extend Window interface for Google Maps
declare const google: any;
declare global {
  interface Window {
    google: any;
    initGoogleMapsCallback?: () => void;
  }
}

export interface AddressComponents {
  address: string;
  city: string;
  postalCode: string;
  country: string;
  countryCode: string;
}

interface UseGooglePlacesAutocompleteOptions {
  onPlaceSelected?: (place: AddressComponents) => void;
  types?: string[];
  componentRestrictions?: { country: string | string[] };
}

// Track if the script is loaded globally
let isScriptLoaded = false;
let isScriptLoading = false;
const loadCallbacks: (() => void)[] = [];

// Load Google Maps script once
const loadGoogleMapsScript = (apiKey: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (isScriptLoaded && window.google?.maps?.places) {
      resolve();
      return;
    }

    if (isScriptLoading) {
      loadCallbacks.push(() => resolve());
      return;
    }

    isScriptLoading = true;

    // Check if script already exists
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => {
        isScriptLoaded = true;
        isScriptLoading = false;
        loadCallbacks.forEach(cb => cb());
        loadCallbacks.length = 0;
        resolve();
      });
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      isScriptLoaded = true;
      isScriptLoading = false;
      loadCallbacks.forEach(cb => cb());
      loadCallbacks.length = 0;
      resolve();
    };

    script.onerror = () => {
      isScriptLoading = false;
      reject(new Error('Failed to load Google Maps script'));
    };

    document.head.appendChild(script);
  });
};

// Parse Swedish formatted address string
// Formats: "Streetname 14, City, Sweden" or "Streetname 14, 164 40 City, Sweden"
const parseFormattedAddress = (formatted: string): AddressComponents => {
  const components: AddressComponents = {
    address: '',
    city: '',
    postalCode: '',
    country: '',
    countryCode: '',
  };

  const parts = formatted.split(',').map(p => p.trim());

  if (parts.length >= 1) {
    // First part is always the street address
    components.address = parts[0];
  }

  if (parts.length >= 2) {
    // Second part could be "City" or "164 40 City" (postal code + city)
    const secondPart = parts[1];
    // Swedish postal codes are 5 digits, often formatted as "XXX XX"
    const postalMatch = secondPart.match(/^(\d{3}\s?\d{2})\s+(.+)$/);
    if (postalMatch) {
      components.postalCode = postalMatch[1];
      components.city = postalMatch[2];
    } else {
      // No postal code, just city name
      components.city = secondPart;
    }
  }

  if (parts.length >= 3) {
    // Third part is usually the country
    const lastPart = parts[parts.length - 1];
    if (lastPart.toLowerCase() === 'sweden' || lastPart.toLowerCase() === 'sverige') {
      components.country = 'Sweden';
      components.countryCode = 'SE';
    } else {
      components.country = lastPart;
    }
  }

  return components;
};

// Parse address components from Google Places result
const parseAddressComponents = (place: any): AddressComponents => {
  const components: AddressComponents = {
    address: '',
    city: '',
    postalCode: '',
    country: '',
    countryCode: '',
  };

  // If no address_components, fall back to parsing formatted_address
  if (!place.address_components || place.address_components.length === 0) {
    if (place.formatted_address) {
      return parseFormattedAddress(place.formatted_address);
    }
    return components;
  }

  let streetNumber = '';
  let route = '';
  let sublocality = '';

  place.address_components.forEach((component: any) => {
    const types = component.types;

    if (types.includes('street_number')) {
      streetNumber = component.long_name;
    }
    if (types.includes('route')) {
      route = component.long_name;
    }
    // For Swedish addresses, sometimes sublocality contains useful info
    if (types.includes('sublocality') || types.includes('sublocality_level_1')) {
      sublocality = component.long_name;
    }
    // City: try locality first, then postal_town (common in Sweden), then administrative_area
    if (types.includes('locality')) {
      components.city = component.long_name;
    } else if (types.includes('postal_town') && !components.city) {
      components.city = component.long_name;
    } else if (types.includes('administrative_area_level_1') && !components.city) {
      components.city = component.long_name;
    }
    if (types.includes('postal_code')) {
      components.postalCode = component.long_name;
    }
    if (types.includes('country')) {
      components.country = component.long_name;
      components.countryCode = component.short_name;
    }
  });

  // Combine street number and route for Swedish address format
  // Swedish format: "Streetname Number" (e.g., "Kungsgatan 10")
  if (route) {
    components.address = streetNumber ? `${route} ${streetNumber}` : route;
  } else if (sublocality) {
    // Fallback to sublocality if no route
    components.address = sublocality;
  } else if (place.formatted_address) {
    // Last resort: use the first part of formatted_address
    const parts = place.formatted_address.split(',');
    components.address = parts[0]?.trim() || '';
  }

  // If we still don't have city from address_components, try parsing formatted_address
  if (!components.city && place.formatted_address) {
    const parsed = parseFormattedAddress(place.formatted_address);
    if (!components.city) components.city = parsed.city;
    if (!components.postalCode) components.postalCode = parsed.postalCode;
    if (!components.country) components.country = parsed.country;
    if (!components.countryCode) components.countryCode = parsed.countryCode;
  }

  return components;
};

export const useGooglePlacesAutocomplete = (
  inputRef: React.RefObject<HTMLInputElement>,
  options: UseGooglePlacesAutocompleteOptions = {}
) => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const autocompleteRef = useRef<any>(null);

  const { onPlaceSelected, types = ['address'], componentRestrictions = { country: 'se' } } = options;

  // Use a ref to store the callback to avoid stale closures
  const onPlaceSelectedRef = useRef(onPlaceSelected);
  onPlaceSelectedRef.current = onPlaceSelected;

  // Get API key from environment
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const initAutocomplete = useCallback(() => {
    if (!inputRef.current || !window.google?.maps?.places) {
      return;
    }

    // Destroy existing autocomplete if any
    if (autocompleteRef.current) {
      google.maps.event.clearInstanceListeners(autocompleteRef.current);
    }

    try {
      autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
        types,
        componentRestrictions,
        fields: ['address_components', 'formatted_address', 'geometry'],
      });

      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current?.getPlace();

        if (place) {
          const addressComponents = parseAddressComponents(place);

          if (onPlaceSelectedRef.current) {
            onPlaceSelectedRef.current(addressComponents);
          }
        }
      });

      setIsReady(true);
    } catch (err) {
      console.error('Failed to initialize autocomplete:', err);
      setError('Failed to initialize address autocomplete');
    }
  }, [inputRef, types, componentRestrictions]);

  useEffect(() => {
    if (!apiKey) {
      console.warn('Google Maps API key not found. Address autocomplete disabled.');
      return;
    }

    loadGoogleMapsScript(apiKey)
      .then(() => {
        initAutocomplete();
      })
      .catch((err) => {
        console.error('Failed to load Google Maps:', err);
        setError('Failed to load address autocomplete');
      });

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [apiKey, initAutocomplete]);

  // Re-initialize when input ref changes
  useEffect(() => {
    if (isScriptLoaded && inputRef.current && !autocompleteRef.current) {
      initAutocomplete();
    }
  }, [inputRef.current, initAutocomplete]);

  return { isReady, error };
};

export default useGooglePlacesAutocomplete;
