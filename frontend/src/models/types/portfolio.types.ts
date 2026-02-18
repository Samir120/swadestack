export interface PortfolioItem {
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
  thumbnailUrl?: string;
  deviceFrame?: 'desktop' | 'laptop' | 'tablet' | 'mobile' | 'none';
  featured: boolean;
  order: number;
  isPublished: boolean;
  completedDate?: string;
}
