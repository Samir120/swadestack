// Footer Category Title DTOs
export interface FooterCategoryTitleDTO {
  id: string;
  categoryTitle_en: string;
  categoryTitle_sv: string;
  includeBusinessName: boolean;
  displayOrder: number;
  isActive: boolean;
  pages?: FooterMainPageDTO[];
}

export interface CreateFooterCategoryTitleDTO {
  categoryTitle_en: string;
  categoryTitle_sv: string;
  includeBusinessName?: boolean;
  displayOrder?: number;
  isActive?: boolean;
}

export interface UpdateFooterCategoryTitleDTO {
  categoryTitle_en?: string;
  categoryTitle_sv?: string;
  includeBusinessName?: boolean;
  displayOrder?: number;
  isActive?: boolean;
}

// Footer Main Page DTOs
export interface FooterMainPageDTO {
  id: string;
  pageName_en: string;
  pageName_sv: string;
  includeBusinessName: boolean;
  pageUrl: string;
  footerCategoryTitleId: string;
  displayOrder: number;
  availableFrom: Date | null;
  availableTo: Date | null;
  pageHtmlContent_en: string;
  pageHtmlContent_sv: string;
  isHtmlContent: boolean;
  isActive: boolean;
  category?: FooterCategoryTitleDTO;
}

export interface CreateFooterMainPageDTO {
  pageName_en: string;
  pageName_sv: string;
  includeBusinessName?: boolean;
  pageUrl: string;
  footerCategoryTitleId: string;
  displayOrder?: number;
  availableFrom?: Date | null;
  availableTo?: Date | null;
  pageHtmlContent_en: string;
  pageHtmlContent_sv: string;
  isHtmlContent?: boolean;
  isActive?: boolean;
}

export interface UpdateFooterMainPageDTO {
  pageName_en?: string;
  pageName_sv?: string;
  includeBusinessName?: boolean;
  pageUrl?: string;
  footerCategoryTitleId?: string;
  displayOrder?: number;
  availableFrom?: Date | null;
  availableTo?: Date | null;
  pageHtmlContent_en?: string;
  pageHtmlContent_sv?: string;
  isHtmlContent?: boolean;
  isActive?: boolean;
}

// Footer structure for public API
export interface FooterStructureDTO {
  categories: FooterCategoryTitleDTO[];
}
