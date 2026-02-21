import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import { pcComponentApi } from '../../models/api/pcComponentApi';
import { ComponentType } from '../../models/types/pcComponent.types';
import { motion } from 'framer-motion';

const CATEGORIES: { type: ComponentType; label_en: string; label_sv: string }[] = [
  { type: 'cpu', label_en: 'Processors', label_sv: 'Processorer' },
  { type: 'gpu', label_en: 'Graphics Cards', label_sv: 'Grafikkort' },
  { type: 'motherboard', label_en: 'Motherboards', label_sv: 'Moderkort' },
  { type: 'ram', label_en: 'Memory', label_sv: 'RAM-minne' },
  { type: 'ssd', label_en: 'SSDs', label_sv: 'SSD-diskar' },
  { type: 'hdd', label_en: 'Hard Drives', label_sv: 'Hårddiskar' },
  { type: 'psu', label_en: 'Power Supplies', label_sv: 'Nätaggregat' },
  { type: 'case', label_en: 'Cases', label_sv: 'Chassin' },
  { type: 'cooling', label_en: 'Cooling', label_sv: 'Kylning' },
  { type: 'fan', label_en: 'Fans', label_sv: 'Fläktar' },
  { type: 'optical', label_en: 'Optical Drives', label_sv: 'Optiska enheter' },
  { type: 'os', label_en: 'Operating Systems', label_sv: 'Operativsystem' },
];

const ComponentsShopSection: React.FC = () => {
  const language = useAppSelector((state) => state.ui.language);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const response = await pcComponentApi.getComponentTypeCounts();
        if (response.success && response.data?.counts) {
          setCounts(response.data.counts);
        }
      } catch {
        // Silently fail — section simply won't render
      } finally {
        setLoading(false);
      }
    };
    fetchCounts();
  }, []);

  const availableCategories = CATEGORIES.filter(
    (cat) => (counts[cat.type] ?? 0) > 0
  );

  if (loading || availableCategories.length === 0) return null;

  return (
    <section className="py-16 sm:py-20 lg:py-24 relative overflow-hidden bg-gradient-to-b from-gray-50 to-white dark:from-surface-950 dark:to-surface-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title area */}
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-5xl font-thin text-gray-800 dark:text-white"
          >
            {language === 'sv' ? 'Datorkomponenter' : 'PC Components'}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-gray-400 dark:text-neutral-500 mt-4 font-medium text-xs sm:text-sm uppercase tracking-[0.2em]"
          >
            {language === 'sv'
              ? 'Bygg din drömuppställning med premiumkomponenter'
              : 'Build your dream setup with premium components'}
          </motion.p>
        </div>

        {/* Category grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {availableCategories.map((cat, i) => (
            <motion.div
              key={cat.type}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
            >
              <Link
                to={`/components?type=${cat.type}`}
                className="block bg-white dark:bg-surface-850 rounded-xl border border-gray-200 dark:border-surface-700 p-4 text-center hover:border-primary-500/50 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="font-medium text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {language === 'sv' ? cat.label_sv : cat.label_en}
                </div>
                <div className="text-xs text-gray-400 dark:text-neutral-500 mt-1">
                  {counts[cat.type]} {language === 'sv' ? 'produkter' : 'products'}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* CTA button */}
        <div className="text-center">
          <Link
            to="/components"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-500 transition-all shadow-lg shadow-primary-600/25 hover:shadow-xl hover:shadow-primary-600/30 transform hover:-translate-y-0.5 mt-10"
          >
            {language === 'sv' ? 'Se alla komponenter' : 'Browse All Components'}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ComponentsShopSection;
