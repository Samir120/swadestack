export interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  decimalPlaces: number;
  isBaseCurrency: boolean;
  isDisplayCurrency: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExchangeRate {
  id: string;
  baseCurrency: string;
  targetCurrency: string;
  rate: number;
  fetchedAt: string;
}

export interface ExchangeRateStatus {
  rates: ExchangeRate[];
  lastFetchedAt: string | null;
  isStale: boolean;
}

export interface ProfitMarginRule {
  id: string;
  name: string;
  type: 'global' | 'category' | 'product';
  pcComponentId?: string | null;
  componentType?: string | null;
  marginType: 'percentage' | 'flat';
  marginValue: number;
  isActive: boolean;
  pcComponent?: {
    id: string;
    name_en: string;
    name_sv: string;
    componentType: string;
  } | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface PricePreview {
  distributorCost: number;
  costCurrency: string;
  exchangeRate: number;
  costInBaseCurrency: number;
  marginRule: {
    id: string;
    name: string;
    type: string;
    marginType: string;
    marginValue: number;
  } | null;
  marginAmount: number;
  finalPrice: number;
}

export interface RefreshResult {
  updated: number;
  errors: string[];
}

export interface RecalculateResult {
  updated: number;
  skipped: number;
  errors: string[];
}
