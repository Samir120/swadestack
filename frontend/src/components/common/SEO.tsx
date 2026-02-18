import { useEffect } from 'react';
import { useAppSelector } from '../../store/hooks';

/**
 * SEO Component - Updates document title and meta tags based on site settings
 * Place this component in App.tsx to update meta tags dynamically
 */
const SEO: React.FC = () => {
  const language = useAppSelector((state) => state.ui.language);
  const { settings } = useAppSelector((state) => state.siteSettings);

  useEffect(() => {
    if (!settings) return;

    // Update page title
    const title = language === 'en' ? settings.metaTitle_en : settings.metaTitle_sv;
    document.title = title;

    // Update meta description
    const description = language === 'en' ? settings.metaDescription_en : settings.metaDescription_sv;
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', description);

    // Update meta keywords
    const keywords = language === 'en' ? settings.metaKeywords_en : settings.metaKeywords_sv;
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', keywords);

    // Update favicon
    if (settings.faviconUrl) {
      let favicon = document.querySelector('link[rel="icon"]');
      if (!favicon) {
        favicon = document.createElement('link');
        favicon.setAttribute('rel', 'icon');
        document.head.appendChild(favicon);
      }
      favicon.setAttribute('href', settings.faviconUrl);
    }
  }, [settings, language]);

  return null; // This component doesn't render anything
};

export default SEO;
