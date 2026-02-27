import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { setLanguage, toggleCart, toggleTheme } from '../../store/slices/uiSlice';
import { useAuthViewModel } from '../../viewmodels/authViewModel';
import { FaBars, FaTimes, FaShoppingCart, FaUser, FaSignOutAlt, FaCog, FaTachometerAlt, FaGlobe, FaSun, FaMoon } from 'react-icons/fa';

interface HeaderProps {
  mode?: 'home' | 'page';
  activeSection?: string;
  onScrollToSection?: (sectionId: string) => void;
  navLinks?: Array<{ id: string; label: string }>;
}

const Header: React.FC<HeaderProps> = ({
  mode = 'page',
  activeSection = 'home',
  onScrollToSection,
  navLinks = [],
}) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const language = useAppSelector((state) => state.ui.language);
  const theme = useAppSelector((state) => state.ui.theme);
  const { settings } = useAppSelector((state) => state.siteSettings);
  const { isAuthenticated, user, logoutUser } = useAuthViewModel();
  const cart = useAppSelector((state) => state.cart);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setShowMobileMenu(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (showMobileMenu) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showMobileMenu]);

  const siteName = settings
    ? (language === 'en' ? settings.siteName_en : settings.siteName_sv)
    : 'Portfolio';

  const toggleLanguage = () => {
    dispatch(setLanguage(language === 'en' ? 'sv' : 'en'));
  };

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  const handleLogoClick = () => {
    setShowMobileMenu(false);
    if (mode === 'home' && onScrollToSection) {
      onScrollToSection('home');
    } else {
      navigate('/');
    }
  };

  const handleNavClick = (linkId: string) => {
    setShowMobileMenu(false);
    if (mode === 'home' && onScrollToSection) {
      onScrollToSection(linkId);
    } else {
      navigate('/');
    }
  };

  const handleCartClick = () => {
    setShowMobileMenu(false);
    dispatch(toggleCart());
  };

  return (
    <>
      {/* Fixed positioning wrapper — top offset by notification banner height */}
      <div className="fixed left-0 right-0 z-50 px-3 lg:px-5 pt-2 sm:pt-3" style={{ top: 'var(--nb-height, 0px)' }}>
        {/* Floating bar */}
        <nav className="max-w-[1400px] mx-auto rounded-xl sm:rounded-2xl bg-white/80 dark:bg-[rgba(10,10,30,0.70)] backdrop-blur-2xl shadow-lg shadow-black/5 dark:shadow-black/20 border border-slate-200/50 dark:border-slate-700/50">
          {/* Bar content */}
          <div className="flex items-center justify-between h-16">
            {/* Left: Logo + Nav */}
            <div className="flex items-center h-full">
              {/* Logo — square block, full height, flush left, corners match bar */}
              <button
                onClick={handleLogoClick}
                className="h-full aspect-[3/2] flex items-center justify-center overflow-hidden rounded-l-xl sm:rounded-l-2xl cursor-pointer flex-shrink-0"
              >
                {settings?.logoFile || settings?.logoUrl ? (
                  <img
                    src={settings.logoFile || settings.logoUrl}
                    alt={siteName}
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </button>
              {/* Desktop Navigation Links */}
              {mode === 'home' && navLinks.length > 0 && (
                <div className="hidden lg:flex items-center gap-6 ml-8">
                  {navLinks.map((link) => (
                    <button
                      key={link.id}
                      onClick={() => handleNavClick(link.id)}
                      className={`group text-sm font-medium relative py-1 transition-colors duration-300 ${
                        activeSection === link.id
                          ? 'text-primary-600 dark:text-primary-400 font-bold'
                          : 'text-slate-700 dark:text-slate-200 hover:text-primary-600 dark:hover:text-primary-400'
                      }`}
                    >
                      {link.label}
                      <span
                        className={`absolute bottom-0 left-0 w-full h-0.5 bg-primary-500 transform origin-left transition-transform duration-300 ${
                          activeSection === link.id ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              )}

            </div>

            {/* Right: Utilities */}
            <div className="flex items-center gap-4 sm:gap-5 pr-4 sm:pr-6">
              {/* Theme Toggle - Desktop */}
              <button
                onClick={handleThemeToggle}
                className="hidden sm:flex items-center justify-center p-1.5 text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 transition-colors"
                aria-label={theme === 'dark' ? t('theme.light') : t('theme.dark')}
              >
                {theme === 'dark' ? <FaSun size={16} /> : <FaMoon size={16} />}
              </button>

              {/* Language Toggle - Desktop */}
              <button
                onClick={toggleLanguage}
                className="hidden sm:flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 transition-colors uppercase tracking-wider"
              >
                <FaGlobe size={14} className="opacity-60" />
                {language}
              </button>

              {/* Shopping Cart */}
              <button
                onClick={handleCartClick}
                className="relative p-1.5 text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 active:scale-95 transition-all"
                aria-label="Shopping cart"
              >
                <FaShoppingCart size={20} />
                {cart.totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-[11px] font-bold rounded-full w-[18px] h-[18px] flex items-center justify-center shadow-sm shadow-primary-500/40">
                    {cart.totalItems > 9 ? '9+' : cart.totalItems}
                  </span>
                )}
              </button>

              {/* Desktop Auth/User Menu */}
              <div className="hidden lg:block relative">
                {isAuthenticated ? (
                  <div>
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                      <FaUser size={14} />
                      <span className="hidden lg:inline">
                        {user?.firstName || (language === 'en' ? 'Account' : 'Konto')}
                      </span>
                      <svg
                        className={`w-3.5 h-3.5 transition-transform ${showUserMenu ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Desktop Dropdown Menu */}
                    {showUserMenu && (
                      <>
                        <div className="fixed inset-0 z-[60]" onClick={() => setShowUserMenu(false)} />
                        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-[70] dark:bg-slate-800 dark:shadow-black/20 dark:border-slate-700">
                          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{user?.firstName} {user?.lastName}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                          </div>

                          <Link
                            to="/dashboard"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-100 transition-colors dark:text-slate-300 dark:hover:bg-slate-700"
                          >
                            <FaTachometerAlt className="w-4 h-4 mr-3 text-slate-400 dark:text-slate-500" />
                            {language === 'en' ? 'Dashboard' : 'Instrumentpanel'}
                          </Link>

                          {user?.role === 'admin' && (
                            <Link
                              to="/admin"
                              onClick={() => setShowUserMenu(false)}
                              className="flex items-center px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-100 transition-colors dark:text-slate-300 dark:hover:bg-slate-700"
                            >
                              <FaCog className="w-4 h-4 mr-3 text-slate-400 dark:text-slate-500" />
                              {language === 'en' ? 'Admin Panel' : 'Adminpanel'}
                            </Link>
                          )}

                          <div className="border-t border-slate-200 dark:border-slate-700 mt-1 pt-1">
                            <button
                              onClick={() => {
                                setShowUserMenu(false);
                                logoutUser();
                              }}
                              className="flex items-center w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                            >
                              <FaSignOutAlt className="w-4 h-4 mr-3" />
                              {language === 'en' ? 'Logout' : 'Logga ut'}
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-bold text-white bg-primary-600 rounded-lg hover:bg-primary-500 transition-all"
                  >
                    {language === 'en' ? 'Login' : 'Logga in'}
                  </Link>
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="lg:hidden p-1.5 text-slate-700 dark:text-slate-200 active:scale-95 transition-all"
                aria-label="Toggle menu"
              >
                {showMobileMenu ? <FaTimes size={20} /> : <FaBars size={20} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu Dropdown — expands inside the floating bar */}
          {showMobileMenu && (
            <div className="lg:hidden border-t border-slate-200/50 dark:border-slate-700/50 px-4 pb-4 pt-3">
              {/* Nav Links */}
              {mode === 'home' && navLinks.length > 0 && (
                <div className="pb-3 mb-3 border-b border-slate-200/50 dark:border-slate-700/50">
                  {navLinks.map((link) => (
                    <button
                      key={link.id}
                      onClick={() => handleNavClick(link.id)}
                      className={`w-full text-left px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                        activeSection === link.id
                          ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 font-bold'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {link.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="space-y-1">
                {/* Theme Toggle */}
                <button
                  onClick={handleThemeToggle}
                  className="w-full text-left px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-3"
                >
                  {theme === 'dark' ? (
                    <FaSun size={16} className="text-slate-400" />
                  ) : (
                    <FaMoon size={16} className="text-slate-400" />
                  )}
                  <span>{theme === 'dark' ? t('theme.light') : t('theme.dark')}</span>
                </button>

                {/* Language Toggle */}
                <button
                  onClick={() => {
                    toggleLanguage();
                    setShowMobileMenu(false);
                  }}
                  className="w-full text-left px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-3"
                >
                  <FaGlobe size={16} className="text-slate-400" />
                  <span>{language === 'en' ? 'Svenska' : 'English'}</span>
                  <span className="ml-auto text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-bold uppercase text-slate-500 dark:text-slate-400">
                    {language}
                  </span>
                </button>

                {isAuthenticated && (
                  <>
                    <Link
                      to="/dashboard"
                      onClick={() => setShowMobileMenu(false)}
                      className="w-full text-left px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-3"
                    >
                      <FaTachometerAlt size={16} className="text-slate-400" />
                      {language === 'en' ? 'Dashboard' : 'Instrumentpanel'}
                    </Link>

                    {user?.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setShowMobileMenu(false)}
                        className="w-full text-left px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-3"
                      >
                        <FaCog size={16} className="text-slate-400" />
                        {language === 'en' ? 'Admin Panel' : 'Adminpanel'}
                      </Link>
                    )}
                  </>
                )}
              </div>

              {/* Bottom Action */}
              <div className="mt-3 pt-3 border-t border-slate-200/50 dark:border-slate-700/50">
                {isAuthenticated ? (
                  <button
                    onClick={() => {
                      setShowMobileMenu(false);
                      logoutUser();
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 active:scale-[0.98] transition"
                  >
                    <FaSignOutAlt size={14} />
                    {language === 'en' ? 'Logout' : 'Logga ut'}
                  </button>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setShowMobileMenu(false)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-primary-600 rounded-lg hover:bg-primary-500 active:scale-[0.98] transition"
                  >
                    <FaUser size={14} />
                    {language === 'en' ? 'Login / Register' : 'Logga in / Registrera'}
                  </Link>
                )}
              </div>
            </div>
          )}
        </nav>
      </div>

      {/* Mobile menu backdrop overlay */}
      {showMobileMenu && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setShowMobileMenu(false)}
        />
      )}
    </>
  );
};

export default Header;
