import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Reveal from '../common/Reveal';
import { useAppSelector } from '../../store/hooks';
import { useTeamViewModel } from '../../viewmodels/teamViewModel';
import LoadingSpinner from '../common/LoadingSpinner';
import AutoCarousel from '../common/AutoCarousel';

// Constants for card sizing constraints
const BIO_CLAMP_LENGTH = 120;

const MemberInfo: React.FC<{
  name: string;
  role: string;
  bio: string;
  language: string;
}> = ({ name, role, bio, language }) => {
  const [expanded, setExpanded] = useState(false);
  const needsClamp = bio.length > BIO_CLAMP_LENGTH;

  return (
    // UPDATED: Removed 'h-full' so the container shrinks to fit content
    <div className="p-6 flex flex-col">
      <div className="text-xs text-primary-600 dark:text-primary-400 font-medium uppercase tracking-wider mb-2">
        {role}
      </div>
      <h3 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-white mb-2 leading-snug group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300">
        {name}
      </h3>

      <div className="mb-2">
        <AnimatePresence initial={false} mode='wait'>
          <motion.p
            key={expanded ? 'full' : 'clamped'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`text-gray-500 dark:text-neutral-400 text-sm leading-relaxed ${
              !expanded && needsClamp ? 'line-clamp-3' : ''
            }`}
          >
            {bio}
          </motion.p>
        </AnimatePresence>
      </div>

      {needsClamp && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
          className="mt-2 text-primary-600 dark:text-primary-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm font-medium transition-colors self-start uppercase tracking-wide border-b-2 border-transparent hover:border-primary-500"
        >
          {expanded
            ? language === 'en'
              ? 'Read less'
              : 'Läs mindre'
            : language === 'en'
            ? 'Read more'
            : 'Läs mer'}
        </button>
      )}
    </div>
  );
};

const OurTeam: React.FC = () => {
  const language = useAppSelector((state) => state.ui.language);
  const { members, isLoading, getMemberName, getMemberRole, getMemberBio } =
    useTeamViewModel();

  if (isLoading) {
    return (
      <div className="py-16 flex justify-center items-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (members.length === 0) {
    return null;
  }

  return (
    <section id="team" className="py-12 sm:py-16 lg:py-20 relative z-10 bg-white dark:bg-surface-900 overflow-hidden border-t border-gray-200 dark:border-surface-700">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <Reveal className="text-center mb-8 sm:mb-10 lg:mb-14" y={30} duration={0.6}>
          <h2 className="text-4xl sm:text-5xl font-thin text-gray-800 dark:text-white mb-3 sm:mb-4">
            {language === 'en' ? 'Our Team' : 'Vårt Team'}
          </h2>
          <p className="font-medium text-xs sm:text-sm uppercase tracking-[0.2em] text-gray-400 dark:text-neutral-500">
            {language === 'en'
              ? 'The talented people behind our success.'
              : 'De talangfulla personerna bakom vår framgång.'}
          </p>
        </Reveal>

        {/* Team Carousel */}
        <AutoCarousel
          items={members.map((member) => (
            <div
              key={member.id}
              className="bg-gray-100 dark:bg-surface-800 border border-gray-200 dark:border-surface-700 rounded-2xl overflow-hidden hover:border-primary-500/50 hover:shadow-light-lg dark:hover:shadow-dark-lg transition-all duration-300 flex flex-col h-full w-full"
            >
              {/* Member Image - Aspect 4/5 (portrait but not too tall) */}
              <div className="relative overflow-hidden bg-gray-100 dark:bg-surface-800 aspect-[4/5] group">
                {(member.image_file || member.image_url) ? (
                  <img
                    src={member.image_file || member.image_url}
                    alt={getMemberName(member, language)}
                    loading="lazy"
                    className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-600/10 to-surface-800">
                    <svg
                      className="w-24 h-24 text-neutral-500"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </div>
                )}

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* LinkedIn Badge */}
                {member.linkedin_url && (
                  <a
                    href={member.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 dark:bg-surface-900/90 backdrop-blur-sm border border-gray-200 dark:border-surface-700 flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:bg-primary-500 hover:border-primary-500 hover:text-white text-gray-500 dark:text-neutral-400 shadow-light-md dark:shadow-dark-md"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </a>
                )}
              </div>

              {/* Member Info */}
              <MemberInfo
                name={getMemberName(member, language)}
                role={getMemberRole(member, language)}
                bio={getMemberBio(member, language)}
                language={language}
              />
            </div>
          ))}
          itemKeys={members.map(m => m.id)}
          interval={5000}
          gap={24}
        />
      </div>
    </section>
  );
};

export default OurTeam;
