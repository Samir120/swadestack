import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { fetchFooterStructure } from '../../store/slices/footerSlice';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaYoutube, FaGithub } from 'react-icons/fa';
import { HiMail, HiPhone, HiLocationMarker } from 'react-icons/hi';

const DynamicFooter: React.FC = () => {
  const dispatch = useAppDispatch();
  const language = useAppSelector((state) => state.ui.language);
  const { settings } = useAppSelector((state) => state.siteSettings);
  const { settings: legalSettings } = useAppSelector((state) => state.legalSettings);
  const { footerStructure } = useAppSelector((state) => state.footer);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    dispatch(fetchFooterStructure());
  }, [dispatch]);

  const siteName = settings
    ? (language === 'en' ? settings.siteName_en : settings.siteName_sv)
    : 'Portfolio';

  const description = settings
    ? (language === 'en' ? settings.footerDescription_en : settings.footerDescription_sv)
    : 'Professional web design and development services for modern businesses.';

  const tradingNameDisplay = legalSettings?.tradingName || legalSettings?.companyName || siteName;
  const copyright = `© ${currentYear} ${tradingNameDisplay}. All rights reserved.`;

  const email = settings?.email || 'info@example.com';
  const phone = settings?.phone || '+46 123 456 789';
  const address = settings?.address || 'Street Address';
  const city = settings?.city || 'Stockholm';
  const country = settings?.country || 'Sweden';
  const postalCode = settings?.postalCode || '12345';

  const socialLinks = [
    { url: settings?.facebookUrl, Icon: FaFacebook, name: 'Facebook' },
    { url: settings?.twitterUrl, Icon: FaTwitter, name: 'Twitter' },
    { url: settings?.instagramUrl, Icon: FaInstagram, name: 'Instagram' },
    { url: settings?.linkedinUrl, Icon: FaLinkedin, name: 'LinkedIn' },
    { url: settings?.youtubeUrl, Icon: FaYoutube, name: 'YouTube' },
    { url: settings?.githubUrl, Icon: FaGithub, name: 'GitHub' },
  ].filter(link => link.url && link.url.trim() !== '');

  const getCategoryTitle = (category: any) => {
    const title = language === 'en' ? category.categoryTitle_en : category.categoryTitle_sv;
    return category.includeBusinessName ? `${siteName} - ${title}` : title;
  };

  const getPageName = (page: any) => {
    const name = language === 'en' ? page.pageName_en : page.pageName_sv;
    return page.includeBusinessName ? `${siteName} - ${name}` : name;
  };

  const renderPageLink = (page: any) => {
    const pageName = getPageName(page);
    const isExternal = page.pageUrl.startsWith('http://') || page.pageUrl.startsWith('https://');
    const linkClass = "text-sm text-slate-400 hover:text-white hover:translate-x-0.5 transition-all duration-200 inline-block";

    if (isExternal) {
      return (
        <a key={page.id} href={page.pageUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>
          {pageName}
        </a>
      );
    }

    return (
      <Link key={page.id} to={page.pageUrl} className={linkClass}>
        {pageName}
      </Link>
    );
  };

  return (
    <footer className="relative mt-auto">
      {/* Top accent line */}
      <div className="h-px bg-gradient-to-r from-transparent via-primary-500/50 to-transparent"></div>

      <div className="bg-slate-900 text-slate-400">
        <div className="max-w-7xl mx-auto px-8 lg:px-16 py-16">

          {/* Main grid: Brand | Contact | Dynamic categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr] gap-10 lg:gap-12">

            {/* Brand Column */}
            <div className="text-center md:text-left md:col-span-2 lg:col-span-1">
              <h3 className="text-lg font-bold text-white">{siteName}</h3>
              <p className="text-sm text-slate-400 leading-relaxed mt-2 max-w-xs mx-auto md:mx-0">{description}</p>
              {legalSettings?.showFooterLegalEntity !== false && legalSettings?.companyName && (
                <div className="inline-flex flex-col gap-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 mt-5">
                  <div className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                    </svg>
                    <span className="text-xs text-slate-400">
                      {language === 'en' ? 'Operated by ' : 'Drivs av '}
                      <span className="text-slate-300 font-medium">{legalSettings.companyName}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500 ml-5.5">
                    <span>Org.nr: {legalSettings.orgNumber}</span>
                    {legalSettings.vatNumber && (
                      <>
                        <span className="w-px h-3 bg-slate-700" />
                        <span>VAT: {legalSettings.vatNumber}</span>
                      </>
                    )}
                  </div>
                </div>
              )}
              {socialLinks.length > 0 && (
                <div className="flex justify-center md:justify-start gap-2 mt-5">
                  {socialLinks.map((link, index) => {
                    const { Icon } = link;
                    return (
                      <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors duration-200"
                        title={link.name}
                        aria-label={link.name}
                      >
                        <Icon className="w-4 h-4 text-slate-400" />
                      </a>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Contact Column */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-4">
                {language === 'en' ? 'Contact' : 'Kontakt'}
              </h4>
              <ul className="space-y-4">
                <li>
                  <a href={`mailto:${email}`} className="flex items-start gap-3 group">
                    <span className="w-8 h-8 rounded-lg bg-white/5 group-hover:bg-indigo-500/20 flex items-center justify-center flex-shrink-0 transition-colors duration-200">
                      <HiMail className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-400 transition-colors duration-200" />
                    </span>
                    <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors duration-200 pt-1.5">{email}</span>
                  </a>
                </li>
                <li>
                  <a href={`tel:${phone.replace(/\s/g, '')}`} className="flex items-start gap-3 group">
                    <span className="w-8 h-8 rounded-lg bg-white/5 group-hover:bg-indigo-500/20 flex items-center justify-center flex-shrink-0 transition-colors duration-200">
                      <HiPhone className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-400 transition-colors duration-200" />
                    </span>
                    <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors duration-200 pt-1.5">{phone}</span>
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 transition-colors duration-200">
                    <HiLocationMarker className="w-3.5 h-3.5 text-slate-400 transition-colors duration-200" />
                  </span>
                  <span className="text-sm text-slate-400 leading-relaxed pt-1.5">
                    {address}<br />
                    {postalCode} {city}<br />
                    {country}
                  </span>
                </li>
              </ul>
            </div>

            {/* Dynamic Footer Categories (legal links etc.) */}
            <div className="space-y-6">
              {footerStructure?.categories.map((category) => (
                <div key={category.id}>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-4">
                    {getCategoryTitle(category)}
                  </h4>
                  <ul className="space-y-3">
                    {category.pages?.map((page) => (
                      <li key={page.id}>
                        {renderPageLink(page)}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Copyright bar */}
          <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-xs text-slate-500">{copyright}</p>
            <p className="text-xs text-slate-500">
              Powered by{' '}
              <a
                href="https://minne24.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-400/70 hover:text-primary-400 font-medium transition-colors"
              >
                Minne24
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default DynamicFooter;
