import {
  ContentBlock,
  GlobalStylesConfig,
  SocialMediaConfig,
  FooterConfig,
} from '../models/sequelize/NewsletterTemplate';

interface RenderOptions {
  subject: string;
  previewText?: string;
  contentBlocks: ContentBlock[];
  globalStyles: GlobalStylesConfig;
  socialMediaConfig: SocialMediaConfig;
  footerConfig: FooterConfig;
  subscriberData?: {
    email: string;
    firstName?: string;
    unsubscribeUrl: string;
    sendLogId?: string;
  };
  campaignSlug?: string;
  trackingBaseUrl?: string;
}

class EmailRenderingService {
  /**
   * Turn image URLs into absolute https:// URLs accessible by anonymous email clients.
   * - localhost URLs are rewritten to the public FRONTEND_URL
   * - Relative paths are prepended with the base URL
   * - data: URIs should have been converted at save time by CampaignService;
   *   if one leaks through, log a warning and drop it.
   */
  private resolveUrl(url: string | undefined, baseUrl: string): string {
    if (!url) return '';
    // data: URIs should already be converted to hosted URLs at save time.
    // If one leaks through, warn and return empty — do not attempt conversion at send time.
    if (url.startsWith('data:')) {
      console.warn('[EmailRendering] WARNING: data: URI found at send time — this should have been converted when the campaign was saved. Dropping image.');
      return '';
    }
    // Already an absolute https URL — pass through
    if (url.startsWith('https://')) return url;
    // Rewrite http://localhost or http://127.0.0.1 to the public base URL
    if (url.startsWith('http://')) {
      if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//.test(url)) {
        const urlPath = url.replace(/^http:\/\/[^/]+(:\d+)?/, '');
        return `${baseUrl.replace(/\/$/, '')}${urlPath}`;
      }
      return url;
    }
    // Relative path — prepend base URL
    return `${baseUrl.replace(/\/$/, '')}${url.startsWith('/') ? '' : '/'}${url}`;
  }

  /** Resolve all src="..." URLs in an HTML string (e.g. images embedded in text blocks) */
  private resolveUrlsInHtml(html: string, baseUrl: string): string {
    return html.replace(/src="([^"]+)"/g, (_match, url) => {
      return `src="${this.resolveUrl(url, baseUrl)}"`;
    });
  }

  render(options: RenderOptions): string {
    const {
      previewText,
      contentBlocks,
      globalStyles,
      socialMediaConfig,
      footerConfig,
      subscriberData,
      campaignSlug,
      trackingBaseUrl,
    } = options;

    const gs = {
      emailWidth: 600,
      backgroundColor: '#F1F5F9',
      contentBackgroundColor: '#FFFFFF',
      defaultFont: 'Arial, sans-serif',
      defaultTextColor: '#1E293B',
      defaultLinkColor: '#3B82F6',
      ...globalStyles,
    };

    // Use FRONTEND_URL as the public base for all asset URLs — same approach as emailTemplateRenderer.ts
    const frontendUrl = process.env.FRONTEND_URL || '';
    const baseUrl = frontendUrl || trackingBaseUrl || 'http://localhost:5000';
    const header = globalStyles.header || {};
    const blocks = (contentBlocks || [])
      .sort((a, b) => a.order - b.order)
      .map((block) => this.renderBlock(block, gs, socialMediaConfig, baseUrl, subscriberData))
      .join('');

    const headerHtml = this.renderHeader(header, gs, baseUrl, footerConfig?.companyName);
    const socialHtml = this.renderSocialMedia(socialMediaConfig, gs, campaignSlug);
    const footerHtml = this.renderFooter(footerConfig, gs, subscriberData);
    // Tracking pixel uses trackingBaseUrl (may differ from asset base URL)
    const pixelBase = trackingBaseUrl || baseUrl;
    const trackingPixel = subscriberData?.sendLogId && pixelBase
      ? `<img src="${pixelBase}/api/newsletter/track/open/${subscriberData.sendLogId}.png" width="1" height="1" alt="" style="display:block;width:1px;height:1px;border:0;" />`
      : '';

    const html = `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>${this.escapeHtml(options.subject)}</title>
<!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
<style type="text/css">
body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;}
table,td{mso-table-lspace:0pt;mso-table-rspace:0pt;}
img{-ms-interpolation-mode:bicubic;border:0;height:auto;line-height:100%;outline:none;text-decoration:none;}
body{height:100%!important;margin:0!important;padding:0!important;width:100%!important;}
</style>
${previewText ? `<div style="display:none;font-size:1px;color:#F1F5F9;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${this.escapeHtml(previewText)}${'&nbsp;'.repeat(80)}</div>` : ''}
</head>
<body style="margin:0;padding:0;background-color:${gs.backgroundColor};font-family:${gs.defaultFont};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${gs.backgroundColor}" style="background-color:${gs.backgroundColor};">
<tr><td align="center" style="padding:20px 10px;">
<table role="presentation" width="${gs.emailWidth}" cellpadding="0" cellspacing="0" border="0" bgcolor="${gs.contentBackgroundColor}" style="max-width:${gs.emailWidth}px;width:100%;background-color:${gs.contentBackgroundColor};">
${headerHtml}
<tr><td style="padding:0 24px;">
${blocks || `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:40px 0;text-align:center;color:#94A3B8;font-size:14px;font-family:${gs.defaultFont};">No content</td></tr></table>`}
</td></tr>
${socialHtml}
${footerHtml}
</table>
${trackingPixel}
</td></tr>
</table>
</body>
</html>`;

    // Log HTML size — Gmail clips emails over 102KB
    const htmlSizeKB = Buffer.byteLength(html, 'utf8') / 1024;
    console.log(`[EmailRendering] Generated HTML size: ${htmlSizeKB.toFixed(1)}KB`);
    if (htmlSizeKB > 80) {
      console.warn(`[EmailRendering] WARNING: HTML size ${htmlSizeKB.toFixed(1)}KB exceeds 80KB safe limit — Gmail may clip this email`);
    }

    return html;
  }

  private renderHeader(header: GlobalStylesConfig['header'], gs: any, baseUrl: string, companyName?: string): string {
    if (header?.showLogo === false) return '';

    const bgColor = header?.backgroundColor || '#FFFFFF';
    const padding = header?.padding || 24;
    const alignment = header?.alignment || 'center';
    const logoAlt = companyName ? this.escapeHtml(companyName) : 'Logo';

    let logoHtml = `<span style="display:inline-block;padding:12px 24px;background-color:#F1F5F9;border-radius:6px;color:#94A3B8;font-size:14px;font-family:${gs.defaultFont};">Logo</span>`;
    if (header?.logoUrl) {
      const resolvedLogo = this.resolveUrl(header.logoUrl, baseUrl);
      if (resolvedLogo) {
        logoHtml = `<img src="${resolvedLogo}" alt="${logoAlt}" width="${header?.logoWidth || 150}" height="auto" style="display:inline-block;max-width:100%;height:auto;" />`;
      }
    }

    return `<tr><td align="${alignment}" bgcolor="${bgColor}" style="background-color:${bgColor};padding:${padding}px;text-align:${alignment};">${logoHtml}</td></tr>`;
  }

  private renderBlock(block: ContentBlock, gs: any, socialMediaConfig: SocialMediaConfig, baseUrl: string, subscriberData?: RenderOptions['subscriberData']): string {
    const s = block.settings;
    const paddingTop = s.paddingTop || 16;
    const paddingBottom = s.paddingBottom || 16;
    const blockBg = s.blockBackgroundColor ? `background-color:${s.blockBackgroundColor};` : '';

    switch (block.type) {
      case 'text':
        return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="${blockBg}padding:${paddingTop}px 0 ${paddingBottom}px;font-family:${gs.defaultFont};font-size:${s.fontSize || '16px'};color:${s.color || gs.defaultTextColor};text-align:${s.textAlign || 'left'};line-height:${(s.lineHeight || 150) / 100};">${this.resolveUrlsInHtml(s.html || '', baseUrl)}</td></tr></table>`;

      case 'image': {
        const imgSrc = this.resolveUrl(s.src, baseUrl);
        const imgAlt = this.escapeHtml(s.alt || 'Image');
        const width = s.width || 100;
        const borderRadius = s.borderRadius || 0;
        const alignment = s.alignment || 'center';
        const pixelWidth = Math.round(552 * width / 100);
        const img = imgSrc
          ? `<img src="${imgSrc}" alt="${imgAlt}" width="${pixelWidth}" height="auto" style="display:block;max-width:560px;width:100%;height:auto;border-radius:${borderRadius}px;" />`
          : `<div style="width:100%;height:160px;background-color:#E2E8F0;border-radius:${borderRadius}px;"></div>`;
        const linkUrl = s.linkUrl ? this.resolveUrl(s.linkUrl, baseUrl) || s.linkUrl : '';
        const linked = linkUrl ? `<a href="${linkUrl}" target="_blank">${img}</a>` : img;
        return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="${alignment}" style="${blockBg}padding:${paddingTop}px 0 ${paddingBottom}px;max-width:560px;">${linked}</td></tr></table>`;
      }

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
        const bgColor = isOutlined ? 'transparent' : (s.backgroundColor || '#4F46E5');
        const textColor = isOutlined ? (s.backgroundColor || '#4F46E5') : (s.textColor || '#FFFFFF');
        const border = isOutlined ? `border:2px solid ${s.backgroundColor || '#4F46E5'};` : '';
        const display = s.fullWidth ? 'display:block;' : 'display:inline-block;';

        const btnUrl = s.url ? (this.resolveUrl(s.url, baseUrl) || s.url) : '#';
        return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="${s.alignment || 'center'}" style="${blockBg}padding:${paddingTop}px 0 ${paddingBottom}px;"><a href="${btnUrl}" target="_blank" style="${display}padding:${sizeConfig.padding};font-size:${sizeConfig.fontSize};font-family:${gs.defaultFont};font-weight:600;color:${textColor};background-color:${bgColor};${border}border-radius:${radius};text-decoration:none;text-align:center;">${this.escapeHtml(s.text || 'Click here')}</a></td></tr></table>`;
      }

      case 'divider': {
        const divWidth = s.width || 100;
        return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="${blockBg}padding:${paddingTop}px 0 ${paddingBottom}px;"><table role="presentation" width="${divWidth}%" cellpadding="0" cellspacing="0" border="0"><tr><td style="border-top:${s.thickness || 1}px ${s.style || 'solid'} ${s.color || '#E2E8F0'};font-size:0;line-height:0;">&nbsp;</td></tr></table></td></tr></table>`;
      }

      case 'spacer':
        return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="${blockBg}height:${s.height || 24}px;font-size:0;line-height:0;">&nbsp;</td></tr></table>`;

      case 'productCard': {
        const showPrice = s.showPrice ?? true;
        const pricePrefix = s.pricePrefix || '';
        const cardBg = s.cardBackground || '#FFFFFF';
        const showBorder = s.showBorder ?? true;
        const cardPadding = s.padding ?? 16;
        const imgPos = s.imagePosition || (s.layout === 'vertical' ? 'top' : 'left');
        const isVertical = imgPos === 'top';
        const borderStyle = showBorder ? `border:1px solid #E2E8F0;` : '';

        const resolvedProductImg = this.resolveUrl(s.imageUrl, baseUrl);
        const imgCell = resolvedProductImg
          ? `<td width="${isVertical ? '100%' : '40%'}" bgcolor="#F1F5F9" style="background-color:#F1F5F9;padding:0;"><img src="${resolvedProductImg}" alt="${this.escapeHtml(s.title || 'Product')}" width="560" style="width:100%;max-width:560px;height:auto;display:block;" /></td>`
          : `<td width="${isVertical ? '100%' : '40%'}" bgcolor="#F1F5F9" style="background-color:#F1F5F9;height:160px;"></td>`;
        const priceHtml = showPrice && s.price ? `<p style="margin:0 0 8px;font-size:14px;font-weight:600;color:${gs.defaultLinkColor};">${this.escapeHtml(pricePrefix + s.price)}</p>` : '';
        const resolvedBtnUrl = this.resolveUrl(s.buttonUrl, baseUrl) || s.buttonUrl || '#';
        const textCell = `<td style="padding:${cardPadding}px;font-family:${gs.defaultFont};background-color:${cardBg};"><h3 style="margin:0 0 4px;font-size:16px;font-weight:600;color:${gs.defaultTextColor};">${this.escapeHtml(s.title || 'Product Name')}</h3>${priceHtml}<p style="margin:0 0 12px;font-size:14px;color:#64748B;">${this.escapeHtml(s.description || '')}</p>${s.buttonText ? `<a href="${resolvedBtnUrl}" target="_blank" style="display:inline-block;padding:8px 16px;font-size:13px;color:#FFFFFF;background-color:${gs.defaultLinkColor};text-decoration:none;font-weight:600;font-family:${gs.defaultFont};">${this.escapeHtml(s.buttonText)}</a>` : ''}</td>`;

        if (isVertical) {
          return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="${blockBg}padding:${paddingTop}px 16px ${paddingBottom}px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="${borderStyle}background-color:${cardBg};"><tr>${imgCell}</tr><tr>${textCell}</tr></table></td></tr></table>`;
        }
        const cellOrder = imgPos === 'right' ? `${textCell}${imgCell}` : `${imgCell}${textCell}`;
        return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="${blockBg}padding:${paddingTop}px 16px ${paddingBottom}px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="${borderStyle}background-color:${cardBg};"><tr>${cellOrder}</tr></table></td></tr></table>`;
      }

      case 'productGrid': {
        const gridProducts: any[] = s.products || [];
        const gridColumns = s.columns || 2;
        const gridCardBg = s.cardBackground || '#FFFFFF';
        const gridShowBorders = s.showBorders ?? true;
        const gridGap = s.gap ?? 16;
        const gridBorderStyle = gridShowBorders ? 'border:1px solid #E2E8F0;' : '';

        if (gridProducts.length === 0) {
          return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="${blockBg}padding:${paddingTop}px 16px ${paddingBottom}px;text-align:center;color:#94A3B8;font-size:14px;font-family:${gs.defaultFont};">Product grid — no products configured</td></tr></table>`;
        }

        const colWidth = Math.floor((100 - (gridColumns - 1) * 2) / gridColumns);
        const productCells = gridProducts.map((product: any) => {
          const resolvedGridImg = this.resolveUrl(product.imageUrl, baseUrl);
          const imgHtml = resolvedGridImg
            ? `<td bgcolor="#F1F5F9" style="background-color:#F1F5F9;padding:0;"><img src="${resolvedGridImg}" alt="${this.escapeHtml(product.title || 'Product')}" width="560" style="width:100%;max-width:560px;height:auto;display:block;" /></td>`
            : `<td bgcolor="#F1F5F9" style="background-color:#F1F5F9;height:120px;"></td>`;
          const priceHtml = product.price ? `<p style="margin:0 0 8px;font-size:13px;font-weight:600;color:${gs.defaultLinkColor};">${this.escapeHtml(product.price)}</p>` : '';
          const resolvedGridBtnUrl = this.resolveUrl(product.buttonUrl, baseUrl) || product.buttonUrl || '#';
          const btnHtml = product.buttonText ? `<a href="${resolvedGridBtnUrl}" target="_blank" style="display:inline-block;padding:6px 12px;font-size:12px;color:#FFFFFF;background-color:${gs.defaultLinkColor};text-decoration:none;font-weight:600;font-family:${gs.defaultFont};">${this.escapeHtml(product.buttonText)}</a>` : '';

          return `<td width="${colWidth}%" valign="top"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="${gridBorderStyle}background-color:${gridCardBg};"><tr>${imgHtml}</tr><tr><td style="padding:12px;font-family:${gs.defaultFont};"><h4 style="margin:0 0 4px;font-size:14px;font-weight:600;color:${gs.defaultTextColor};">${this.escapeHtml(product.title || 'Product')}</h4>${priceHtml}${btnHtml}</td></tr></table></td>`;
        }).join(`<td width="${gridGap}" style="font-size:0;">&nbsp;</td>`);

        return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="${blockBg}padding:${paddingTop}px 16px ${paddingBottom}px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>${productCells}</tr></table></td></tr></table>`;
      }

      case 'coupon':
        return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="${blockBg}padding:${paddingTop}px 16px ${paddingBottom}px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:2px dashed ${s.borderColor || '#F59E0B'};border-radius:8px;background-color:${s.backgroundColor || '#FEF3C7'};"><tr><td style="padding:24px;text-align:center;font-family:${gs.defaultFont};"><p style="margin:0 0 12px;font-size:15px;color:${gs.defaultTextColor};">${this.escapeHtml(s.description || '')}</p><div style="display:inline-block;padding:8px 20px;background-color:#FFFFFF;border:2px dashed #D1D5DB;border-radius:6px;font-size:18px;font-weight:700;letter-spacing:2px;color:${gs.defaultTextColor};">${this.escapeHtml(s.code || 'CODE')}</div>${s.validUntil ? `<p style="margin:12px 0 0;font-size:12px;color:#92400E;">Valid until ${this.escapeHtml(s.validUntil)}</p>` : ''}</td></tr></table></td></tr></table>`;

      case 'hero': {
        const heroBgColor = s.backgroundColor || '#4F46E5';
        const heroTextColor = s.textColor || '#FFFFFF';
        // Gmail strips linear-gradient and background-image on td; use bgcolor attribute as reliable fallback
        let bgStyle = `background-color:${heroBgColor};`;
        if (s.backgroundType === 'gradient') {
          bgStyle = `background:linear-gradient(135deg, ${heroBgColor}, ${s.gradientEnd || '#7C3AED'});background-color:${heroBgColor};`;
        } else if (s.backgroundType === 'image' && s.backgroundImage) {
          const resolvedHeroBg = this.resolveUrl(s.backgroundImage, baseUrl);
          bgStyle = `background-image:url(${resolvedHeroBg});background-size:cover;background-position:center;background-color:${heroBgColor};`;
        }

        const heroBtn = s.buttonUrl ? (this.resolveUrl(s.buttonUrl, baseUrl) || s.buttonUrl) : '#';
        return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="${heroBgColor}" style="${bgStyle}padding:${paddingTop}px 32px ${paddingBottom}px;text-align:${s.textAlign || 'center'};font-family:${gs.defaultFont};"><h1 style="margin:0 0 8px;font-size:28px;font-weight:700;color:${heroTextColor};">${this.escapeHtml(s.heading || 'Hero Heading')}</h1>${s.subheading ? `<p style="margin:0 0 20px;font-size:16px;color:${heroTextColor};">${this.escapeHtml(s.subheading)}</p>` : ''}${s.buttonText ? `<a href="${heroBtn}" target="_blank" style="display:inline-block;padding:12px 28px;font-size:15px;font-weight:600;color:${heroBgColor};background-color:${heroTextColor};text-decoration:none;font-family:${gs.defaultFont};">${this.escapeHtml(s.buttonText)}</a>` : ''}</td></tr></table>`;
      }

      case 'personalization': {
        // Use fallback text when subscriber has no firstName, otherwise use content with {first_name} placeholder
        const hasFirstName = subscriberData?.firstName;
        const personalizationText = hasFirstName
          ? (s.content || 'Hi {first_name}!')
          : (s.fallback || s.content || 'Hi {first_name}!');
        return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="${blockBg}padding:${paddingTop}px 0 ${paddingBottom}px;font-family:${gs.defaultFont};font-size:16px;color:${gs.defaultTextColor};">${personalizationText}</td></tr></table>`;
      }

      case 'socialMedia':
        return this.renderSocialMediaBlock(socialMediaConfig, gs);

      case 'columns': {
        const layout = s.layout || '1/2-1/2';
        const [w1, w2] = layout === '1/3-2/3' ? ['33%', '67%'] : layout === '2/3-1/3' ? ['67%', '33%'] : ['50%', '50%'];
        return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="${blockBg}padding:${paddingTop}px 0 ${paddingBottom}px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td width="${w1}" valign="top" style="padding:8px;border:1px dashed #CBD5E1;border-radius:4px;color:#94A3B8;font-size:12px;font-family:${gs.defaultFont};text-align:center;">Column 1</td><td width="16" style="font-size:0;">&nbsp;</td><td width="${w2}" valign="top" style="padding:8px;border:1px dashed #CBD5E1;border-radius:4px;color:#94A3B8;font-size:12px;font-family:${gs.defaultFont};text-align:center;">Column 2</td></tr></table></td></tr></table>`;
      }

      default:
        return '';
    }
  }

  private getSocialIconData(platform: string, color: string): { bgColor: string; iconHtml: string; label: string } {
    const brandColors: Record<string, string> = {
      facebook: '#1877F2', twitter: '#000000', x: '#000000', instagram: '#E1306C',
      linkedin: '#0A66C2', youtube: '#FF0000', tiktok: '#000000', pinterest: '#BD081C',
      github: '#333333', whatsapp: '#25D366', telegram: '#26A5E4', discord: '#5865F2',
      snapchat: '#FFFC00', reddit: '#FF4500', tumblr: '#36465D', medium: '#000000',
    };
    const iconBaseUrl = `${process.env.FRONTEND_URL || 'https://swadestack.com'}/images/icons`;
    const pngIcons: Record<string, string> = {
      facebook: `${iconBaseUrl}/icon-facebook.png`,
      instagram: `${iconBaseUrl}/icon-instagram.png`,
      youtube: `${iconBaseUrl}/icon-youtube.png`,
    };
    const key = platform.toLowerCase();
    const bgColor = brandColors[key] || color;
    const pngUrl = pngIcons[key];
    const label = platform.charAt(0).toUpperCase() + platform.slice(1);
    const iconHtml = pngUrl
      ? `<img src="${pngUrl}" alt="${label}" width="20" height="20" style="display:block;margin:0 auto;" />`
      : `<span style="font-size:14px;font-weight:700;color:#FFFFFF;font-family:Arial,sans-serif;line-height:32px;">${platform.charAt(0).toUpperCase()}</span>`;
    return { bgColor, iconHtml, label };
  }

  private buildIconRow(platforms: Array<{ platform: string; url: string; enabled: boolean }>, gs: any, urlSuffix: string): string {
    const cells: string[] = [];
    platforms.forEach((p, i) => {
      if (i > 0) cells.push('<td width="16" style="width:16px;"></td>');
      const { bgColor, iconHtml } = this.getSocialIconData(p.platform, gs.defaultLinkColor);
      cells.push(`<td width="32" height="32" align="center" valign="middle" bgcolor="${bgColor}" style="background-color:${bgColor};width:32px;height:32px;border-radius:50%;text-align:center;line-height:0;"><a href="${p.url}${urlSuffix}" target="_blank" style="text-decoration:none;">${iconHtml}</a></td>`);
    });
    return cells.join('');
  }

  private renderSocialMediaBlock(socialMediaConfig: SocialMediaConfig, gs: any): string {
    const platforms = (socialMediaConfig.platforms || []).filter(p => p.enabled && p.url);
    if (platforms.length === 0) return '';

    const iconCells = this.buildIconRow(platforms, gs, '');

    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="text-align:center;padding:16px 0;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;"><tr>${iconCells}</tr></table></td></tr></table>`;
  }

  private renderSocialMedia(socialMediaConfig: SocialMediaConfig, gs: any, campaignSlug?: string): string {
    const platforms = (socialMediaConfig.platforms || []).filter(p => p.enabled && p.url);
    if (platforms.length === 0) return '';

    const utm = campaignSlug ? `?utm_source=newsletter&utm_medium=email&utm_campaign=${campaignSlug}` : '';
    const iconCells = this.buildIconRow(platforms, gs, utm);

    return `<tr><td align="center" style="text-align:center;padding:16px 0;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;"><tr>${iconCells}</tr></table></td></tr>`;
  }

  private renderFooter(footerConfig: FooterConfig, gs: any, subscriberData?: RenderOptions['subscriberData']): string {
    const fc = {
      backgroundColor: '#F8FAFC',
      textColor: '#94A3B8',
      padding: 24,
      showUnsubscribe: true,
      ...footerConfig,
    };

    const year = new Date().getFullYear();
    const email = subscriberData?.email || '{EMAIL}';
    const unsubUrl = subscriberData?.unsubscribeUrl || '#';

    let html = `<tr><td bgcolor="${fc.backgroundColor}" style="background-color:${fc.backgroundColor};padding:${fc.padding}px;text-align:center;font-family:${gs.defaultFont};">`;

    // Recipient info
    html += `<p style="margin:0 0 8px;font-size:12px;color:${fc.textColor};">This email was sent to ${this.escapeHtml(email)}</p>`;

    // Company info
    if (fc.companyName) {
      html += `<p style="margin:0 0 4px;font-size:13px;font-weight:600;color:${fc.textColor};">${this.escapeHtml(fc.companyName)}</p>`;
    }
    if (fc.addressLine) {
      html += `<p style="margin:0 0 8px;font-size:12px;color:${fc.textColor};">${this.escapeHtml(fc.addressLine)}</p>`;
    }

    // Unsubscribe link (always shown — required by law)
    html += `<p style="margin:8px 0 0;font-size:11px;"><a href="${unsubUrl}" style="color:${gs.defaultLinkColor};text-decoration:underline;">${this.escapeHtml(fc.unsubscribeText || 'Unsubscribe from this list')}</a></p>`;

    // Copyright
    if (fc.companyName) {
      html += `<p style="margin:8px 0 0;font-size:11px;color:${fc.textColor};">&copy; ${year} ${this.escapeHtml(fc.companyName)}. All rights reserved.</p>`;
    }

    html += '</td></tr>';
    return html;
  }

  replaceVariables(html: string, variables: Record<string, string>): string {
    let result = html;
    for (const [key, value] of Object.entries(variables)) {
      result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), this.escapeHtml(value));
    }
    return result;
  }

  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}

export default new EmailRenderingService();
