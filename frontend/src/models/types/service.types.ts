export interface Service {
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
  isPopular?: boolean;
}

export interface CartItem {
  service: Service;
  quantity: number;
}

export interface PCCartItem {
  preConfiguredPC: {
    id: string;
    name_en?: string;
    name_sv?: string;
    totalPrice: number;
    discountedPrice?: number;
    currency: string;
    imageUrl?: string;
    tier?: string;
    components: any;
    includesBuildService: boolean;
    buildServiceCharge: number;
  };
  quantity: 1;
}

export interface ComponentCartItem {
  component: {
    id: string;
    componentType: string;
    name_en: string;
    name_sv: string;
    manufacturer: string;
    modelNumber?: string;
    price: number;
    currency: string;
    imageUrl?: string;
    stock: number;
  };
  quantity: number;
}
