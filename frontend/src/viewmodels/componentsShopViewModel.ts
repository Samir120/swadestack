import { useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchComponentsByType,
  fetchAllComponents,
  fetchComponentById,
  searchComponents,
  fetchManufacturers,
  setFilters,
  clearFilters,
  setPage,
  clearComponents,
  clearCurrentComponent,
} from '../store/slices/pcComponentsSlice';
import type {
  PCComponent,
  ComponentType,
  ComponentFilters,
  CPUSpecifications,
  GPUSpecifications,
  RAMSpecifications,
  SSDSpecifications,
  PSUSpecifications,
  CaseSpecifications,
  MotherboardSpecifications,
} from '../models/types/pcComponent.types';
import { useVatRate } from '../hooks/useVatRate';
import { netToGross } from '../utils/vat';

const CATEGORY_LABELS: Record<ComponentType, { sv: string; en: string }> = {
  cpu: { sv: 'Processor', en: 'CPU' },
  motherboard: { sv: 'Moderkort', en: 'Motherboard' },
  ram: { sv: 'RAM', en: 'RAM' },
  gpu: { sv: 'Grafikkort', en: 'Graphics Card' },
  ssd: { sv: 'SSD', en: 'SSD' },
  hdd: { sv: 'Hårddisk', en: 'Hard Drive' },
  psu: { sv: 'Nätaggregat', en: 'Power Supply' },
  case: { sv: 'Chassi', en: 'Case' },
  cooling: { sv: 'Kylning', en: 'Cooling' },
  optical: { sv: 'Optisk enhet', en: 'Optical Drive' },
  fan: { sv: 'Fläkt', en: 'Fan' },
  os: { sv: 'Operativsystem', en: 'Operating System' },
};

/**
 * Components Shop ViewModel - Business Logic Layer
 *
 * Custom hook following MVVM pattern for the PC Components shop page.
 * Provides state, actions, and computed properties for browsing,
 * filtering, and viewing PC components.
 */
export const useComponentsShopViewModel = () => {
  const dispatch = useAppDispatch();
  const vatRate = useVatRate();

  const {
    allComponents,
    currentComponent,
    manufacturers,
    total,
    page,
    limit,
    filters,
    isLoading,
    error,
  } = useAppSelector((state) => state.pcComponents);

  const language = useAppSelector((state) => state.ui.language);

  // --- Actions ---

  const loadCategory = useCallback(
    (type: ComponentType) => {
      dispatch(fetchComponentsByType({ componentType: type, filters }));
    },
    [dispatch, filters]
  );

  const loadAll = useCallback(
    (p?: number, l?: number) => {
      dispatch(fetchAllComponents({ page: p, limit: l, filters }));
    },
    [dispatch, filters]
  );

  const loadComponent = useCallback(
    (id: string) => {
      dispatch(fetchComponentById(id));
    },
    [dispatch]
  );

  const search = useCallback(
    (query: string) => {
      dispatch(searchComponents({ query, filters }));
    },
    [dispatch, filters]
  );

  const loadManufacturers = useCallback(
    (type?: ComponentType) => {
      dispatch(fetchManufacturers(type));
    },
    [dispatch]
  );

  const updateFilters = useCallback(
    (newFilters: Partial<ComponentFilters>) => {
      dispatch(setFilters({ ...filters, ...newFilters }));
    },
    [dispatch, filters]
  );

  const resetFilters = useCallback(() => {
    dispatch(clearFilters());
  }, [dispatch]);

  const changePage = useCallback(
    (p: number) => {
      dispatch(setPage(p));
    },
    [dispatch]
  );

  const clearAll = useCallback(() => {
    dispatch(clearComponents());
  }, [dispatch]);

  const clearCurrent = useCallback(() => {
    dispatch(clearCurrentComponent());
  }, [dispatch]);

  // --- Computed ---

  const getComponentName = useCallback(
    (comp: PCComponent): string => {
      return language === 'en' ? comp.name_en : comp.name_sv;
    },
    [language]
  );

  const getComponentDesc = useCallback(
    (comp: PCComponent): string => {
      return language === 'en' ? (comp.desc_en ?? '') : (comp.desc_sv ?? '');
    },
    [language]
  );

  const formatPrice = useCallback(
    (price: number, currency = 'SEK'): string => {
      const gross = netToGross(price, vatRate);
      const formatter = new Intl.NumberFormat('sv-SE', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });
      return formatter.format(gross);
    },
    [vatRate]
  );

  const getCategoryLabel = useCallback(
    (type: ComponentType): string => {
      const label = CATEGORY_LABELS[type];
      return language === 'en' ? label.en : label.sv;
    },
    [language]
  );

  const getSpecSummary = useCallback(
    (comp: PCComponent): string => {
      const specs = comp.specifications;

      switch (comp.componentType) {
        case 'cpu': {
          const s = specs as CPUSpecifications;
          return `${s.cores}C/${s.threads}T @ ${s.boostClock} GHz`;
        }
        case 'gpu': {
          const s = specs as GPUSpecifications;
          return `${s.vram} GB | ${s.chipset}`;
        }
        case 'ram': {
          const s = specs as RAMSpecifications;
          return `${s.capacity}GB x${s.sticks} / ${s.speed} MHz`;
        }
        case 'ssd': {
          const s = specs as SSDSpecifications;
          return `${s.capacity} GB | ${s.ssdType}`;
        }
        case 'psu': {
          const s = specs as PSUSpecifications;
          return `${s.wattage}W | ${s.efficiency}`;
        }
        case 'case': {
          const s = specs as CaseSpecifications;
          return s.formFactor.join(', ');
        }
        case 'motherboard': {
          const s = specs as MotherboardSpecifications;
          return `${s.socket} | ${s.chipset}`;
        }
        default:
          return `${comp.manufacturer}${comp.modelNumber ? ` ${comp.modelNumber}` : ''}`;
      }
    },
    []
  );

  // --- Return ---

  const state = useMemo(
    () => ({
      allComponents,
      currentComponent,
      manufacturers,
      total,
      page,
      limit,
      filters,
      isLoading,
      error,
      language,
    }),
    [allComponents, currentComponent, manufacturers, total, page, limit, filters, isLoading, error, language]
  );

  const actions = useMemo(
    () => ({
      loadCategory,
      loadAll,
      loadComponent,
      search,
      loadManufacturers,
      updateFilters,
      resetFilters,
      changePage,
      clearAll,
      clearCurrent,
    }),
    [loadCategory, loadAll, loadComponent, search, loadManufacturers, updateFilters, resetFilters, changePage, clearAll, clearCurrent]
  );

  const computed = useMemo(
    () => ({
      getComponentName,
      getComponentDesc,
      formatPrice,
      getCategoryLabel,
      getSpecSummary,
    }),
    [getComponentName, getComponentDesc, formatPrice, getCategoryLabel, getSpecSummary]
  );

  return { state, actions, computed };
};

export default useComponentsShopViewModel;
