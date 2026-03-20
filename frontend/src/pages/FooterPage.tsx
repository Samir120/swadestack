import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { useAppSelector } from '../store/hooks';
import { footerApi } from '../models/api/footerApi';
import { FooterMainPage as FooterPageType } from '../models/types/footer.types';
import Header from '../components/common/Header';
import ShoppingCart from '../components/cart/ShoppingCart';
import DynamicFooter from '../components/common/DynamicFooter';
import LoadingSpinner from '../components/common/LoadingSpinner';

/**
 * Sanitise raw HTML from the admin editor:
 * 1. Extract inner <body> content (strip <html>, <head>, <body> wrappers)
 * 2. Strip <style> tags so embedded styles don't leak into the parent page
 * 3. Run through DOMPurify to prevent XSS
 */
const sanitiseHtml = (html: string): string => {
  let content = html;
  // Extract body inner content if full document
  const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) content = bodyMatch[1];
  // Strip <style> blocks
  content = content.replace(/<style[\s\S]*?<\/style>/gi, '');
  // Sanitize against XSS
  return DOMPurify.sanitize(content.trim());
};

const FooterPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const language = useAppSelector((state) => state.ui.language);

  const [page, setPage] = useState<FooterPageType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await footerApi.getPageByUrl(location.pathname);

        if (response.success && response.data) {
          setPage(response.data);
        } else {
          setError('Page not found');
        }
      } catch (err) {
        console.error('Error fetching footer page:', err);
        setError('Failed to load page');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPage();
  }, [location.pathname]);

  const getHtmlContent = () => {
    if (!page) return '';
    const raw = language === 'en' ? page.pageHtmlContent_en : page.pageHtmlContent_sv;
    return page.isHtmlContent ? sanitiseHtml(raw) : raw;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-surface-950 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner className="mb-4" />
          <p className="text-gray-500 dark:text-neutral-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-surface-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="text-center">
            <h1 className="text-4xl font-thin text-gray-800 dark:text-white mb-4">Page Not Found</h1>
            <p className="text-xl text-gray-500 dark:text-neutral-400 mb-8">{error || 'The page you are looking for does not exist.'}</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Go to Home
            </button>
          </div>
        </div>
        <DynamicFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-surface-950">
      {/* Navigation Header */}
      <Header mode="page" />

      {/* Page Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <article className="bg-white rounded-lg shadow-light-md dark:bg-surface-850 dark:shadow-dark-md p-8 md:p-12">
          {/* HTML Content */}
          {page.isHtmlContent ? (
            <div
              className="legal-page-content"
              dangerouslySetInnerHTML={{ __html: getHtmlContent() }}
            />
          ) : (
            <div
              className="prose prose-lg max-w-none dark:prose-invert
                prose-headings:text-gray-900 dark:prose-headings:text-white prose-headings:font-bold
                prose-p:text-gray-700 dark:prose-p:text-neutral-300 prose-p:leading-relaxed
                prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline
                prose-strong:text-gray-900 dark:prose-strong:text-white prose-strong:font-semibold
                prose-ul:text-gray-700 prose-ol:text-gray-700 dark:prose-ul:text-neutral-300 dark:prose-ol:text-neutral-300
                prose-li:text-gray-700 dark:prose-li:text-neutral-300
                prose-blockquote:border-primary-600 prose-blockquote:text-gray-600 dark:prose-blockquote:text-neutral-300
                prose-code:text-primary-600 prose-code:bg-gray-100 dark:prose-code:bg-surface-800 prose-code:px-1 prose-code:rounded
                prose-pre:bg-gray-100 dark:prose-pre:bg-surface-900 prose-pre:text-gray-800 dark:prose-pre:text-neutral-100
                prose-img:rounded-lg prose-img:shadow-light-md dark:prose-img:shadow-dark-md"
              dangerouslySetInnerHTML={{ __html: getHtmlContent() }}
            />
          )}

          {/* Metadata */}
          {(page.availableFrom || page.availableTo) && (
            <div className="mt-12 pt-8 border-t border-gray-200 dark:border-surface-700">
              <div className="text-sm text-gray-500 dark:text-neutral-400">
                {page.availableFrom && (
                  <p>Available from: {new Date(page.availableFrom).toLocaleDateString()}</p>
                )}
                {page.availableTo && (
                  <p>Available until: {new Date(page.availableTo).toLocaleDateString()}</p>
                )}
              </div>
            </div>
          )}
        </article>
      </main>

      {/* Footer */}
      <DynamicFooter />

      {/* Shopping Cart */}
      <ShoppingCart />
    </div>
  );
};

export default FooterPage;
