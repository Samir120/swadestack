import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { pcConfigurationApi } from '../../models/api/pcConfigurationApi';
import {
  PCConfiguration,
  PriceBreakdown,
} from '../../models/types/pcConfiguration.types';
import {
  PCComponent,
  ComponentType,
  SelectedComponents,
  PCComponentWithSlot,
  SSDComponentWithSlot,
  isMultiSelectType,
} from '../../models/types/pcComponent.types';
import { ValidationResult } from '../../models/types/validation.types';

/**
 * PC Builder Slice - ViewModel Layer
 * Manages the PC Builder UI state and current configuration being built
 */

// Compatibility status for a single component
interface ComponentCompatibilityStatus {
  isCompatible: boolean;
  errors: any[];
  warnings: any[];
}

// Map of component ID to compatibility status
type ComponentCompatibilityMap = Record<string, ComponentCompatibilityStatus>;

interface PCBuilderState {
  currentConfiguration: PCConfiguration | null;
  selectedComponents: SelectedComponents;
  validationResult: ValidationResult | null;
  priceBreakdown: PriceBreakdown | null;
  currentStep: number; // 0-11 for 12 component types
  includesBuildService: boolean;
  buildServiceCharge: number;
  selectedBuildServiceId: string | null;
  selectedDiyOptionId: string | null; // Track when DIY is explicitly selected

  // UI state
  isValidating: boolean;
  isSaving: boolean;
  isLoading: boolean;
  error: string | null;

  // Component selection UI
  selectedComponentType: ComponentType | null;
  showValidationModal: boolean;
  showAlternativesModal: boolean;
  alternativeSuggestions: any[];

  // Component compatibility for display (pre-validation)
  componentCompatibility: ComponentCompatibilityMap;
  isValidatingComponents: boolean;
}

const initialState: PCBuilderState = {
  currentConfiguration: null,
  selectedComponents: {},
  validationResult: null,
  priceBreakdown: null,
  currentStep: 0, // Start with CPU selection
  includesBuildService: false,
  buildServiceCharge: 0,
  selectedBuildServiceId: null,
  selectedDiyOptionId: null, // No selection by default - user must choose

  isValidating: false,
  isSaving: false,
  isLoading: false,
  error: null,

  selectedComponentType: null,
  showValidationModal: false,
  showAlternativesModal: false,
  alternativeSuggestions: [],

  // Component compatibility for display
  componentCompatibility: {},
  isValidatingComponents: false,
};

// Async Thunks

/**
 * Load an existing configuration by ID
 */
export const loadConfiguration = createAsyncThunk(
  'pcBuilder/loadConfiguration',
  async (configId: string) => {
    const response = await pcConfigurationApi.getById(configId);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to load configuration');
    }
    return response.data;
  }
);

/**
 * Create a new configuration
 */
export const createConfiguration = createAsyncThunk(
  'pcBuilder/createConfiguration',
  async (name?: { name_en?: string; name_sv?: string }) => {
    const response = await pcConfigurationApi.create(name);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to create configuration');
    }
    return response.data;
  }
);

/**
 * Add a component to the current configuration
 * Validates compatibility before adding
 */
export const addComponent = createAsyncThunk(
  'pcBuilder/addComponent',
  async ({
    configId,
    componentType,
    component,
    quantity = 1,
  }: {
    configId: string;
    componentType: ComponentType;
    component: PCComponent;
    quantity?: number;
  }, { rejectWithValue }) => {
    // Pre-validate compatibility using the validateSelection endpoint
    const validateResponse = await pcConfigurationApi.validateSelection({
      configId,
      componentType,
      componentId: component.id,
    });

    if (validateResponse.success && validateResponse.data) {
      const { isCompatible, errors } = validateResponse.data;
      if (!isCompatible && errors && errors.length > 0) {
        // Component is incompatible - reject with the error message
        const errorMsg = errors[0]?.message_en || errors[0]?.message || 'Component is not compatible';
        return rejectWithValue(errorMsg);
      }
    }

    // Component is compatible, proceed to add
    const response = await pcConfigurationApi.addComponent(
      configId,
      componentType,
      component.id,
      quantity
    );
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to add component');
    }
    return { componentType, component, quantity, configuration: response.data };
  }
);

/**
 * Remove a component from the current configuration
 */
export const removeComponent = createAsyncThunk(
  'pcBuilder/removeComponent',
  async ({ configId, componentType }: { configId: string; componentType: ComponentType }) => {
    const response = await pcConfigurationApi.removeComponent(configId, componentType);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to remove component');
    }
    return { componentType, configuration: response.data };
  }
);

/**
 * Add a multi-select component (RAM, GPU, SSD, HDD, Fan) to configuration
 * Validates compatibility before adding
 */
export const addMultiSelectComponent = createAsyncThunk(
  'pcBuilder/addMultiSelectComponent',
  async ({
    configId,
    componentType,
    component,
    slotIndex,
    slotType,
  }: {
    configId: string;
    componentType: 'ram' | 'gpu' | 'ssd' | 'hdd' | 'fan';
    component: PCComponent;
    slotIndex: number;
    slotType?: 'nvme' | 'sata';
  }, { rejectWithValue }) => {
    // Pre-validate compatibility using the validateSelection endpoint
    const validateResponse = await pcConfigurationApi.validateSelection({
      configId,
      componentType,
      componentId: component.id,
    });

    if (validateResponse.success && validateResponse.data) {
      const { isCompatible, errors } = validateResponse.data;
      if (!isCompatible && errors && errors.length > 0) {
        // Component is incompatible - reject with the error message
        const errorMsg = errors[0]?.message_en || errors[0]?.message || 'Component is not compatible';
        return rejectWithValue(errorMsg);
      }
    }

    // Component is compatible, proceed to add
    const response = await pcConfigurationApi.addComponent(
      configId,
      componentType,
      component.id,
      1,
      slotIndex,
      slotType
    );
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to add component');
    }
    return { componentType, component, slotIndex, slotType, configuration: response.data };
  }
);

/**
 * Remove a multi-select component by slot index
 */
export const removeMultiSelectComponent = createAsyncThunk(
  'pcBuilder/removeMultiSelectComponent',
  async ({
    configId,
    componentType,
    slotIndex,
  }: {
    configId: string;
    componentType: 'ram' | 'gpu' | 'ssd' | 'hdd' | 'fan';
    slotIndex: number;
  }) => {
    const response = await pcConfigurationApi.removeComponent(configId, componentType, slotIndex);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to remove component');
    }
    return { componentType, slotIndex, configuration: response.data };
  }
);

/**
 * Validate the current configuration
 */
export const validateConfiguration = createAsyncThunk(
  'pcBuilder/validateConfiguration',
  async (configId: string) => {
    const response = await pcConfigurationApi.validate(configId);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to validate configuration');
    }
    return response.data;
  }
);

/**
 * Toggle build service on/off
 */
export const toggleBuildService = createAsyncThunk(
  'pcBuilder/toggleBuildService',
  async ({ configId, enabled, optionId }: { configId: string; enabled: boolean; optionId?: string }) => {
    const response = await pcConfigurationApi.toggleBuildService(configId, enabled, optionId);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to toggle build service');
    }
    return { configuration: response.data, optionId };
  }
);

/**
 * Calculate price breakdown
 */
export const calculatePrice = createAsyncThunk(
  'pcBuilder/calculatePrice',
  async (configId: string) => {
    const response = await pcConfigurationApi.calculatePrice(configId);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to calculate price');
    }
    return response.data;
  }
);

/**
 * Save the current configuration
 */
export const saveConfiguration = createAsyncThunk(
  'pcBuilder/saveConfiguration',
  async (configId: string) => {
    // Validate with save=true to transition status from draft to saved
    const response = await pcConfigurationApi.validate(configId, true);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to save configuration');
    }
    return response.data;
  }
);

/**
 * Export configuration as PDF
 */
export const exportPDF = createAsyncThunk(
  'pcBuilder/exportPDF',
  async (configId: string) => {
    await pcConfigurationApi.exportPDF(configId);
  }
);

/**
 * Checkout configuration (convert to order)
 */
export const checkoutConfiguration = createAsyncThunk(
  'pcBuilder/checkoutConfiguration',
  async ({
    configId,
    orderData,
  }: {
    configId: string;
    orderData: any;
  }) => {
    const response = await pcConfigurationApi.checkout(configId, orderData);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to checkout configuration');
    }
    return response.data;
  }
);

/**
 * Validate multiple components for display (batch pre-validation)
 * This checks compatibility for all components before the user selects them
 */
export const validateComponentsForDisplay = createAsyncThunk(
  'pcBuilder/validateComponentsForDisplay',
  async ({
    configId,
    componentType,
    componentIds,
  }: {
    configId: string;
    componentType: ComponentType;
    componentIds: string[];
  }) => {
    // Validate each component in parallel
    const validationPromises = componentIds.map(async (componentId) => {
      try {
        const response = await pcConfigurationApi.validateSelection({
          configId,
          componentType,
          componentId,
        });

        if (response.success && response.data) {
          return {
            componentId,
            status: {
              isCompatible: response.data.isCompatible,
              errors: response.data.errors || [],
              warnings: response.data.warnings || [],
            },
          };
        }

        // Default to compatible if validation fails
        return {
          componentId,
          status: { isCompatible: true, errors: [], warnings: [] },
        };
      } catch (error) {
        // Default to compatible on error to not block selection
        return {
          componentId,
          status: { isCompatible: true, errors: [], warnings: [] },
        };
      }
    });

    const results = await Promise.all(validationPromises);

    // Convert to a map
    const compatibilityMap: Record<string, ComponentCompatibilityStatus> = {};
    for (const result of results) {
      compatibilityMap[result.componentId] = result.status;
    }

    return { componentType, compatibilityMap };
  }
);

// Slice
const pcBuilderSlice = createSlice({
  name: 'pcBuilder',
  initialState,
  reducers: {
    // UI state management
    setCurrentStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload;
    },
    nextStep: (state) => {
      if (state.currentStep < 11) { // 12 component types (0-11)
        state.currentStep += 1;
      }
    },
    previousStep: (state) => {
      if (state.currentStep > 0) {
        state.currentStep -= 1;
      }
    },
    setSelectedComponentType: (state, action: PayloadAction<ComponentType | null>) => {
      state.selectedComponentType = action.payload;
    },

    // Validation modals
    showValidationModal: (state) => {
      state.showValidationModal = true;
    },
    hideValidationModal: (state) => {
      state.showValidationModal = false;
    },
    showAlternativesModal: (state, action: PayloadAction<any[]>) => {
      state.showAlternativesModal = true;
      state.alternativeSuggestions = action.payload;
    },
    hideAlternativesModal: (state) => {
      state.showAlternativesModal = false;
      state.alternativeSuggestions = [];
    },

    // Local component selection (optimistic updates) for single-select components
    setSelectedComponent: (
      state,
      action: PayloadAction<{ type: ComponentType; component: PCComponent }>
    ) => {
      const { type, component } = action.payload;

      // For single-select components (cpu, motherboard, psu, case, cooling, optical, os)
      if (!isMultiSelectType(type)) {
        state.selectedComponents[type as 'cpu' | 'motherboard' | 'psu' | 'case' | 'cooling' | 'optical' | 'os'] = component;
      }
    },

    // Add component to multi-select array (ram, gpu, ssd, hdd, fan)
    addToMultiSelectComponent: (
      state,
      action: PayloadAction<{
        type: 'ram' | 'gpu' | 'ssd' | 'hdd' | 'fan';
        component: PCComponent;
        slotIndex: number;
        slotType?: 'nvme' | 'sata'; // Only for SSD
      }>
    ) => {
      const { type, component, slotIndex, slotType } = action.payload;

      // Map component type to plural key
      const pluralKey = `${type}s` as 'rams' | 'gpus' | 'ssds' | 'hdds' | 'fans';

      // Initialize array if doesn't exist
      if (!state.selectedComponents[pluralKey]) {
        state.selectedComponents[pluralKey] = [] as any;
      }

      // Create the component with slot info
      if (type === 'ssd') {
        const ssdComponent: SSDComponentWithSlot = {
          ...component,
          slotIndex,
          slotType: slotType || 'nvme',
        };
        (state.selectedComponents.ssds as SSDComponentWithSlot[]).push(ssdComponent);
      } else {
        const slotComponent: PCComponentWithSlot = {
          ...component,
          slotIndex,
        };
        (state.selectedComponents[pluralKey] as PCComponentWithSlot[]).push(slotComponent);
      }
    },

    // Remove component from multi-select array by slot index
    removeFromMultiSelectComponent: (
      state,
      action: PayloadAction<{
        type: 'ram' | 'gpu' | 'ssd' | 'hdd' | 'fan';
        slotIndex: number;
      }>
    ) => {
      const { type, slotIndex } = action.payload;
      const pluralKey = `${type}s` as 'rams' | 'gpus' | 'ssds' | 'hdds' | 'fans';

      const arr = state.selectedComponents[pluralKey] as PCComponentWithSlot[] | undefined;
      if (arr) {
        state.selectedComponents[pluralKey] = arr.filter(c => c.slotIndex !== slotIndex) as any;
      }
    },

    // Remove all components of a type (both single and multi-select)
    removeSelectedComponent: (state, action: PayloadAction<ComponentType>) => {
      const type = action.payload;
      if (isMultiSelectType(type)) {
        const pluralKey = `${type}s` as 'rams' | 'gpus' | 'ssds' | 'hdds' | 'fans';
        state.selectedComponents[pluralKey] = [] as any;
      } else {
        delete state.selectedComponents[type as keyof SelectedComponents];
      }
    },

    // Clear everything and start fresh
    clearConfiguration: (state) => {
      state.currentConfiguration = null;
      state.selectedComponents = {};
      state.validationResult = null;
      state.priceBreakdown = null;
      state.currentStep = 0;
      state.includesBuildService = false;
      state.buildServiceCharge = 0;
      state.selectedBuildServiceId = null;
      state.selectedDiyOptionId = null;
      state.error = null;
      state.componentCompatibility = {};
    },

    // Clear component compatibility (when changing steps)
    clearComponentCompatibility: (state) => {
      state.componentCompatibility = {};
    },

    // Error handling
    clearError: (state) => {
      state.error = null;
    },

    // Update validation result
    updateValidationResult: (state, action: PayloadAction<ValidationResult>) => {
      state.validationResult = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Load configuration
      .addCase(loadConfiguration.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadConfiguration.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentConfiguration = action.payload;

        // Extract selected components from configuration snapshot
        state.selectedComponents = action.payload.components as any; // Snapshot to SelectedComponents
        state.includesBuildService = action.payload.includesBuildService;
        state.buildServiceCharge = action.payload.buildServiceCharge;
        state.validationResult = {
          isValid: action.payload.isValid,
          errors: action.payload.validationErrors,
          warnings: action.payload.validationWarnings,
          powerSummary: action.payload.powerSummary,
          timestamp: action.payload.updatedAt,
        };
      })
      .addCase(loadConfiguration.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to load configuration';
      })

      // Create configuration
      .addCase(createConfiguration.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createConfiguration.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentConfiguration = action.payload;
      })
      .addCase(createConfiguration.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to create configuration';
      })

      // Add component
      .addCase(addComponent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addComponent.fulfilled, (state, action) => {
        state.isLoading = false;
        const { configuration } = action.payload;

        // Update configuration
        state.currentConfiguration = configuration;

        // Sync selectedComponents from the configuration response
        // This ensures we have the correct specifications from the database
        if (configuration.components) {
          state.selectedComponents = configuration.components as any;
        }
      })
      .addCase(addComponent.rejected, (state, action) => {
        state.isLoading = false;
        // action.payload contains the rejectWithValue message (compatibility error)
        // action.error.message contains throw Error message
        state.error = (action.payload as string) || action.error.message || 'Failed to add component';
      })

      // Remove component
      .addCase(removeComponent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeComponent.fulfilled, (state, action) => {
        state.isLoading = false;
        const { configuration } = action.payload;

        // Update configuration
        state.currentConfiguration = configuration;

        // Sync selectedComponents from the configuration response
        if (configuration.components) {
          state.selectedComponents = configuration.components as any;
        }
      })
      .addCase(removeComponent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to remove component';
      })

      // Add multi-select component
      .addCase(addMultiSelectComponent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addMultiSelectComponent.fulfilled, (state, action) => {
        state.isLoading = false;
        const { configuration } = action.payload;

        // Update configuration
        state.currentConfiguration = configuration;

        // Sync selectedComponents from the configuration response
        // This ensures we have the correct specifications from the database
        if (configuration.components) {
          state.selectedComponents = configuration.components as any;
        }
      })
      .addCase(addMultiSelectComponent.rejected, (state, action) => {
        state.isLoading = false;
        // action.payload contains the rejectWithValue message (compatibility error)
        // action.error.message contains throw Error message
        state.error = (action.payload as string) || action.error.message || 'Failed to add component';
      })

      // Remove multi-select component
      .addCase(removeMultiSelectComponent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeMultiSelectComponent.fulfilled, (state, action) => {
        state.isLoading = false;
        const { configuration } = action.payload;

        // Update configuration
        state.currentConfiguration = configuration;

        // Sync selectedComponents from the configuration response
        if (configuration.components) {
          state.selectedComponents = configuration.components as any;
        }
      })
      .addCase(removeMultiSelectComponent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to remove component';
      })

      // Validate configuration
      .addCase(validateConfiguration.pending, (state) => {
        state.isValidating = true;
        state.error = null;
      })
      .addCase(validateConfiguration.fulfilled, (state, action) => {
        state.isValidating = false;
        state.validationResult = action.payload;
      })
      .addCase(validateConfiguration.rejected, (state, action) => {
        state.isValidating = false;
        state.error = action.error.message || 'Failed to validate configuration';
      })

      // Toggle build service
      .addCase(toggleBuildService.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(toggleBuildService.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentConfiguration = action.payload.configuration;
        state.includesBuildService = action.payload.configuration.includesBuildService;
        state.buildServiceCharge = action.payload.configuration.buildServiceCharge;

        // Track DIY vs paid service selection separately
        if (action.payload.configuration.includesBuildService) {
          // Paid service selected
          state.selectedBuildServiceId = action.payload.optionId || null;
          state.selectedDiyOptionId = null;
        } else {
          // DIY selected (optionId will contain the DIY option's ID)
          state.selectedDiyOptionId = action.payload.optionId || null;
          state.selectedBuildServiceId = null;
        }
      })
      .addCase(toggleBuildService.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to toggle build service';
      })

      // Calculate price
      .addCase(calculatePrice.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(calculatePrice.fulfilled, (state, action) => {
        state.isLoading = false;
        state.priceBreakdown = action.payload;
      })
      .addCase(calculatePrice.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to calculate price';
      })

      // Save configuration
      .addCase(saveConfiguration.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(saveConfiguration.fulfilled, (state, action) => {
        state.isSaving = false;
        // Update validation result from the save response
        state.validationResult = action.payload;
        // Update configuration status to 'saved' if validation passed
        if (action.payload.isValid && state.currentConfiguration) {
          state.currentConfiguration = {
            ...state.currentConfiguration,
            status: 'saved',
          };
        }
      })
      .addCase(saveConfiguration.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.error.message || 'Failed to save configuration';
      })

      // Export PDF
      .addCase(exportPDF.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(exportPDF.fulfilled, (state) => {
        state.isLoading = false;
        // PDF download is handled by browser
      })
      .addCase(exportPDF.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to export PDF';
      })

      // Checkout configuration
      .addCase(checkoutConfiguration.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(checkoutConfiguration.fulfilled, (state) => {
        state.isLoading = false;
        // Redirect to payment handled by component
      })
      .addCase(checkoutConfiguration.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to checkout configuration';
      })

      // Validate components for display (batch pre-validation)
      .addCase(validateComponentsForDisplay.pending, (state) => {
        state.isValidatingComponents = true;
      })
      .addCase(validateComponentsForDisplay.fulfilled, (state, action) => {
        state.isValidatingComponents = false;
        // Merge new compatibility data with existing
        state.componentCompatibility = {
          ...state.componentCompatibility,
          ...action.payload.compatibilityMap,
        };
      })
      .addCase(validateComponentsForDisplay.rejected, (state) => {
        state.isValidatingComponents = false;
        // Don't set error - component validation failure shouldn't block UI
      });
  },
});

export const {
  setCurrentStep,
  nextStep,
  previousStep,
  setSelectedComponentType,
  showValidationModal,
  hideValidationModal,
  showAlternativesModal,
  hideAlternativesModal,
  setSelectedComponent,
  addToMultiSelectComponent,
  removeFromMultiSelectComponent,
  removeSelectedComponent,
  clearConfiguration,
  clearComponentCompatibility,
  clearError,
  updateValidationResult,
} = pcBuilderSlice.actions;

export default pcBuilderSlice.reducer;
