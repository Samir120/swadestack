export interface PortfolioDTO {
  id: string;
  title_en: string;
  title_sv: string;
  description_en: string;
  description_sv: string;
  category: string;
  techStack: string[];
  projectUrl?: string;
  imageUrl: string;
  imageFile?: string;
  deviceFrame?: string;
  thumbnailUrl?: string;
  featured: boolean;
  order: number;
  isPublished: boolean;
  completedDate?: Date;
}

export interface CreatePortfolioDTO {
  title_en: string;
  title_sv: string;
  description_en: string;
  description_sv: string;
  category: string;
  techStack: string[];
  projectUrl?: string;
  imageUrl: string;
  imageFile?: string;
  deviceFrame?: string;
  thumbnailUrl?: string;
  featured?: boolean;
  order?: number;
  isPublished?: boolean;
  completedDate?: Date;
}

export interface UpdatePortfolioDTO {
  title_en?: string;
  title_sv?: string;
  description_en?: string;
  description_sv?: string;
  category?: string;
  techStack?: string[];
  projectUrl?: string;
  imageUrl?: string;
  imageFile?: string;
  deviceFrame?: string;
  thumbnailUrl?: string;
  featured?: boolean;
  order?: number;
  isPublished?: boolean;
  completedDate?: Date;
}

export interface PortfolioListDTO {
  items: PortfolioDTO[];
  total: number;
  page: number;
  limit: number;
}
