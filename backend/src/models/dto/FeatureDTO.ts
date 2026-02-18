export interface FeatureDTO {
  id: string;
  title_en: string;
  title_sv: string;
  shortDescription_en: string;
  shortDescription_sv: string;
  fullDescription_en: string;
  fullDescription_sv: string;
  iconName: string;
  previewImageUrl?: string;
  previewImageFile?: string;
  displayOrder: number;
  isActive: boolean;
}

export interface CreateFeatureDTO {
  title_en: string;
  title_sv: string;
  shortDescription_en: string;
  shortDescription_sv: string;
  fullDescription_en: string;
  fullDescription_sv: string;
  iconName: string;
  previewImageUrl?: string;
  previewImageFile?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface UpdateFeatureDTO {
  title_en?: string;
  title_sv?: string;
  shortDescription_en?: string;
  shortDescription_sv?: string;
  fullDescription_en?: string;
  fullDescription_sv?: string;
  iconName?: string;
  previewImageUrl?: string;
  previewImageFile?: string;
  displayOrder?: number;
  isActive?: boolean;
}
