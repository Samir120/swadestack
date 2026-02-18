export interface ServiceDTO {
  id: string;
  name_en: string;
  name_sv: string;
  desc_en: string;
  desc_sv: string;
  price: number;
  discountPrice?: number | null;
  currency: string;
  features_en?: string[];
  features_sv?: string[];
  excludedFeatures_en?: string[];
  excludedFeatures_sv?: string[];
  category: string;
  serviceCategoryId: string | null;
  serviceCategory?: {
    id: string;
    name_en: string;
    name_sv: string;
    displayOrder: number;
  };
  imageUrl?: string;
  imageFile?: string;
  isActive: boolean;
  isPopular: boolean;
}

export interface CreateServiceDTO {
  name_en: string;
  name_sv: string;
  desc_en: string;
  desc_sv: string;
  price: number;
  discountPrice?: number | null;
  currency?: string;
  features_en?: string[];
  features_sv?: string[];
  excludedFeatures_en?: string[];
  excludedFeatures_sv?: string[];
  category?: string;
  serviceCategoryId?: string;
  imageUrl?: string;
  imageFile?: string;
  isActive?: boolean;
  isPopular?: boolean;
}

export interface UpdateServiceDTO {
  name_en?: string;
  name_sv?: string;
  desc_en?: string;
  desc_sv?: string;
  price?: number;
  discountPrice?: number | null;
  currency?: string;
  features_en?: string[];
  features_sv?: string[];
  excludedFeatures_en?: string[];
  excludedFeatures_sv?: string[];
  category?: string;
  serviceCategoryId?: string;
  imageUrl?: string;
  imageFile?: string;
  isActive?: boolean;
  isPopular?: boolean;
}

export interface ServiceListDTO {
  items: ServiceDTO[];
  total: number;
  page: number;
  limit: number;
}
