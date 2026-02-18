export interface TeamMember {
  id: string;
  name_en: string;
  name_sv: string;
  role_en: string;
  role_sv: string;
  bio_en: string;
  bio_sv: string;
  image_url: string;
  image_file?: string;
  linkedin_url?: string;
  sort_order: number;
  is_active: boolean;
}
