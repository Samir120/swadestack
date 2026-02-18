// Validation Types for PC Configuration System

export type RuleSeverity = 'error' | 'warning';

export type RuleType =
  | 'cpu_motherboard'
  | 'motherboard_ram'
  | 'gpu_case'
  | 'psu_power'
  | 'storage_motherboard'
  | 'cooling_cpu';

// Validation Error/Warning

export interface ValidationError {
  type: RuleType;
  severity: RuleSeverity;
  message_en: string;
  message_sv: string;
  affectedComponents: string[]; // Component IDs
  suggestedAlternatives?: string[]; // Alternative component IDs
  additionalInfo?: Record<string, any>; // Extra context (e.g., actual vs required values)
}

// Power Consumption Summary

export interface PowerSummary {
  totalDraw: number; // Total system power draw in watts
  psuWattage: number; // Selected PSU wattage
  headroom: number; // Available headroom (PSU - totalDraw)
  headroomPercentage?: number; // Headroom as percentage (optional - may come from backend as 'percentage')
  percentage?: number; // Alternative name from backend
  recommendedWattage?: number; // Recommended PSU wattage (totalDraw * 1.2)
  componentBreakdown?: PowerBreakdown; // Optional - may not be provided by backend
}

export interface PowerBreakdown {
  cpu: number;
  gpu?: number;
  motherboard: number;
  ram: number;
  storage: number;
  cooling: number;
}

// Validation Result

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[]; // Blocking errors
  warnings: ValidationError[]; // Non-blocking warnings
  powerSummary?: PowerSummary;
  timestamp: string;
}

// Compatibility Status (for UI display)

export interface CompatibilityStatus {
  cpu_motherboard: boolean;
  motherboard_ram: boolean;
  gpu_case: boolean;
  psu_power: boolean;
  storage_motherboard: boolean;
  cooling_cpu: boolean;
}

// Alternative Suggestion

export interface AlternativeSuggestion {
  originalComponentId: string;
  originalComponentName: string;
  incompatibilityReason: string;
  alternatives: {
    componentId: string;
    componentName: string;
    price: number;
    priceDifference: number; // Difference from original
    compatibilityScore: number; // 0-100
  }[];
}

// Validation Request/Response Types

export interface ValidateConfigurationRequest {
  configurationId?: string;
  components: {
    cpu?: string; // Component ID
    motherboard?: string;
    ram?: { id: string; quantity: number };
    gpu?: string;
    storage?: { id: string; quantity: number }[];
    psu?: string;
    case?: string;
    cooling?: string;
  };
}

export interface ValidateConfigurationResponse {
  success: boolean;
  data: ValidationResult;
}

export interface ValidateSelectionRequest {
  configId?: string;
  componentType: string;
  componentId: string;
  quantity?: number;
}

export interface ValidateSelectionResponse {
  success: boolean;
  data: {
    isCompatible: boolean;
    errors: ValidationError[];
    warnings: ValidationError[];
    suggestedAlternatives?: AlternativeSuggestion;
  };
}

// Compatibility Rule (for admin)

export interface PCCompatibilityRule {
  id: string;
  ruleType: RuleType;
  rule: RuleDefinition;
  errorMessage_en: string;
  errorMessage_sv: string;
  severity: RuleSeverity;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface RuleDefinition {
  field1: string; // Path to field in component 1 specs (e.g., "specifications.socket")
  field2: string; // Path to field in component 2 specs
  operator: RuleOperator;
  customValidator?: string; // Custom validation function name
}

export type RuleOperator = 'equals' | 'contains' | 'gte' | 'lte' | 'custom';

// Create/Update Rule DTOs

export interface CreateCompatibilityRuleDTO {
  ruleType: RuleType;
  rule: RuleDefinition;
  errorMessage_en: string;
  errorMessage_sv: string;
  severity: RuleSeverity;
  isActive?: boolean;
}

export interface UpdateCompatibilityRuleDTO extends Partial<CreateCompatibilityRuleDTO> {
  id: string;
}
