export interface Banner {
    id: string;
    title_en: string;
    title_sv: string;
    desc_en: string;
    desc_sv: string;
    image_url: string;
    image_file?: string;
    mobile_image_url?: string;
    mobile_image_file?: string;
    is_active: boolean;
}