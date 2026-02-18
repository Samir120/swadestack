// Footer Category Title types
export interface FooterCategoryTitle {
  id: string;
  categoryTitle_en: string;
  categoryTitle_sv: string;
  includeBusinessName: boolean;
  displayOrder: number;
  isActive: boolean;
  pages?: FooterMainPage[];
}

export interface CreateFooterCategoryTitle {
  categoryTitle_en: string;
  categoryTitle_sv: string;
  includeBusinessName?: boolean;
  displayOrder?: number;
  isActive?: boolean;
}

export interface UpdateFooterCategoryTitle {
  categoryTitle_en?: string;
  categoryTitle_sv?: string;
  includeBusinessName?: boolean;
  displayOrder?: number;
  isActive?: boolean;
}

// Footer Main Page types
export interface FooterMainPage {
  id: string;
  pageName_en: string;
  pageName_sv: string;
  includeBusinessName: boolean;
  pageUrl: string;
  footerCategoryTitleId: string;
  displayOrder: number;
  availableFrom: string | null;
  availableTo: string | null;
  pageHtmlContent_en: string;
  pageHtmlContent_sv: string;
  isHtmlContent: boolean;
  isActive: boolean;
  category?: FooterCategoryTitle;
}

export interface CreateFooterMainPage {
  pageName_en: string;
  pageName_sv: string;
  includeBusinessName?: boolean;
  pageUrl: string;
  footerCategoryTitleId: string;
  displayOrder?: number;
  availableFrom?: string | null;
  availableTo?: string | null;
  pageHtmlContent_en: string;
  pageHtmlContent_sv: string;
  isHtmlContent?: boolean;
  isActive?: boolean;
}

export interface UpdateFooterMainPage {
  pageName_en?: string;
  pageName_sv?: string;
  includeBusinessName?: boolean;
  pageUrl?: string;
  footerCategoryTitleId?: string;
  displayOrder?: number;
  availableFrom?: string | null;
  availableTo?: string | null;
  pageHtmlContent_en?: string;
  pageHtmlContent_sv?: string;
  isHtmlContent?: boolean;
  isActive?: boolean;
}

// Footer structure for public display
export interface FooterStructure {
  categories: FooterCategoryTitle[];
}
