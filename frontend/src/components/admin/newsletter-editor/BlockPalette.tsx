import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Type,
  ImageIcon,
  RectangleHorizontal,
  Minus,
  Space,
  Tag,
  Ticket,
  Zap,
  User,
  Share2,
  Columns2,
  LayoutGrid,
} from 'lucide-react';
import { BlockType } from '../../../models/types/newsletterAdmin.types';

interface BlockPaletteItem {
  type: BlockType;
  label: string;
  icon: React.ReactNode;
  category: string;
}

interface BlockPaletteProps {
  onAddBlock: (type: BlockType) => void;
}

const BlockPalette: React.FC<BlockPaletteProps> = ({ onAddBlock }) => {
  const { t } = useTranslation();

  const blocks: BlockPaletteItem[] = [
    // Layout
    { type: 'columns', label: t('newsletterAdmin.editor.blocks.columns', 'Columns'), icon: <Columns2 className="w-5 h-5" />, category: 'layout' },
    // Content
    { type: 'text', label: t('newsletterAdmin.editor.blocks.text', 'Text'), icon: <Type className="w-5 h-5" />, category: 'content' },
    { type: 'image', label: t('newsletterAdmin.editor.blocks.image', 'Image'), icon: <ImageIcon className="w-5 h-5" />, category: 'content' },
    { type: 'button', label: t('newsletterAdmin.editor.blocks.button', 'Button / CTA'), icon: <RectangleHorizontal className="w-5 h-5" />, category: 'content' },
    { type: 'divider', label: t('newsletterAdmin.editor.blocks.divider', 'Divider'), icon: <Minus className="w-5 h-5" />, category: 'content' },
    { type: 'spacer', label: t('newsletterAdmin.editor.blocks.spacer', 'Spacer'), icon: <Space className="w-5 h-5" />, category: 'content' },
    // Commerce
    { type: 'productCard', label: t('newsletterAdmin.editor.blocks.productCard', 'Single Product Card'), icon: <Tag className="w-5 h-5" />, category: 'commerce' },
    { type: 'productGrid', label: t('newsletterAdmin.editor.blocks.productGrid', 'Product Grid (2-3 items)'), icon: <LayoutGrid className="w-5 h-5" />, category: 'commerce' },
    { type: 'coupon', label: t('newsletterAdmin.editor.blocks.coupon', 'Coupon Block'), icon: <Ticket className="w-5 h-5" />, category: 'commerce' },
    { type: 'hero', label: t('newsletterAdmin.editor.blocks.hero', 'Hero Banner'), icon: <Zap className="w-5 h-5" />, category: 'commerce' },
    // Dynamic
    { type: 'personalization', label: t('newsletterAdmin.editor.blocks.personalization', 'Personalization'), icon: <User className="w-5 h-5" />, category: 'dynamic' },
    { type: 'socialMedia', label: t('newsletterAdmin.editor.blocks.socialMedia', 'Social Media Links'), icon: <Share2 className="w-5 h-5" />, category: 'dynamic' },
  ];

  const categories = [
    { key: 'layout', label: t('newsletterAdmin.editor.categories.layout', 'LAYOUT') },
    { key: 'content', label: t('newsletterAdmin.editor.categories.content', 'CONTENT') },
    { key: 'commerce', label: t('newsletterAdmin.editor.categories.commerce', 'COMMERCE') },
    { key: 'dynamic', label: t('newsletterAdmin.editor.categories.dynamic', 'DYNAMIC') },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-white px-1">
        {t('newsletterAdmin.editor.contentBlocks', 'Content Blocks')}
      </h3>

      {categories.map((category) => {
        const categoryBlocks = blocks.filter((b) => b.category === category.key);
        if (categoryBlocks.length === 0) return null;

        return (
          <div key={category.key}>
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider px-1 mb-2">
              {category.label}
            </p>
            <div className="space-y-1">
              {categoryBlocks.map((block) => (
                <button
                  key={block.type}
                  onClick={() => onAddBlock(block.type)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-neutral-300 hover:bg-surface-700 hover:text-white rounded-lg transition-colors"
                >
                  <span className="text-neutral-400">{block.icon}</span>
                  {block.label}
                </button>
              ))}
            </div>
          </div>
        );
      })}

      <p className="text-xs text-neutral-500 px-1 pt-2">
        {t('newsletterAdmin.editor.clickToAdd', 'Click a block to add it to the email')}
      </p>
    </div>
  );
};

export default BlockPalette;
