export interface ServiceCategoryDTO {
  id: string;
  name_en: string;
  name_sv: string;
  displayOrder: number;
  isActive: boolean;
}

export interface CreateServiceCategoryDTO {
  name_en: string;
  name_sv: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface UpdateServiceCategoryDTO {
  name_en?: string;
  name_sv?: string;
  displayOrder?: number;
  isActive?: boolean;
}
