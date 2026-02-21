import React from 'react';
import {
  ContentBlock,
  GlobalStylesConfig,
  SocialMediaConfig,
  FooterConfig,
} from '../../../models/types/newsletterAdmin.types';
import { Trash2 } from 'lucide-react';
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
  FaTiktok,
  FaPinterestP,
  FaGithub,
  FaWhatsapp,
  FaTelegram,
  FaDiscord,
  FaSnapchatGhost,
  FaRedditAlien,
  FaTumblr,
  FaMediumM,
  FaGlobe,
} from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

interface EmailPreviewProps {
  blocks: ContentBlock[];
  globalStyles: GlobalStylesConfig;
  socialMediaConfig: SocialMediaConfig;
  footerConfig: FooterConfig;
  selectedBlockId: string | null;
  deviceMode: 'desktop' | 'mobile';
  onSelectBlock: (id: string | null) => void;
  onDeleteBlock: (id: string) => void;
  onMoveBlock: (id: string, direction: 'up' | 'down') => void;
}

const BlockRenderer: React.FC<{
  block: ContentBlock;
  globalStyles: GlobalStylesConfig;
  socialMediaConfig: SocialMediaConfig;
}> = ({ block, globalStyles, socialMediaConfig }) => {
  const s = block.settings;
  const font = globalStyles.defaultFont || 'Arial, sans-serif';
  const textColor = globalStyles.defaultTextColor || '#1E293B';
  const linkColor = globalStyles.defaultLinkColor || '#3B82F6';

  switch (block.type) {
    case 'text':
      return (
        <div
          style={{
            fontFamily: font,
            fontSize: s.fontSize || '16px',
            color: s.color || textColor,
            textAlign: s.textAlign || 'left',
            lineHeight: `${(s.lineHeight || 150) / 100}`,
            padding: `${s.paddingTop || 16}px 0 ${s.paddingBottom || 16}px`,
            backgroundColor: s.blockBackgroundColor || undefined,
          }}
          dangerouslySetInnerHTML={{ __html: s.html || '<p style="color:#94A3B8;margin:0">Click to edit text...</p>' }}
        />
      );

    case 'image':
      return (
        <div
          style={{
            textAlign: s.alignment || 'center',
            padding: `${s.paddingTop || 16}px 0 ${s.paddingBottom || 16}px`,
            backgroundColor: s.blockBackgroundColor || undefined,
          }}
        >
          {s.src ? (
            <img
              src={s.src}
              alt={s.alt || ''}
              style={{
                maxWidth: `${s.width || 100}%`,
                borderRadius: `${s.borderRadius || 0}px`,
                display: 'inline-block',
              }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '160px',
                backgroundColor: '#E2E8F0',
                borderRadius: `${s.borderRadius || 0}px`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#94A3B8',
                fontSize: '14px',
              }}
            >
              Image placeholder
            </div>
          )}
        </div>
      );

    case 'button': {
      const sizes: Record<string, { padding: string; fontSize: string }> = {
        small: { padding: '8px 16px', fontSize: '13px' },
        medium: { padding: '12px 24px', fontSize: '15px' },
        large: { padding: '16px 32px', fontSize: '17px' },
      };
      const sizeConfig = sizes[s.size || 'medium'];
      const isOutlined = s.style === 'outlined';
      const isPill = s.style === 'pill';
      const radius = isPill ? '999px' : `${s.borderRadius || 8}px`;

      return (
        <div
          style={{
            textAlign: s.alignment || 'center',
            padding: `${s.paddingTop || 16}px 0 ${s.paddingBottom || 16}px`,
            backgroundColor: s.blockBackgroundColor || undefined,
          }}
        >
          <a
            href={s.url || '#'}
            style={{
              display: s.fullWidth ? 'block' : 'inline-block',
              padding: sizeConfig.padding,
              fontSize: sizeConfig.fontSize,
              fontFamily: font,
              fontWeight: 600,
              color: isOutlined ? (s.backgroundColor || '#4F46E5') : (s.textColor || '#FFFFFF'),
              backgroundColor: isOutlined ? 'transparent' : (s.backgroundColor || '#4F46E5'),
              border: isOutlined ? `2px solid ${s.backgroundColor || '#4F46E5'}` : 'none',
              borderRadius: radius,
              textDecoration: 'none',
              textAlign: 'center',
              cursor: 'pointer',
            }}
          >
            {s.text || 'Click here'}
          </a>
        </div>
      );
    }

    case 'divider':
      return (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            padding: `${s.paddingTop || 16}px 0 ${s.paddingBottom || 16}px`,
            backgroundColor: s.blockBackgroundColor || undefined,
          }}
        >
          <hr
            style={{
              width: `${s.width || 100}%`,
              borderStyle: s.style || 'solid',
              borderColor: s.color || '#E2E8F0',
              borderWidth: `${s.thickness || 1}px 0 0 0`,
              margin: 0,
            }}
          />
        </div>
      );

    case 'spacer':
      return (
        <div
          style={{
            height: `${s.height || 24}px`,
            backgroundColor: s.blockBackgroundColor || undefined,
          }}
        />
      );

    case 'productCard': {
      const showBorder = s.showBorder ?? true;
      const cardBg = s.cardBackground || '#FFFFFF';
      const cardRadius = s.borderRadius ?? 8;
      const cardPadding = s.padding ?? 16;
      const imgPos = s.imagePosition || (s.layout === 'vertical' ? 'top' : 'left');
      const showPrice = s.showPrice ?? true;
      const isVertical = imgPos === 'top';
      const flexDir = imgPos === 'right' ? 'row-reverse' as const : isVertical ? 'column' as const : 'row' as const;

      return (
        <div
          style={{
            padding: `${s.paddingTop || 16}px 16px ${s.paddingBottom || 16}px`,
            backgroundColor: s.blockBackgroundColor || undefined,
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: flexDir,
              gap: isVertical ? '0px' : '0px',
              border: showBorder ? '1px solid #E2E8F0' : 'none',
              borderRadius: `${cardRadius}px`,
              overflow: 'hidden',
              backgroundColor: cardBg,
            }}
          >
            <div
              style={{
                width: isVertical ? '100%' : '40%',
                height: isVertical ? '160px' : '140px',
                backgroundColor: '#F1F5F9',
                backgroundImage: s.imageUrl ? `url(${s.imageUrl})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                flexShrink: 0,
              }}
            />
            <div style={{ padding: `${cardPadding}px`, fontFamily: font, flex: 1 }}>
              <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 600, color: textColor }}>
                {s.title || 'Product Name'}
              </h3>
              {showPrice && s.price && (
                <p style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: 600, color: linkColor }}>
                  {s.pricePrefix || ''}{s.price}
                </p>
              )}
              <p style={{ margin: '0 0 12px', fontSize: '14px', color: '#64748B' }}>
                {s.description || 'Product description goes here.'}
              </p>
              {s.buttonText && (
                <a
                  href={s.buttonUrl || '#'}
                  style={{
                    display: 'inline-block',
                    padding: '8px 16px',
                    fontSize: '13px',
                    color: '#FFFFFF',
                    backgroundColor: linkColor,
                    borderRadius: '6px',
                    textDecoration: 'none',
                    fontWeight: 600,
                  }}
                >
                  {s.buttonText}
                </a>
              )}
            </div>
          </div>
        </div>
      );
    }

    case 'productGrid': {
      const gridProducts: any[] = s.products || [];
      const cols = s.columns || 2;
      const gridCardBg = s.cardBackground || '#FFFFFF';
      const gridShowBorders = s.showBorders ?? true;
      const gridGap = s.gap ?? 16;

      return (
        <div
          style={{
            padding: `${s.paddingTop || 16}px 16px ${s.paddingBottom || 16}px`,
            backgroundColor: s.blockBackgroundColor || undefined,
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: `${gridGap}px`,
            }}
          >
            {gridProducts.length === 0
              ? Array.from({ length: cols }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      border: gridShowBorders ? '1px solid #E2E8F0' : 'none',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      backgroundColor: gridCardBg,
                    }}
                  >
                    <div style={{ height: '120px', backgroundColor: '#F1F5F9' }} />
                    <div style={{ padding: '12px', fontFamily: font }}>
                      <div style={{ height: '14px', width: '60%', backgroundColor: '#E2E8F0', borderRadius: '4px', marginBottom: '8px' }} />
                      <div style={{ height: '10px', width: '40%', backgroundColor: '#E2E8F0', borderRadius: '4px' }} />
                    </div>
                  </div>
                ))
              : gridProducts.map((product: any, i: number) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      border: gridShowBorders ? '1px solid #E2E8F0' : 'none',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      backgroundColor: gridCardBg,
                    }}
                  >
                    <div
                      style={{
                        height: '120px',
                        backgroundColor: '#F1F5F9',
                        backgroundImage: product.imageUrl ? `url(${product.imageUrl})` : undefined,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    />
                    <div style={{ padding: '12px', fontFamily: font }}>
                      <h4 style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 600, color: textColor }}>
                        {product.title || 'Product'}
                      </h4>
                      {product.price && (
                        <p style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: 600, color: linkColor }}>
                          {product.price}
                        </p>
                      )}
                      {product.buttonText && (
                        <a
                          href={product.buttonUrl || '#'}
                          style={{
                            display: 'inline-block',
                            padding: '6px 12px',
                            fontSize: '12px',
                            color: '#FFFFFF',
                            backgroundColor: linkColor,
                            borderRadius: '6px',
                            textDecoration: 'none',
                            fontWeight: 600,
                          }}
                        >
                          {product.buttonText}
                        </a>
                      )}
                    </div>
                  </div>
                ))
            }
          </div>
        </div>
      );
    }

    case 'coupon':
      return (
        <div
          style={{
            padding: `${s.paddingTop || 16}px 16px ${s.paddingBottom || 16}px`,
            backgroundColor: s.blockBackgroundColor || undefined,
          }}
        >
          <div
            style={{
              border: `2px dashed ${s.borderColor || '#F59E0B'}`,
              borderRadius: '8px',
              padding: '24px',
              textAlign: 'center',
              backgroundColor: s.backgroundColor || '#FEF3C7',
              fontFamily: font,
            }}
          >
            <p style={{ margin: '0 0 12px', fontSize: '15px', color: textColor }}>
              {s.description || 'Get a discount on your order!'}
            </p>
            <div
              style={{
                display: 'inline-block',
                padding: '8px 20px',
                backgroundColor: '#FFFFFF',
                border: '2px dashed #D1D5DB',
                borderRadius: '6px',
                fontSize: '18px',
                fontWeight: 700,
                letterSpacing: '2px',
                color: textColor,
              }}
            >
              {s.code || 'CODE'}
            </div>
            {s.validUntil && (
              <p style={{ margin: '12px 0 0', fontSize: '12px', color: '#92400E' }}>
                Valid until {s.validUntil}
              </p>
            )}
          </div>
        </div>
      );

    case 'hero': {
      let background = s.backgroundColor || '#4F46E5';
      if (s.backgroundType === 'gradient') {
        background = `linear-gradient(135deg, ${s.backgroundColor || '#4F46E5'}, ${s.gradientEnd || '#7C3AED'})`;
      }

      return (
        <div
          style={{
            padding: `${s.paddingTop || 48}px 32px ${s.paddingBottom || 48}px`,
            background,
            backgroundImage: s.backgroundType === 'image' && s.backgroundImage ? `url(${s.backgroundImage})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            textAlign: s.textAlign || 'center',
            position: 'relative',
          }}
        >
          {s.backgroundType === 'image' && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: `rgba(0,0,0,${(s.overlayOpacity || 40) / 100})`,
              }}
            />
          )}
          <div style={{ position: 'relative', fontFamily: font }}>
            <h1
              style={{
                margin: '0 0 8px',
                fontSize: '28px',
                fontWeight: 700,
                color: s.textColor || '#FFFFFF',
              }}
            >
              {s.heading || 'Hero Heading'}
            </h1>
            {s.subheading && (
              <p
                style={{
                  margin: '0 0 20px',
                  fontSize: '16px',
                  color: s.textColor || '#FFFFFF',
                  opacity: 0.9,
                }}
              >
                {s.subheading}
              </p>
            )}
            {s.buttonText && (
              <a
                href={s.buttonUrl || '#'}
                style={{
                  display: 'inline-block',
                  padding: '12px 28px',
                  fontSize: '15px',
                  fontWeight: 600,
                  color: s.backgroundColor || '#4F46E5',
                  backgroundColor: s.textColor || '#FFFFFF',
                  borderRadius: '8px',
                  textDecoration: 'none',
                }}
              >
                {s.buttonText}
              </a>
            )}
          </div>
        </div>
      );
    }

    case 'personalization':
      return (
        <div
          style={{
            padding: `${s.paddingTop || 16}px 0 ${s.paddingBottom || 16}px`,
            fontFamily: font,
            fontSize: '16px',
            color: textColor,
            backgroundColor: s.blockBackgroundColor || undefined,
          }}
        >
          <p style={{ margin: 0, fontStyle: 'italic', color: '#94A3B8' }}>
            {s.content || 'Hi {first_name}!'}
          </p>
          {s.fallback && (
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#CBD5E1' }}>
              Fallback: {s.fallback}
            </p>
          )}
        </div>
      );

    case 'socialMedia': {
      const platforms = socialMediaConfig.platforms || [];
      const iconSize = socialMediaConfig.iconSize || 32;
      const showText = socialMediaConfig.style === 'icons-text';

      const socialIcons: Record<string, { icon: React.ComponentType<{ size: number; color?: string }>; color: string }> = {
        facebook:  { icon: FaFacebookF,     color: '#1877F2' },
        twitter:   { icon: FaXTwitter,      color: '#000000' },
        x:         { icon: FaXTwitter,      color: '#000000' },
        instagram: { icon: FaInstagram,     color: '#E4405F' },
        linkedin:  { icon: FaLinkedinIn,    color: '#0A66C2' },
        youtube:   { icon: FaYoutube,       color: '#FF0000' },
        tiktok:    { icon: FaTiktok,        color: '#000000' },
        pinterest: { icon: FaPinterestP,    color: '#BD081C' },
        github:    { icon: FaGithub,        color: '#333333' },
        whatsapp:  { icon: FaWhatsapp,      color: '#25D366' },
        telegram:  { icon: FaTelegram,      color: '#26A5E4' },
        discord:   { icon: FaDiscord,       color: '#5865F2' },
        snapchat:  { icon: FaSnapchatGhost, color: '#FFFC00' },
        reddit:    { icon: FaRedditAlien,   color: '#FF4500' },
        tumblr:    { icon: FaTumblr,        color: '#36465D' },
        medium:    { icon: FaMediumM,       color: '#000000' },
      };

      const getSocialIcon = (platform: string) => {
        const key = platform.toLowerCase();
        const entry = socialIcons[key];
        const IconComponent = entry?.icon || FaGlobe;
        return <IconComponent size={iconSize * 0.55} color="#FFFFFF" />;
      };

      return (
        <div
          style={{
            padding: `${s.paddingTop || 16}px 0 ${s.paddingBottom || 16}px`,
            textAlign: socialMediaConfig.alignment || 'center',
            backgroundColor: s.blockBackgroundColor || undefined,
          }}
        >
          {platforms.length === 0 ? (
            <p style={{ color: '#94A3B8', fontSize: '13px', fontFamily: font, margin: 0 }}>
              Configure social media links in Global Styles
            </p>
          ) : (
            <div style={{ display: 'inline-flex', gap: '16px', alignItems: 'center' }}>
              {platforms.map((p) => {
                const key = p.platform.toLowerCase();
                const entry = socialIcons[key];
                const bgColor = entry?.color || '#6B7280';
                return (
                  <a
                    key={p.platform}
                    href={p.url || '#'}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      textDecoration: 'none',
                      color: textColor,
                      fontSize: '13px',
                      fontFamily: font,
                    }}
                  >
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: `${iconSize}px`,
                        height: `${iconSize}px`,
                        borderRadius: '50%',
                        backgroundColor: bgColor,
                        flexShrink: 0,
                      }}
                    >
                      {getSocialIcon(p.platform)}
                    </span>
                    {showText && <span>{p.platform.charAt(0).toUpperCase() + p.platform.slice(1)}</span>}
                  </a>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    case 'columns':
      return (
        <div
          style={{
            padding: `${s.paddingTop || 16}px 0 ${s.paddingBottom || 16}px`,
            backgroundColor: s.blockBackgroundColor || undefined,
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: '16px',
            }}
          >
            {(s.layout === '1/3-2/3' || s.layout === '2/3-1/3') ? (
              <>
                <div
                  style={{
                    width: s.layout === '1/3-2/3' ? '33%' : '67%',
                    padding: '16px',
                    border: '1px dashed #CBD5E1',
                    borderRadius: '4px',
                    color: '#94A3B8',
                    fontSize: '12px',
                    fontFamily: font,
                    textAlign: 'center',
                  }}
                >
                  Column 1
                </div>
                <div
                  style={{
                    width: s.layout === '1/3-2/3' ? '67%' : '33%',
                    padding: '16px',
                    border: '1px dashed #CBD5E1',
                    borderRadius: '4px',
                    color: '#94A3B8',
                    fontSize: '12px',
                    fontFamily: font,
                    textAlign: 'center',
                  }}
                >
                  Column 2
                </div>
              </>
            ) : (
              <>
                <div
                  style={{
                    width: '50%',
                    padding: '16px',
                    border: '1px dashed #CBD5E1',
                    borderRadius: '4px',
                    color: '#94A3B8',
                    fontSize: '12px',
                    fontFamily: font,
                    textAlign: 'center',
                  }}
                >
                  Column 1
                </div>
                <div
                  style={{
                    width: '50%',
                    padding: '16px',
                    border: '1px dashed #CBD5E1',
                    borderRadius: '4px',
                    color: '#94A3B8',
                    fontSize: '12px',
                    fontFamily: font,
                    textAlign: 'center',
                  }}
                >
                  Column 2
                </div>
              </>
            )}
          </div>
        </div>
      );

    default:
      return (
        <div style={{ padding: '16px', color: '#94A3B8', fontSize: '13px', fontFamily: font }}>
          Unknown block type: {block.type}
        </div>
      );
  }
};

const EmailPreview: React.FC<EmailPreviewProps> = ({
  blocks,
  globalStyles,
  socialMediaConfig,
  footerConfig,
  selectedBlockId,
  deviceMode,
  onSelectBlock,
  onDeleteBlock,
  onMoveBlock,
}) => {
  const emailWidth = deviceMode === 'mobile' ? 375 : (globalStyles.emailWidth || 600);

  return (
    <div
      className="flex-1 overflow-auto flex justify-center py-6 px-4"
      style={{ backgroundColor: globalStyles.backgroundColor || '#F1F5F9' }}
      onClick={() => onSelectBlock(null)}
    >
      <div
        style={{
          width: `${emailWidth}px`,
          maxWidth: '100%',
          backgroundColor: globalStyles.contentBackgroundColor || '#FFFFFF',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
          borderRadius: '4px',
          overflow: 'hidden',
          alignSelf: 'flex-start',
        }}
      >
        {/* Header */}
        {globalStyles.header?.showLogo !== false && (
          <div
            style={{
              backgroundColor: globalStyles.header?.backgroundColor || '#FFFFFF',
              padding: `${globalStyles.header?.padding || 24}px`,
              textAlign: globalStyles.header?.alignment || 'center',
            }}
          >
            {globalStyles.header?.logoUrl ? (
              <img
                src={globalStyles.header.logoUrl}
                alt="Logo"
                style={{ width: `${globalStyles.header?.logoWidth || 150}px`, height: 'auto', display: 'inline-block' }}
              />
            ) : (
              <div
                style={{
                  display: 'inline-block',
                  padding: '12px 24px',
                  backgroundColor: '#F1F5F9',
                  borderRadius: '6px',
                  color: '#94A3B8',
                  fontSize: '14px',
                  fontFamily: globalStyles.defaultFont || 'Arial, sans-serif',
                }}
              >
                Logo
              </div>
            )}
          </div>
        )}

        {/* Content Blocks */}
        <div style={{ padding: '0 24px' }}>
          {blocks.length === 0 && (
            <div
              style={{
                padding: '60px 0',
                textAlign: 'center',
                color: '#94A3B8',
                fontSize: '14px',
                fontFamily: globalStyles.defaultFont || 'Arial, sans-serif',
              }}
            >
              Click a content block from the left panel to start building
            </div>
          )}

          {blocks.map((block, index) => (
            <div
              key={block.id}
              className={`relative group cursor-pointer transition-all ${
                selectedBlockId === block.id
                  ? 'ring-2 ring-primary-500 ring-offset-1'
                  : 'hover:ring-1 hover:ring-primary-500/40'
              }`}
              style={{ borderRadius: '2px' }}
              onClick={(e) => {
                e.stopPropagation();
                onSelectBlock(block.id);
              }}
            >
              <BlockRenderer
                block={block}
                globalStyles={globalStyles}
                socialMediaConfig={socialMediaConfig}
              />

              {/* Block controls overlay */}
              <div className={`absolute top-0 right-0 flex items-center gap-0.5 bg-surface-800 rounded-bl-lg shadow-lg border border-surface-600 ${
                selectedBlockId === block.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              } transition-opacity`}>
                {index > 0 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onMoveBlock(block.id, 'up'); }}
                    className="p-1 text-neutral-400 hover:text-white"
                    title="Move up"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                )}
                {index < blocks.length - 1 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onMoveBlock(block.id, 'down'); }}
                    className="p-1 text-neutral-400 hover:text-white"
                    title="Move down"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); onDeleteBlock(block.id); }}
                  className="p-1 text-red-400 hover:text-red-300"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            backgroundColor: footerConfig.backgroundColor || '#F8FAFC',
            padding: `${footerConfig.padding || 24}px`,
            textAlign: 'center',
            fontFamily: globalStyles.defaultFont || 'Arial, sans-serif',
          }}
        >
          {footerConfig.companyName && (
            <p style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: 600, color: footerConfig.textColor || '#64748B' }}>
              {footerConfig.companyName}
            </p>
          )}
          {footerConfig.addressLine && (
            <p style={{ margin: '0 0 8px', fontSize: '12px', color: footerConfig.textColor || '#64748B' }}>
              {footerConfig.addressLine}
            </p>
          )}
          {footerConfig.showUnsubscribe !== false && (
            <p style={{ margin: '8px 0 0', fontSize: '11px' }}>
              <a href="#" style={{ color: globalStyles.defaultLinkColor || '#3B82F6', textDecoration: 'underline' }}>
                {footerConfig.unsubscribeText || 'Unsubscribe from this list'}
              </a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailPreview;
