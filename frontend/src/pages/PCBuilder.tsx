import React, { useEffect, useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '../components/common/Toast';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  createConfiguration,
  loadConfiguration,
  addComponent,
  removeComponent,
  addMultiSelectComponent,
  removeMultiSelectComponent,
  validateConfiguration,
  validateComponentsForDisplay,
  saveConfiguration,
  toggleBuildService,
  calculatePrice,
  setCurrentStep,
  clearConfiguration,
  clearComponentCompatibility,
  clearError,
} from '../store/slices/pcBuilderSlice';
import { pcConfigurationApi } from '../models/api/pcConfigurationApi';
import { fetchComponentsByType } from '../store/slices/pcComponentsSlice';
import { fetchBuildServiceOptions } from '../store/slices/pcBuildServicesSlice';
import { ComponentType, PCComponent, isMultiSelectType, MotherboardSpecifications } from '../models/types/pcComponent.types';
import Header from '../components/common/Header';
import DynamicFooter from '../components/common/DynamicFooter';
import ComponentGrid from '../components/pcbuilder/ComponentGrid';
import BuilderSidebar from '../components/pcbuilder/BuilderSidebar';
import CompatibilityStatus from '../components/pcbuilder/CompatibilityStatus';
import PowerConsumptionGauge from '../components/pcbuilder/PowerConsumptionGauge';
import CurrentSelectionDisplay from '../components/pcbuilder/CurrentSelectionDisplay';
import BuildServiceSelector from '../components/pcbuilder/BuildServiceSelector';
// Component steps configuration - supports multiple selection for slot-based components
// conditionallyRequired: true means at least one SSD or HDD is required for professional build service
const COMPONENT_STEPS: { type: ComponentType; labelKey: string; required: boolean; multiSelect?: boolean; conditionallyRequired?: boolean }[] = [
  { type: 'cpu', labelKey: 'pcBuilder.steps.cpu', required: true },
  { type: 'motherboard', labelKey: 'pcBuilder.steps.motherboard', required: true },
  { type: 'ram', labelKey: 'pcBuilder.steps.ram', required: true, multiSelect: true }, // Based on motherboard RAM slots
  { type: 'gpu', labelKey: 'pcBuilder.steps.gpu', required: false, multiSelect: true }, // Based on motherboard PCI slots
  { type: 'ssd', labelKey: 'pcBuilder.steps.ssd', required: false, multiSelect: true, conditionallyRequired: true }, // NVMe uses nvmeSlots, SATA uses sataSlots - required for build service
  { type: 'hdd', labelKey: 'pcBuilder.steps.hdd', required: false, multiSelect: true, conditionallyRequired: true }, // Based on motherboard SATA slots - required for build service
  { type: 'psu', labelKey: 'pcBuilder.steps.psu', required: true },
  { type: 'case', labelKey: 'pcBuilder.steps.case', required: true },
  { type: 'cooling', labelKey: 'pcBuilder.steps.cooling', required: false },
  { type: 'optical', labelKey: 'pcBuilder.steps.optical', required: false }, // DVD/Blu-Ray drive
  { type: 'fan', labelKey: 'pcBuilder.steps.fan', required: false, multiSelect: true }, // Case fans
  { type: 'os', labelKey: 'pcBuilder.steps.os', required: false }, // Operating system
];

const PCBuilder: React.FC = () => {
  const toast = useToast();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Get configuration ID from URL query parameter
  const configIdFromUrl = searchParams.get('config');

  // Auth state
  const { isAuthenticated, isLoading: authLoading } = useAppSelector((state) => state.auth);
  const language = useAppSelector((state) => state.ui.language);

  // PC Builder state
  const {
    currentConfiguration,
    selectedComponents,
    validationResult,
    priceBreakdown,
    currentStep,
    includesBuildService,
    selectedBuildServiceId,
    selectedDiyOptionId,
    isSaving,
    error,
    componentCompatibility,
    isValidatingComponents,
  } = useAppSelector((state) => state.pcBuilder);

  // PC Components state
  const { components, isLoading: componentsLoading } = useAppSelector(
    (state) => state.pcComponents
  );

  // Build Services state
  const { options: buildServiceOptions } = useAppSelector((state) => state.pcBuildServices);

  // Local state
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [isBuildServiceView, setIsBuildServiceView] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Ref for main content area to scroll to top
  const mainContentRef = useRef<HTMLDivElement>(null);

  // Track config id/status for cleanup on unmount
  const configRef = useRef<{ id: string; status: string } | null>(null);

  // Current step configuration
  const currentStepConfig = COMPONENT_STEPS[currentStep];
  const currentComponentType = currentStepConfig?.type;

  // Get current step components (defined early for use in useEffects)
  const currentComponents = currentComponentType ? components[currentComponentType] || [] : [];

  // Load build service options on mount
  useEffect(() => {
    dispatch(fetchBuildServiceOptions());
  }, [dispatch]);

  // Load components for current step and clear compatibility cache
  useEffect(() => {
    if (currentComponentType) {
      // Clear compatibility cache when changing steps
      dispatch(clearComponentCompatibility());
      dispatch(fetchComponentsByType({ componentType: currentComponentType }));
    }
  }, [currentComponentType, dispatch]);

  // Load existing configuration from URL or create new one
  useEffect(() => {
    if (authLoading) return;

    // If there's a config ID in URL, load that configuration
    if (configIdFromUrl && isAuthenticated) {
      // Only load if we don't already have this configuration
      if (!currentConfiguration || currentConfiguration.id !== configIdFromUrl) {
        dispatch(loadConfiguration(configIdFromUrl));
      }
    } else if (isAuthenticated && !currentConfiguration) {
      // No config ID in URL, create a new configuration
      dispatch(createConfiguration());
    }
  }, [authLoading, isAuthenticated, configIdFromUrl, currentConfiguration, dispatch]);

  // Keep configRef in sync with current configuration
  useEffect(() => {
    if (currentConfiguration) {
      configRef.current = { id: currentConfiguration.id, status: currentConfiguration.status };
    }
  }, [currentConfiguration]);

  // Cleanup draft on unmount - delete if user never saved
  useEffect(() => {
    return () => {
      if (configRef.current && configRef.current.status === 'draft') {
        // Fire-and-forget delete of abandoned draft
        pcConfigurationApi.delete(configRef.current.id).catch(() => {});
      }
    };
  }, []);

  // Auto-validate when components change
  useEffect(() => {
    if (currentConfiguration?.id && Object.keys(selectedComponents).length > 1) {
      dispatch(validateConfiguration(currentConfiguration.id));
    }
  }, [selectedComponents, currentConfiguration?.id, dispatch]);

  // Calculate price when components change
  useEffect(() => {
    if (currentConfiguration?.id && Object.keys(selectedComponents).length > 0) {
      dispatch(calculatePrice(currentConfiguration.id));
    }
  }, [selectedComponents, includesBuildService, currentConfiguration?.id, dispatch]);

  // Pre-validate components for display when components are loaded
  useEffect(() => {
    // Only validate if we have a configuration and components to display
    // Use currentComponents (the array for current type) not components (the full object)
    if (currentConfiguration?.id && currentComponents.length > 0 && currentComponentType) {
      const componentIds = currentComponents.map(c => c.id);
      dispatch(validateComponentsForDisplay({
        configId: currentConfiguration.id,
        componentType: currentComponentType,
        componentIds,
      }));
    }
  }, [currentConfiguration?.id, currentComponents, currentComponentType, selectedComponents, dispatch]);

  // Show error toast - but NOT for compatibility errors (those are shown inline now)
  useEffect(() => {
    if (error) {
      // Only show toast for non-compatibility errors
      // Compatibility errors contain specific messages like "incompatible", "slot", "RAM kit", etc.
      const isCompatibilityError =
        error.toLowerCase().includes('incompatible') ||
        error.toLowerCase().includes('slot') ||
        error.toLowerCase().includes('socket') ||
        error.toLowerCase().includes('ram kit') ||
        error.toLowerCase().includes('exceed');

      if (!isCompatibilityError) {
        toast.error(error);
      }
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Handle component selection
  const handleSelectComponent = async (component: PCComponent, quantity?: number) => {
    // Wait for auth to finish loading before checking
    if (authLoading) {
      return;
    }

    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }

    const isMultiSelect = currentStepConfig?.multiSelect;

    // Ensure we have a configuration first
    let configId = currentConfiguration?.id;
    if (!configId) {
      const result = await dispatch(createConfiguration());
      if (createConfiguration.fulfilled.match(result)) {
        configId = result.payload.id;
      } else {
        return; // Failed to create configuration
      }
    }

    // For multi-select components, add to the array via API
    if (isMultiSelect && isMultiSelectType(currentComponentType)) {
      const multiType = currentComponentType as 'ram' | 'gpu' | 'ssd' | 'hdd' | 'fan';

      // Calculate next slot index
      let nextSlotIndex = 0;
      const pluralKey = `${multiType}s` as keyof typeof selectedComponents;
      const existingComponents = selectedComponents[pluralKey];
      if (Array.isArray(existingComponents) && existingComponents.length > 0) {
        const maxSlot = Math.max(...existingComponents.map((c: any) => c.slotIndex));
        nextSlotIndex = maxSlot + 1;
      }

      // Determine slotType for SSDs
      let slotType: 'nvme' | 'sata' | undefined;
      if (multiType === 'ssd') {
        const ssdSpecs = component.specifications as any;
        slotType = ssdSpecs?.ssdType === 'NVMe' ? 'nvme' : 'sata';
      }

      // Call API to add multi-select component
      dispatch(addMultiSelectComponent({
        configId,
        componentType: multiType,
        component,
        slotIndex: nextSlotIndex,
        slotType,
      }));
      return;
    }

    // For single-select components
    dispatch(
      addComponent({
        configId,
        componentType: currentComponentType,
        component,
        quantity,
      })
    );
  };

  // Handle component removal (single-select types)
  const handleRemoveComponent = (componentType: ComponentType) => {
    if (currentConfiguration?.id) {
      dispatch(
        removeComponent({
          configId: currentConfiguration.id,
          componentType,
        })
      );
    }
  };

  // Handle multi-select component removal (by slot index)
  const handleRemoveMultiSelectComponent = (componentType: 'ram' | 'gpu' | 'ssd' | 'hdd' | 'fan', slotIndex: number) => {
    if (currentConfiguration?.id) {
      dispatch(removeMultiSelectComponent({
        configId: currentConfiguration.id,
        componentType,
        slotIndex,
      }));
    }
  };

  // Handle "Add More" for multi-select components - navigates to the step
  const handleAddMore = (componentType: ComponentType) => {
    const stepIndex = COMPONENT_STEPS.findIndex(s => s.type === componentType);
    if (stepIndex !== -1) {
      dispatch(setCurrentStep(stepIndex));
    }
  };

  // Handle build service toggle
  const handleToggleBuildService = (enabled: boolean, optionId?: string) => {
    if (currentConfiguration?.id) {
      dispatch(toggleBuildService({ configId: currentConfiguration.id, enabled, optionId }));
    }
  };

  // Find selected build service option
  const selectedBuildService = selectedBuildServiceId
    ? buildServiceOptions.find((opt) => opt.id === selectedBuildServiceId)
    : buildServiceOptions.find((opt) => opt.isDefault);

  // Handle save configuration
  const handleSaveConfiguration = async () => {
    if (authLoading) return;

    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }

    if (!currentConfiguration?.id) return;

    const result = await dispatch(saveConfiguration(currentConfiguration.id));

    if (saveConfiguration.fulfilled.match(result)) {
      const validationResult = result.payload;
      if (validationResult.isValid) {
        // Update ref so cleanup doesn't delete a saved config
        configRef.current = { id: currentConfiguration.id, status: 'saved' };
        toast.success(
          language === 'en'
            ? 'Configuration saved to your dashboard!'
            : 'Konfiguration sparad till din instrumentpanel!'
        );
        navigate('/dashboard');
      } else {
        // Show validation errors
        toast.error(
          language === 'en'
            ? 'Configuration has compatibility issues. Please fix them before saving.'
            : 'Konfigurationen har kompatibilitetsproblem. Åtgärda dem innan du sparar.'
        );
      }
    } else {
      toast.error(
        language === 'en'
          ? 'Failed to save configuration'
          : 'Kunde inte spara konfigurationen'
      );
    }
  };

  // Handle add to cart / checkout
  const handleCheckout = async () => {
    if (authLoading) return;

    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }

    if (!currentConfiguration?.id) return;

    if (!validationResult?.isValid) {
      toast.error(
        language === 'en'
          ? 'Please fix compatibility issues before checkout'
          : 'Vänligen åtgärda kompatibilitetsproblem innan du går till kassan'
      );
      return;
    }

    // Save the configuration first so it's not deleted on unmount
    const result = await dispatch(saveConfiguration(currentConfiguration.id));
    if (saveConfiguration.fulfilled.match(result) && result.payload.isValid) {
      configRef.current = { id: currentConfiguration.id, status: 'saved' };
      navigate('/checkout', { state: { configurationId: currentConfiguration.id } });
    } else {
      toast.error(
        language === 'en'
          ? 'Failed to save configuration before checkout'
          : 'Kunde inte spara konfigurationen innan kassan'
      );
    }
  };

  // Handle start over
  const handleStartOver = () => {
    // Delete old draft config before starting fresh
    if (currentConfiguration?.id && currentConfiguration.status === 'draft') {
      pcConfigurationApi.delete(currentConfiguration.id).catch(() => {});
    }
    dispatch(clearConfiguration());
    // Reset ref so cleanup doesn't try to delete the already-deleted config
    configRef.current = null;
    if (isAuthenticated) {
      dispatch(createConfiguration());
    }
  };

  // Get selected component for single-select types
  const selectedSingleComponent = !currentStepConfig?.multiSelect && currentComponentType
    ? selectedComponents[currentComponentType as keyof typeof selectedComponents] as PCComponent | undefined
    : undefined;

  // Get available slots based on motherboard specifications
  const getAvailableSlots = (componentType: ComponentType): number => {
    const motherboard = selectedComponents.motherboard;
    if (!motherboard) return 0;

    const specs = motherboard.specifications as MotherboardSpecifications;

    switch (componentType) {
      case 'ram': {
        // Count actual sticks used, not just products (a 2x16GB kit uses 2 slots)
        const usedRamSlots = selectedComponents.rams?.reduce((acc, ram) => {
          const ramSpecs = ram.specifications as any;
          return acc + (ramSpecs.sticks || 1);
        }, 0) || 0;
        return Math.max(0, (specs.ramSlots || 4) - usedRamSlots);
      }
      case 'gpu': {
        // Count PCI slots occupied by each GPU (some GPUs take 2-3 slots)
        const usedPciSlots = selectedComponents.gpus?.reduce((acc, g) => acc + ((g.specifications as any).pciSlots || 1), 0) || 0;
        return Math.max(0, (specs.pciSlots || 2) - usedPciSlots);
      }
      case 'ssd': {
        const usedNvmeSlots = selectedComponents.ssds?.filter(s => s.slotType === 'nvme').length || 0;
        const usedSataSsds = selectedComponents.ssds?.filter(s => s.slotType === 'sata').length || 0;
        const usedSataByHdds = selectedComponents.hdds?.length || 0;
        return Math.max(0, (specs.nvmeSlots || 2) - usedNvmeSlots) + Math.max(0, (specs.sataSlots || 4) - usedSataSsds - usedSataByHdds);
      }
      case 'hdd': {
        const usedSataSlots = (selectedComponents.ssds?.filter(s => s.slotType === 'sata').length || 0) + (selectedComponents.hdds?.length || 0);
        return Math.max(0, (specs.sataSlots || 4) - usedSataSlots);
      }
      case 'fan': {
        // Fans typically have more slots available in the case
        const pcCase = selectedComponents.case;
        if (pcCase) {
          const caseSpecs = pcCase.specifications as any;
          const usedFanSlots = selectedComponents.fans?.length || 0;
          return Math.max(0, (caseSpecs.fanSlots || 6) - usedFanSlots);
        }
        return 6; // Default fan slots
      }
      default:
        return 0;
    }
  };

  // Component labels for display
  const COMPONENT_LABELS: Record<ComponentType, { en: string; sv: string }> = {
    cpu: { en: 'Processor', sv: 'Processor' },
    motherboard: { en: 'Motherboard', sv: 'Moderkort' },
    ram: { en: 'Memory (RAM)', sv: 'Internminne (RAM)' },
    gpu: { en: 'Graphics Card', sv: 'Grafikkort' },
    ssd: { en: 'SSD Storage', sv: 'Hårddisk SSD' },
    hdd: { en: 'HDD Storage', sv: 'Hårddisk HDD' },
    psu: { en: 'Power Supply', sv: 'Nätaggregat' },
    case: { en: 'Case', sv: 'Chassi' },
    cooling: { en: 'CPU Cooler', sv: 'CPU Kylare' },
    optical: { en: 'Optical Drive', sv: 'Optisk Enhet' },
    fan: { en: 'Case Fans', sv: 'Chassifläktar' },
    os: { en: 'Operating System', sv: 'Operativsystem' },
  };

  // Get label for current component type
  const getCurrentLabel = () => {
    if (!currentComponentType) return '';
    return language === 'en'
      ? COMPONENT_LABELS[currentComponentType].en
      : COMPONENT_LABELS[currentComponentType].sv;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-surface-950 flex flex-col">
      <Header />

      {/* Main Content - Full Width with header offset */}
      <main className="w-full pt-20 flex-1">
        {/* Mobile Price Bar & Toggle - Only visible on mobile */}
        <div className="md:hidden sticky top-14 sm:top-16 z-40 bg-white dark:bg-surface-900 text-gray-900 dark:text-white px-3 py-2.5 flex items-center justify-between shadow-light-md dark:shadow-dark-md">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-2 hover:bg-gray-200 dark:hover:bg-surface-700 rounded-lg transition-colors active:scale-95"
            aria-label="Open menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-neutral-400 hidden xs:inline">
              {language === 'en' ? 'Total:' : 'Totalt:'}
            </span>
            <span className="font-bold text-base text-primary-600 dark:text-primary-400">
              {priceBreakdown?.grandTotal ? (priceBreakdown.grandTotal * 1.25).toLocaleString('sv-SE', { style: 'currency', currency: 'SEK', minimumFractionDigits: 0 }) : '0 kr'}
            </span>
          </div>
          <button
            onClick={handleCheckout}
            className="px-3 py-1.5 bg-primary-600 text-white rounded-lg text-xs font-bold hover:bg-primary-500 active:scale-[0.98] transition-all"
          >
            {language === 'en' ? 'Checkout' : 'Kassa'}
          </button>
        </div>

        {/* Mobile Sidebar Overlay */}
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            {/* Sidebar Panel */}
            <div className="absolute left-0 top-0 h-full w-[280px] max-w-[85vw] bg-white dark:bg-surface-900 overflow-y-auto shadow-light-xl dark:shadow-dark-xl transform transition-transform duration-300 ease-out">
              {/* Close Button */}
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="absolute top-3 right-3 p-2 text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-surface-700 rounded-lg transition-colors z-10 active:scale-95"
                aria-label="Close menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <BuilderSidebar
                selectedComponents={selectedComponents}
                priceBreakdown={priceBreakdown}
                validationResult={validationResult}
                includesBuildService={includesBuildService}
                buildServiceOptions={buildServiceOptions}
                selectedBuildService={selectedBuildService}
                selectedDiyOptionId={selectedDiyOptionId || undefined}
                onToggleBuildService={handleToggleBuildService}
                onRemoveComponent={handleRemoveComponent}
                onRemoveMultiSelectComponent={handleRemoveMultiSelectComponent}
                onCategoryClick={(type) => {
                  const stepIndex = COMPONENT_STEPS.findIndex(s => s.type === type);
                  if (stepIndex !== -1) {
                    dispatch(setCurrentStep(stepIndex));
                    setIsBuildServiceView(false);
                    setIsMobileSidebarOpen(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    if (mainContentRef.current) {
                      mainContentRef.current.scrollTop = 0;
                    }
                  }
                }}
                onBuildServiceClick={() => {
                  setIsBuildServiceView(true);
                  setIsMobileSidebarOpen(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  if (mainContentRef.current) {
                    mainContentRef.current.scrollTop = 0;
                  }
                }}
                isBuildServiceView={isBuildServiceView}
                onAddMore={handleAddMore}
                onSave={handleSaveConfiguration}
                onCheckout={handleCheckout}
                onStartOver={handleStartOver}
                currentStep={currentStep}
                componentSteps={COMPONENT_STEPS}
                isAuthenticated={isAuthenticated}
                isSaving={isSaving}
                language={language}
                availableSlots={{
                  ram: getAvailableSlots('ram'),
                  gpu: getAvailableSlots('gpu'),
                  ssd: getAvailableSlots('ssd'),
                  hdd: getAvailableSlots('hdd'),
                  fan: getAvailableSlots('fan'),
                }}
              />
            </div>
          </div>
        )}

        {/* Builder Layout - Sidebar + Content */}
        <div className="flex flex-col md:flex-row min-h-[calc(100vh-80px)]">
          {/* Left Sidebar - Component Categories - Hidden on mobile, visible on md+ */}
          <div className="hidden md:block md:w-72 lg:w-80 flex-shrink-0">
            <div className="sticky top-20 h-[calc(100vh-80px)] overflow-y-auto">
              <BuilderSidebar
                selectedComponents={selectedComponents}
                priceBreakdown={priceBreakdown}
                validationResult={validationResult}
                includesBuildService={includesBuildService}
                buildServiceOptions={buildServiceOptions}
                selectedBuildService={selectedBuildService}
                selectedDiyOptionId={selectedDiyOptionId || undefined}
                onToggleBuildService={handleToggleBuildService}
                onRemoveComponent={handleRemoveComponent}
                onRemoveMultiSelectComponent={handleRemoveMultiSelectComponent}
                onCategoryClick={(type) => {
                  const stepIndex = COMPONENT_STEPS.findIndex(s => s.type === type);
                  if (stepIndex !== -1) {
                    dispatch(setCurrentStep(stepIndex));
                    setIsBuildServiceView(false);
                    // Scroll to top - try both window and element
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    if (mainContentRef.current) {
                      mainContentRef.current.scrollTop = 0;
                    }
                  }
                }}
                onBuildServiceClick={() => {
                  setIsBuildServiceView(true);
                  // Scroll to top - try both window and element
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  if (mainContentRef.current) {
                    mainContentRef.current.scrollTop = 0;
                  }
                }}
                isBuildServiceView={isBuildServiceView}
                onAddMore={handleAddMore}
                onSave={handleSaveConfiguration}
                onCheckout={handleCheckout}
                onStartOver={handleStartOver}
                currentStep={currentStep}
                componentSteps={COMPONENT_STEPS}
                isAuthenticated={isAuthenticated}
                isSaving={isSaving}
                language={language}
                availableSlots={{
                  ram: getAvailableSlots('ram'),
                  gpu: getAvailableSlots('gpu'),
                  ssd: getAvailableSlots('ssd'),
                  hdd: getAvailableSlots('hdd'),
                  fan: getAvailableSlots('fan'),
                }}
              />
            </div>
          </div>

          {/* Right Content Area - Component Selection or Build Service */}
          <div ref={mainContentRef} className="flex-1 p-4 sm:p-6 md:p-8 lg:p-10 overflow-y-auto md:h-[calc(100vh-80px)]">
            <AnimatePresence mode="wait">
              {isBuildServiceView ? (
                /* Build Service View */
                <motion.div
                  key="build-service"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Page Header */}
                  <div className="mb-8 sm:mb-10">
                    <div className="flex items-center gap-2 sm:gap-3 mb-2">
                      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-thin text-gray-800 dark:text-white">
                        {language === 'en' ? 'Build Service' : 'Byggservice'}
                      </h1>
                    </div>
                    <p className="text-sm sm:text-base text-gray-400 dark:text-neutral-500">
                      {language === 'en'
                        ? 'Choose how you want your PC built'
                        : 'Välj hur du vill ha din dator byggd'}
                    </p>
                  </div>

                  {/* Build Service Options - Full width cards */}
                  <div className="max-w-3xl">
                    <BuildServiceSelector
                      options={buildServiceOptions}
                      selectedOption={selectedBuildService}
                      selectedDiyOptionId={selectedDiyOptionId || undefined}
                      includesBuildService={includesBuildService}
                      onToggle={handleToggleBuildService}
                      totalPrice={priceBreakdown?.componentsTotal || 0}
                      language={language}
                      hasStorage={(selectedComponents.ssds?.length || 0) > 0 || (selectedComponents.hdds?.length || 0) > 0}
                      variant="full"
                    />
                  </div>
                </motion.div>
              ) : (
                /* Component Selection View */
                <motion.div
                  key={`component-${currentComponentType}`}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Page Header */}
                  <div className="mb-8 sm:mb-10">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-thin text-gray-800 dark:text-white">
                        {getCurrentLabel()}
                      </h1>
                      {currentStepConfig?.required && (
                        <span className="px-2.5 py-1 text-[10px] sm:text-xs font-semibold bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 rounded-full border border-red-200 dark:border-red-500/20">
                          {language === 'en' ? 'Required' : 'Obligatorisk'}
                        </span>
                      )}
                      {currentStepConfig?.conditionallyRequired && !currentStepConfig?.required && (
                        <span className="px-2.5 py-1 text-[10px] sm:text-xs font-semibold bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 rounded-full border border-yellow-200 dark:border-yellow-500/20">
                          {language === 'en' ? 'For Build Service' : 'För byggservice'}
                        </span>
                      )}
                    </div>
                    <p className="text-sm sm:text-base text-gray-400 dark:text-neutral-500">
                      {language === 'en'
                        ? `Choose a ${getCurrentLabel().toLowerCase()} for your build`
                        : `Välj ${getCurrentLabel().toLowerCase()} för ditt bygge`}
                    </p>
                  </div>

                  {/* Compatibility Status & Power Gauge Row */}
                  <div className="flex flex-col lg:flex-row gap-4 sm:gap-5 mb-6 sm:mb-8">
                    {/* Compatibility Status */}
                    {validationResult && (
                      <div className="flex-1">
                        <CompatibilityStatus
                          validationResult={validationResult}
                          language={language}
                        />
                      </div>
                    )}

                    {/* Power Consumption */}
                    {validationResult?.powerSummary && (
                      <div className="lg:w-80">
                        <PowerConsumptionGauge
                          powerSummary={validationResult.powerSummary}
                          language={language}
                        />
                      </div>
                    )}
                  </div>

                  {/* Your Selection Section - Shows selected components for current category */}
                  {currentComponentType && (
                    <CurrentSelectionDisplay
                      componentType={currentComponentType}
                      isMultiSelect={currentStepConfig?.multiSelect || false}
                      selectedComponents={selectedComponents}
                      onRemove={handleRemoveComponent}
                      onRemoveMultiSelect={handleRemoveMultiSelectComponent}
                      onAddMore={() => {/* Already on this page */}}
                      language={language}
                      availableSlots={currentStepConfig?.multiSelect ? getAvailableSlots(currentComponentType) : 0}
                    />
                  )}

                  {/* Component Grid */}
                  <ComponentGrid
                    components={currentComponents}
                    selectedComponent={selectedSingleComponent}
                    componentType={currentComponentType}
                    onSelect={handleSelectComponent}
                    onRemove={() => currentComponentType && handleRemoveComponent(currentComponentType)}
                    isLoading={componentsLoading}
                    language={language}
                    validationResult={validationResult}
                    isMultiSelect={currentStepConfig?.multiSelect}
                    availableSlots={currentStepConfig?.multiSelect ? getAvailableSlots(currentComponentType) : undefined}
                    componentCompatibility={componentCompatibility}
                    isValidatingComponents={isValidatingComponents}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Login Prompt Modal - Above header */}
      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-[60] p-0 sm:p-4">
          <div className="bg-white dark:bg-surface-850 rounded-t-2xl sm:rounded-xl p-5 sm:p-6 w-full sm:max-w-md">
            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-800 dark:text-white">
              {language === 'en' ? 'Login Required' : 'Inloggning krävs'}
            </h3>
            <p className="text-sm sm:text-base text-gray-500 dark:text-neutral-400 mb-5 sm:mb-6">
              {language === 'en'
                ? 'You need to be logged in to save your PC configuration. Would you like to log in now?'
                : 'Du måste vara inloggad för att spara din datorkonfiguration. Vill du logga in nu?'}
            </p>
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={() => setShowLoginPrompt(false)}
                className="flex-1 px-4 py-2.5 sm:py-2 border border-gray-300 dark:border-surface-600 rounded-xl sm:rounded-lg text-gray-700 dark:text-neutral-300 font-bold text-sm hover:bg-gray-200 dark:hover:bg-surface-700 active:scale-[0.98] transition-all"
              >
                {language === 'en' ? 'Cancel' : 'Avbryt'}
              </button>
              <button
                onClick={() => navigate('/login', { state: { from: '/pc-builder' } })}
                className="flex-1 px-4 py-2.5 sm:py-2 bg-primary-600 text-white rounded-xl sm:rounded-lg font-bold text-sm hover:bg-primary-500 active:scale-[0.98] transition-all"
              >
                {language === 'en' ? 'Log In' : 'Logga in'}
              </button>
            </div>
          </div>
        </div>
      )}

      <DynamicFooter />
    </div>
  );
};

export default PCBuilder;
