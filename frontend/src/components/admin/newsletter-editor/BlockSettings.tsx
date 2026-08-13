import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Copy, Trash2, ChevronUp, ChevronDown, Pencil, X, Package } from '../../common/icons';
import { ContentBlock, ProductSearchItem } from '../../../models/types/newsletterAdmin.types';
import ProductPicker from './ProductPicker';

interface BlockSettingsProps {
  block: ContentBlock;
  onUpdate: (settings: Record<string, any>) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onBack: () => void;
}

const ColorInput: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
}> = ({ label, value, onChange }) => (
  <div>
    <label className="block text-xs font-medium text-neutral-400 mb-1">{label}</label>
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={value || '#000000'}
        onChange={(e) => onChange(e.target.value)}
        className="w-8 h-8 rounded border border-surface-600 cursor-pointer bg-transparent"
      />
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 bg-surface-900 border border-surface-600 rounded-lg px-3 py-1.5 text-sm text-white"
        placeholder="#000000"
      />
    </div>
  </div>
);

const SelectInput: React.FC<{
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}> = ({ label, value, options, onChange }) => (
  <div>
    <label className="block text-xs font-medium text-neutral-400 mb-1">{label}</label>
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-surface-900 border border-surface-600 rounded-lg px-3 py-2 text-sm text-white"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

const TextInput: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
}> = ({ label, value, onChange, placeholder, multiline }) => (
  <div>
    <label className="block text-xs font-medium text-neutral-400 mb-1">{label}</label>
    {multiline ? (
      <textarea
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className="w-full bg-surface-900 border border-surface-600 rounded-lg px-3 py-2 text-sm text-white resize-none"
      />
    ) : (
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-surface-900 border border-surface-600 rounded-lg px-3 py-2 text-sm text-white"
      />
    )}
  </div>
);

const SliderInput: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  unit?: string;
  onChange: (value: number) => void;
}> = ({ label, value, min, max, unit = 'px', onChange }) => (
  <div>
    <label className="block text-xs font-medium text-neutral-400 mb-1">
      {label}: {value}{unit}
    </label>
    <input
      type="range"
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value))}
      className="w-full accent-primary-500"
    />
  </div>
);

const AlignmentInput: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
}> = ({ label, value, onChange }) => (
  <div>
    <label className="block text-xs font-medium text-neutral-400 mb-1">{label}</label>
    <div className="flex gap-1">
      {['left', 'center', 'right'].map((align) => (
        <button
          key={align}
          onClick={() => onChange(align)}
          className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            value === align
              ? 'bg-primary-600 text-white'
              : 'bg-surface-900 text-neutral-400 hover:text-white border border-surface-600'
          }`}
        >
          {align.charAt(0).toUpperCase() + align.slice(1)}
        </button>
      ))}
    </div>
  </div>
);

// ==================== Product Card Settings ====================

const ProductCardSettings: React.FC<{
  s: Record<string, any>;
  update: (key: string, value: any) => void;
  onUpdate: (settings: Record<string, any>) => void;
  t: (key: string, fallback: string) => string;
}> = ({ s, update, onUpdate, t }) => {
  const [showPicker, setShowPicker] = useState(false);
  const source = s.source || 'manual';

  const handleProductSelect = (product: ProductSearchItem) => {
    onUpdate({
      ...s,
      productId: product.id,
      productType: product.type,
      title: product.name,
      description: product.description,
      price: product.price,
      imageUrl: product.imageUrl,
      buttonUrl: product.pageUrl,
      buttonText: product.buttonText || 'View Details',
    });
    setShowPicker(false);
  };

  const handleClearProduct = () => {
    onUpdate({
      ...s,
      productId: null,
      productType: null,
      title: '',
      description: '',
      price: '',
      imageUrl: '',
      buttonUrl: '',
    });
  };

  return (
    <>
      {/* Source toggle */}
      <div>
        <label className="block text-xs font-medium text-neutral-400 mb-1">
          {t('newsletterAdmin.editor.settings.productSource', 'Product Source')}
        </label>
        <div className="flex gap-1">
          {(['catalog', 'manual'] as const).map((src) => (
            <button
              key={src}
              onClick={() => update('source', src)}
              className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                source === src
                  ? 'bg-primary-600 text-white'
                  : 'bg-surface-900 text-neutral-400 hover:text-white border border-surface-600'
              }`}
            >
              {src === 'catalog'
                ? t('newsletterAdmin.editor.settings.pickFromCatalog', 'Pick from catalog')
                : t('newsletterAdmin.editor.settings.manualEntry', 'Manual entry')}
            </button>
          ))}
        </div>
      </div>

      {/* Catalog picker */}
      {source === 'catalog' && !s.productId && !showPicker && (
        <button
          onClick={() => setShowPicker(true)}
          className="w-full py-3 border-2 border-dashed border-surface-600 rounded-lg text-sm text-neutral-400 hover:text-white hover:border-primary-500 transition-colors"
        >
          {t('newsletterAdmin.editor.settings.pickFromCatalog', 'Pick from catalog')}
        </button>
      )}

      {source === 'catalog' && (showPicker && !s.productId) && (
        <ProductPicker
          onSelect={handleProductSelect}
          onClose={() => setShowPicker(false)}
        />
      )}

      {/* Selected product card */}
      {source === 'catalog' && s.productId && (
        <div className="p-3 bg-surface-800 rounded-lg border border-surface-600">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded bg-surface-700 flex-shrink-0 overflow-hidden">
              {s.imageUrl ? (
                <img src={s.imageUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-4 h-4 text-neutral-500" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white font-medium truncate">{s.title || 'Product'}</p>
              <p className="text-xs text-primary-400">{s.price}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { setShowPicker(true); update('productId', null); }}
              className="flex-1 px-2 py-1 text-xs text-neutral-300 bg-surface-700 hover:bg-surface-600 rounded transition-colors"
            >
              {t('newsletterAdmin.editor.settings.changeProduct', 'Change')}
            </button>
            <button
              onClick={handleClearProduct}
              className="flex-1 px-2 py-1 text-xs text-red-400 bg-red-600/10 hover:bg-red-600/20 rounded transition-colors"
            >
              {t('newsletterAdmin.editor.settings.clearProduct', 'Clear')}
            </button>
          </div>
        </div>
      )}

      {/* Editable override fields — always visible */}
      <TextInput
        label={t('newsletterAdmin.editor.settings.title', 'Title')}
        value={s.title}
        onChange={(v) => update('title', v)}
        placeholder="Product name"
      />
      <TextInput
        label={t('newsletterAdmin.editor.settings.description', 'Description')}
        value={s.description}
        onChange={(v) => update('description', v)}
        placeholder="Short description"
        multiline
      />
      <TextInput
        label={t('newsletterAdmin.editor.settings.price', 'Price')}
        value={s.price}
        onChange={(v) => update('price', v)}
        placeholder="24 999 SEK"
      />
      <TextInput
        label={t('newsletterAdmin.editor.settings.imageUrl', 'Image URL')}
        value={s.imageUrl}
        onChange={(v) => update('imageUrl', v)}
        placeholder="https://..."
      />
      <TextInput
        label={t('newsletterAdmin.editor.settings.buttonText', 'Button Text')}
        value={s.buttonText}
        onChange={(v) => update('buttonText', v)}
        placeholder="View Details"
      />
      <TextInput
        label={t('newsletterAdmin.editor.settings.buttonUrl', 'Button URL')}
        value={s.buttonUrl}
        onChange={(v) => update('buttonUrl', v)}
        placeholder="https://..."
      />

      {/* Additional settings */}
      <div className="border-t border-surface-700 pt-3 space-y-3">
        <label className="flex items-center gap-2 text-sm text-neutral-300 cursor-pointer">
          <input
            type="checkbox"
            checked={s.showPrice ?? true}
            onChange={(e) => update('showPrice', e.target.checked)}
            className="rounded border-surface-600 bg-surface-900 text-primary-600 focus:ring-primary-500"
          />
          {t('newsletterAdmin.editor.settings.showPrice', 'Show Price')}
        </label>
        <TextInput
          label={t('newsletterAdmin.editor.settings.pricePrefix', 'Price Prefix')}
          value={s.pricePrefix || ''}
          onChange={(v) => update('pricePrefix', v)}
          placeholder="From "
        />
        <SelectInput
          label={t('newsletterAdmin.editor.settings.imagePosition', 'Image Position')}
          value={s.imagePosition || (s.layout === 'vertical' ? 'top' : 'left')}
          options={[
            { value: 'left', label: t('newsletterAdmin.editor.settings.imageLeft', 'Left') },
            { value: 'right', label: t('newsletterAdmin.editor.settings.imageRight', 'Right') },
            { value: 'top', label: t('newsletterAdmin.editor.settings.imageTop', 'Top') },
          ]}
          onChange={(v) => update('imagePosition', v)}
        />
        <ColorInput
          label={t('newsletterAdmin.editor.settings.cardBackground', 'Card Background')}
          value={s.cardBackground || '#FFFFFF'}
          onChange={(v) => update('cardBackground', v)}
        />
        <label className="flex items-center gap-2 text-sm text-neutral-300 cursor-pointer">
          <input
            type="checkbox"
            checked={s.showBorder ?? true}
            onChange={(e) => update('showBorder', e.target.checked)}
            className="rounded border-surface-600 bg-surface-900 text-primary-600 focus:ring-primary-500"
          />
          {t('newsletterAdmin.editor.settings.showBorder', 'Show Border')}
        </label>
        <SliderInput
          label={t('newsletterAdmin.editor.settings.borderRadius', 'Border Radius')}
          value={s.borderRadius ?? 8}
          min={0}
          max={24}
          onChange={(v) => update('borderRadius', v)}
        />
        <SliderInput
          label={t('newsletterAdmin.editor.settings.padding', 'Padding')}
          value={s.padding ?? 16}
          min={0}
          max={32}
          onChange={(v) => update('padding', v)}
        />
      </div>
    </>
  );
};

// ==================== Product Grid Settings ====================

const ProductGridSettings: React.FC<{
  s: Record<string, any>;
  update: (key: string, value: any) => void;
  onUpdate: (settings: Record<string, any>) => void;
  t: (key: string, fallback: string) => string;
}> = ({ s, update, onUpdate, t }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const products: any[] = s.products || [];
  const maxProducts = s.columns || 2;

  const handleProductSelect = (product: ProductSearchItem) => {
    const newProduct = {
      id: product.id,
      type: product.type,
      title: product.name,
      description: product.description,
      price: product.price,
      imageUrl: product.imageUrl,
      buttonText: product.buttonText || 'View Details',
      buttonUrl: product.pageUrl,
    };
    const newProducts = [...products, newProduct];
    update('products', newProducts);
    setShowPicker(false);
  };

  const handleRemoveProduct = (index: number) => {
    const newProducts = products.filter((_, i) => i !== index);
    update('products', newProducts);
    if (editingIndex === index) setEditingIndex(null);
  };

  const handleUpdateProduct = (index: number, key: string, value: string) => {
    const newProducts = [...products];
    newProducts[index] = { ...newProducts[index], [key]: value };
    update('products', newProducts);
  };

  const handleMoveProduct = (index: number, direction: 'up' | 'down') => {
    const newProducts = [...products];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= newProducts.length) return;
    [newProducts[index], newProducts[swapIndex]] = [newProducts[swapIndex], newProducts[index]];
    update('products', newProducts);
    if (editingIndex === index) setEditingIndex(swapIndex);
    else if (editingIndex === swapIndex) setEditingIndex(index);
  };

  return (
    <>
      {/* Columns selector */}
      <div>
        <label className="block text-xs font-medium text-neutral-400 mb-1">
          {t('newsletterAdmin.editor.settings.columns', 'Columns')}
        </label>
        <div className="flex gap-1">
          {[2, 3].map((cols) => (
            <button
              key={cols}
              onClick={() => {
                const updated: Record<string, any> = { ...s, columns: cols };
                if (products.length > cols) {
                  updated.products = products.slice(0, cols);
                }
                onUpdate(updated);
              }}
              className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                (s.columns || 2) === cols
                  ? 'bg-primary-600 text-white'
                  : 'bg-surface-900 text-neutral-400 hover:text-white border border-surface-600'
              }`}
            >
              {cols}
            </button>
          ))}
        </div>
      </div>

      {/* Products list */}
      <div>
        <label className="block text-xs font-medium text-neutral-400 mb-2">
          {t('newsletterAdmin.editor.settings.products', 'Products')} ({products.length}/{maxProducts})
        </label>

        {products.length === 0 && (
          <p className="text-xs text-neutral-500 text-center py-3">
            {t('newsletterAdmin.editor.settings.noProducts', 'No products added yet')}
          </p>
        )}

        <div className="space-y-2">
          {products.map((product: any, index: number) => (
            <div key={index} className="bg-surface-800 rounded-lg border border-surface-600 overflow-hidden">
              {/* Product row */}
              <div className="flex items-center gap-2 p-2">
                <div className="w-8 h-8 rounded bg-surface-700 flex-shrink-0 overflow-hidden">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-3 h-3 text-neutral-500" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white truncate">{product.title || 'Product'}</p>
                  <p className="text-xs text-primary-400">{product.price}</p>
                </div>
                <div className="flex items-center gap-0.5">
                  {index > 0 && (
                    <button
                      onClick={() => handleMoveProduct(index, 'up')}
                      className="p-1 text-neutral-400 hover:text-white"
                      title={t('newsletterAdmin.editor.settings.moveUp', 'Move Up')}
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {index < products.length - 1 && (
                    <button
                      onClick={() => handleMoveProduct(index, 'down')}
                      className="p-1 text-neutral-400 hover:text-white"
                      title={t('newsletterAdmin.editor.settings.moveDown', 'Move Down')}
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => setEditingIndex(editingIndex === index ? null : index)}
                    className={`p-1 transition-colors ${editingIndex === index ? 'text-primary-400' : 'text-neutral-400 hover:text-white'}`}
                    title={t('newsletterAdmin.editor.settings.editProduct', 'Edit')}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleRemoveProduct(index)}
                    className="p-1 text-red-400 hover:text-red-300"
                    title={t('newsletterAdmin.editor.settings.removeProduct', 'Remove')}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Inline edit fields */}
              {editingIndex === index && (
                <div className="p-2 pt-0 space-y-2 border-t border-surface-700">
                  <TextInput
                    label={t('newsletterAdmin.editor.settings.title', 'Title')}
                    value={product.title}
                    onChange={(v) => handleUpdateProduct(index, 'title', v)}
                    placeholder="Product name"
                  />
                  <TextInput
                    label={t('newsletterAdmin.editor.settings.description', 'Description')}
                    value={product.description}
                    onChange={(v) => handleUpdateProduct(index, 'description', v)}
                    placeholder="Short description"
                    multiline
                  />
                  <TextInput
                    label={t('newsletterAdmin.editor.settings.price', 'Price')}
                    value={product.price}
                    onChange={(v) => handleUpdateProduct(index, 'price', v)}
                    placeholder="24 999 SEK"
                  />
                  <TextInput
                    label={t('newsletterAdmin.editor.settings.buttonText', 'Button Text')}
                    value={product.buttonText}
                    onChange={(v) => handleUpdateProduct(index, 'buttonText', v)}
                    placeholder="View Details"
                  />
                  <TextInput
                    label={t('newsletterAdmin.editor.settings.buttonUrl', 'Button URL')}
                    value={product.buttonUrl}
                    onChange={(v) => handleUpdateProduct(index, 'buttonUrl', v)}
                    placeholder="https://..."
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add product */}
      {products.length < maxProducts && !showPicker && (
        <button
          onClick={() => setShowPicker(true)}
          className="w-full py-2.5 border-2 border-dashed border-surface-600 rounded-lg text-xs font-medium text-neutral-400 hover:text-white hover:border-primary-500 transition-colors"
        >
          + {t('newsletterAdmin.editor.settings.addProduct', 'Add Product')}
        </button>
      )}

      {products.length >= maxProducts && (
        <p className="text-xs text-neutral-500 text-center">
          {t('newsletterAdmin.editor.settings.maxProducts', 'Maximum {{count}} products').replace('{{count}}', String(maxProducts))}
        </p>
      )}

      {showPicker && (
        <ProductPicker
          onSelect={handleProductSelect}
          onClose={() => setShowPicker(false)}
        />
      )}

      {/* Grid style settings */}
      <div className="border-t border-surface-700 pt-3 space-y-3">
        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
          {t('newsletterAdmin.editor.settings.gridStyle', 'Grid Style')}
        </p>
        <ColorInput
          label={t('newsletterAdmin.editor.settings.cardBackground', 'Card Background')}
          value={s.cardBackground || '#FFFFFF'}
          onChange={(v) => update('cardBackground', v)}
        />
        <label className="flex items-center gap-2 text-sm text-neutral-300 cursor-pointer">
          <input
            type="checkbox"
            checked={s.showBorders ?? true}
            onChange={(e) => update('showBorders', e.target.checked)}
            className="rounded border-surface-600 bg-surface-900 text-primary-600 focus:ring-primary-500"
          />
          {t('newsletterAdmin.editor.settings.showBorders', 'Show Borders')}
        </label>
        <label className="flex items-center gap-2 text-sm text-neutral-300 cursor-pointer">
          <input
            type="checkbox"
            checked={s.equalHeight ?? true}
            onChange={(e) => update('equalHeight', e.target.checked)}
            className="rounded border-surface-600 bg-surface-900 text-primary-600 focus:ring-primary-500"
          />
          {t('newsletterAdmin.editor.settings.equalHeight', 'Equal Height Cards')}
        </label>
        <SliderInput
          label={t('newsletterAdmin.editor.settings.gap', 'Gap')}
          value={s.gap ?? 16}
          min={0}
          max={32}
          onChange={(v) => update('gap', v)}
        />
      </div>
    </>
  );
};

const BlockSettings: React.FC<BlockSettingsProps> = ({
  block,
  onUpdate,
  onDuplicate,
  onDelete,
  onBack,
}) => {
  const { t } = useTranslation();
  const s = block.settings;

  const update = (key: string, value: any) => {
    onUpdate({ ...s, [key]: value });
  };

  const blockTypeLabels: Record<string, string> = {
    text: t('newsletterAdmin.editor.blocks.text', 'Text'),
    image: t('newsletterAdmin.editor.blocks.image', 'Image'),
    button: t('newsletterAdmin.editor.blocks.button', 'Button / CTA'),
    divider: t('newsletterAdmin.editor.blocks.divider', 'Divider'),
    spacer: t('newsletterAdmin.editor.blocks.spacer', 'Spacer'),
    productCard: t('newsletterAdmin.editor.blocks.productCard', 'Single Product Card'),
    productGrid: t('newsletterAdmin.editor.blocks.productGrid', 'Product Grid (2-3 items)'),
    coupon: t('newsletterAdmin.editor.blocks.coupon', 'Coupon Block'),
    hero: t('newsletterAdmin.editor.blocks.hero', 'Hero Banner'),
    personalization: t('newsletterAdmin.editor.blocks.personalization', 'Personalization'),
    socialMedia: t('newsletterAdmin.editor.blocks.socialMedia', 'Social Media Links'),
    columns: t('newsletterAdmin.editor.blocks.columns', 'Columns'),
  };

  const renderTypeSettings = () => {
    switch (block.type) {
      case 'text':
        return (
          <>
            <TextInput
              label={t('newsletterAdmin.editor.settings.htmlContent', 'HTML Content')}
              value={s.html}
              onChange={(v) => update('html', v)}
              placeholder="<p>Your text here...</p>"
              multiline
            />
            <SelectInput
              label={t('newsletterAdmin.editor.settings.fontSize', 'Font Size')}
              value={s.fontSize || '16px'}
              options={[
                { value: '12px', label: '12px' },
                { value: '14px', label: '14px' },
                { value: '16px', label: '16px (default)' },
                { value: '18px', label: '18px' },
                { value: '20px', label: '20px' },
                { value: '24px', label: '24px' },
                { value: '32px', label: '32px' },
              ]}
              onChange={(v) => update('fontSize', v)}
            />
            <ColorInput
              label={t('newsletterAdmin.editor.settings.textColor', 'Text Color')}
              value={s.color || '#1E293B'}
              onChange={(v) => update('color', v)}
            />
            <AlignmentInput
              label={t('newsletterAdmin.editor.settings.alignment', 'Alignment')}
              value={s.textAlign || 'left'}
              onChange={(v) => update('textAlign', v)}
            />
            <SliderInput
              label={t('newsletterAdmin.editor.settings.lineHeight', 'Line Height')}
              value={s.lineHeight || 150}
              min={100}
              max={250}
              unit="%"
              onChange={(v) => update('lineHeight', v)}
            />
          </>
        );

      case 'image':
        return (
          <>
            <TextInput
              label={t('newsletterAdmin.editor.settings.imageUrl', 'Image URL')}
              value={s.src}
              onChange={(v) => update('src', v)}
              placeholder="https://..."
            />
            <TextInput
              label={t('newsletterAdmin.editor.settings.altText', 'Alt Text')}
              value={s.alt}
              onChange={(v) => update('alt', v)}
              placeholder="Image description"
            />
            <TextInput
              label={t('newsletterAdmin.editor.settings.linkUrl', 'Link URL (optional)')}
              value={s.linkUrl}
              onChange={(v) => update('linkUrl', v)}
              placeholder="https://..."
            />
            <SliderInput
              label={t('newsletterAdmin.editor.settings.width', 'Width')}
              value={s.width || 100}
              min={20}
              max={100}
              unit="%"
              onChange={(v) => update('width', v)}
            />
            <AlignmentInput
              label={t('newsletterAdmin.editor.settings.alignment', 'Alignment')}
              value={s.alignment || 'center'}
              onChange={(v) => update('alignment', v)}
            />
            <SliderInput
              label={t('newsletterAdmin.editor.settings.borderRadius', 'Border Radius')}
              value={s.borderRadius || 0}
              min={0}
              max={20}
              onChange={(v) => update('borderRadius', v)}
            />
          </>
        );

      case 'button':
        return (
          <>
            <TextInput
              label={t('newsletterAdmin.editor.settings.buttonText', 'Button Text')}
              value={s.text}
              onChange={(v) => update('text', v)}
              placeholder="Click here"
            />
            <TextInput
              label={t('newsletterAdmin.editor.settings.url', 'URL')}
              value={s.url}
              onChange={(v) => update('url', v)}
              placeholder="https://..."
            />
            <SelectInput
              label={t('newsletterAdmin.editor.settings.style', 'Style')}
              value={s.style || 'filled'}
              options={[
                { value: 'filled', label: 'Filled' },
                { value: 'outlined', label: 'Outlined' },
                { value: 'pill', label: 'Pill' },
              ]}
              onChange={(v) => update('style', v)}
            />
            <ColorInput
              label={t('newsletterAdmin.editor.settings.bgColor', 'Background Color')}
              value={s.backgroundColor || '#4F46E5'}
              onChange={(v) => update('backgroundColor', v)}
            />
            <ColorInput
              label={t('newsletterAdmin.editor.settings.textColor', 'Text Color')}
              value={s.textColor || '#FFFFFF'}
              onChange={(v) => update('textColor', v)}
            />
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">
                {t('newsletterAdmin.editor.settings.size', 'Size')}
              </label>
              <div className="flex gap-1">
                {['small', 'medium', 'large'].map((size) => (
                  <button
                    key={size}
                    onClick={() => update('size', size)}
                    className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      (s.size || 'medium') === size
                        ? 'bg-primary-600 text-white'
                        : 'bg-surface-900 text-neutral-400 hover:text-white border border-surface-600'
                    }`}
                  >
                    {size.charAt(0).toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <AlignmentInput
              label={t('newsletterAdmin.editor.settings.alignment', 'Alignment')}
              value={s.alignment || 'center'}
              onChange={(v) => update('alignment', v)}
            />
            <SliderInput
              label={t('newsletterAdmin.editor.settings.borderRadius', 'Corner Radius')}
              value={s.borderRadius || 8}
              min={0}
              max={30}
              onChange={(v) => update('borderRadius', v)}
            />
            <label className="flex items-center gap-2 text-sm text-neutral-300 cursor-pointer">
              <input
                type="checkbox"
                checked={s.fullWidth || false}
                onChange={(e) => update('fullWidth', e.target.checked)}
                className="rounded border-surface-600 bg-surface-900 text-primary-600 focus:ring-primary-500"
              />
              {t('newsletterAdmin.editor.settings.fullWidth', 'Full width')}
            </label>
          </>
        );

      case 'divider':
        return (
          <>
            <SelectInput
              label={t('newsletterAdmin.editor.settings.style', 'Style')}
              value={s.style || 'solid'}
              options={[
                { value: 'solid', label: 'Solid' },
                { value: 'dashed', label: 'Dashed' },
                { value: 'dotted', label: 'Dotted' },
              ]}
              onChange={(v) => update('style', v)}
            />
            <ColorInput
              label={t('newsletterAdmin.editor.settings.color', 'Color')}
              value={s.color || '#E2E8F0'}
              onChange={(v) => update('color', v)}
            />
            <SelectInput
              label={t('newsletterAdmin.editor.settings.width', 'Width')}
              value={String(s.width || 100)}
              options={[
                { value: '50', label: '50%' },
                { value: '75', label: '75%' },
                { value: '100', label: '100%' },
              ]}
              onChange={(v) => update('width', parseInt(v))}
            />
            <SelectInput
              label={t('newsletterAdmin.editor.settings.thickness', 'Thickness')}
              value={String(s.thickness || 1)}
              options={[
                { value: '1', label: 'Thin (1px)' },
                { value: '2', label: 'Medium (2px)' },
                { value: '3', label: 'Thick (3px)' },
              ]}
              onChange={(v) => update('thickness', parseInt(v))}
            />
          </>
        );

      case 'spacer':
        return (
          <SliderInput
            label={t('newsletterAdmin.editor.settings.height', 'Height')}
            value={s.height || 24}
            min={8}
            max={80}
            onChange={(v) => update('height', v)}
          />
        );

      case 'productCard':
        return <ProductCardSettings s={s} update={update} onUpdate={onUpdate} t={t} />;

      case 'productGrid':
        return <ProductGridSettings s={s} update={update} onUpdate={onUpdate} t={t} />;

      case 'coupon':
        return (
          <>
            <TextInput
              label={t('newsletterAdmin.editor.settings.couponCode', 'Coupon Code')}
              value={s.code}
              onChange={(v) => update('code', v)}
              placeholder="WELCOME"
            />
            <TextInput
              label={t('newsletterAdmin.editor.settings.description', 'Description')}
              value={s.description}
              onChange={(v) => update('description', v)}
              placeholder="Get 30 SEK off your first order!"
            />
            <TextInput
              label={t('newsletterAdmin.editor.settings.validUntil', 'Valid Until')}
              value={s.validUntil}
              onChange={(v) => update('validUntil', v)}
              placeholder="March 15, 2026"
            />
            <ColorInput
              label={t('newsletterAdmin.editor.settings.bgColor', 'Background Color')}
              value={s.backgroundColor || '#FEF3C7'}
              onChange={(v) => update('backgroundColor', v)}
            />
            <ColorInput
              label={t('newsletterAdmin.editor.settings.borderColor', 'Border Color')}
              value={s.borderColor || '#F59E0B'}
              onChange={(v) => update('borderColor', v)}
            />
          </>
        );

      case 'hero':
        return (
          <>
            <SelectInput
              label={t('newsletterAdmin.editor.settings.backgroundType', 'Background Type')}
              value={s.backgroundType || 'solid'}
              options={[
                { value: 'solid', label: 'Solid Color' },
                { value: 'gradient', label: 'Gradient' },
                { value: 'image', label: 'Image' },
              ]}
              onChange={(v) => update('backgroundType', v)}
            />
            <ColorInput
              label={t('newsletterAdmin.editor.settings.bgColor', 'Background Color')}
              value={s.backgroundColor || '#4F46E5'}
              onChange={(v) => update('backgroundColor', v)}
            />
            {s.backgroundType === 'gradient' && (
              <ColorInput
                label={t('newsletterAdmin.editor.settings.gradientEnd', 'Gradient End')}
                value={s.gradientEnd || '#7C3AED'}
                onChange={(v) => update('gradientEnd', v)}
              />
            )}
            {s.backgroundType === 'image' && (
              <>
                <TextInput
                  label={t('newsletterAdmin.editor.settings.bgImage', 'Background Image URL')}
                  value={s.backgroundImage}
                  onChange={(v) => update('backgroundImage', v)}
                  placeholder="https://..."
                />
                <SliderInput
                  label={t('newsletterAdmin.editor.settings.overlayOpacity', 'Overlay Opacity')}
                  value={s.overlayOpacity || 40}
                  min={0}
                  max={100}
                  unit="%"
                  onChange={(v) => update('overlayOpacity', v)}
                />
              </>
            )}
            <TextInput
              label={t('newsletterAdmin.editor.settings.heading', 'Heading')}
              value={s.heading}
              onChange={(v) => update('heading', v)}
              placeholder="Main heading"
            />
            <TextInput
              label={t('newsletterAdmin.editor.settings.subheading', 'Subheading')}
              value={s.subheading}
              onChange={(v) => update('subheading', v)}
              placeholder="Supporting text"
            />
            <TextInput
              label={t('newsletterAdmin.editor.settings.buttonText', 'Button Text')}
              value={s.buttonText}
              onChange={(v) => update('buttonText', v)}
              placeholder="Shop Now"
            />
            <TextInput
              label={t('newsletterAdmin.editor.settings.buttonUrl', 'Button URL')}
              value={s.buttonUrl}
              onChange={(v) => update('buttonUrl', v)}
            />
            <ColorInput
              label={t('newsletterAdmin.editor.settings.textColor', 'Text Color')}
              value={s.textColor || '#FFFFFF'}
              onChange={(v) => update('textColor', v)}
            />
            <AlignmentInput
              label={t('newsletterAdmin.editor.settings.alignment', 'Text Alignment')}
              value={s.textAlign || 'center'}
              onChange={(v) => update('textAlign', v)}
            />
          </>
        );

      case 'personalization':
        return (
          <>
            <TextInput
              label={t('newsletterAdmin.editor.settings.content', 'Content')}
              value={s.content}
              onChange={(v) => update('content', v)}
              placeholder="Hi {first_name}!"
            />
            <TextInput
              label={t('newsletterAdmin.editor.settings.fallback', 'Fallback Text')}
              value={s.fallback}
              onChange={(v) => update('fallback', v)}
              placeholder="Hi there!"
            />
            <p className="text-xs text-neutral-500">
              {t('newsletterAdmin.editor.settings.variablesHelp', 'Available: {first_name}, {email}, {company_name}')}
            </p>
          </>
        );

      case 'socialMedia':
        return (
          <p className="text-sm text-neutral-400">
            {t(
              'newsletterAdmin.editor.settings.socialMediaHelp',
              'This block uses the social media links configured in Global Styles. Drag it to where you want the icons to appear.'
            )}
          </p>
        );

      case 'columns':
        return (
          <SelectInput
            label={t('newsletterAdmin.editor.settings.columnLayout', 'Column Layout')}
            value={s.layout || '1/2-1/2'}
            options={[
              { value: '1/2-1/2', label: '50% / 50%' },
              { value: '1/3-2/3', label: '33% / 67%' },
              { value: '2/3-1/3', label: '67% / 33%' },
            ]}
            onChange={(v) => update('layout', v)}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('newsletterAdmin.editor.backToBlocks', 'Back to Blocks')}
      </button>

      <h3 className="text-sm font-semibold text-white">
        {blockTypeLabels[block.type] || block.type} {t('newsletterAdmin.editor.settingsHeading', 'Settings')}
      </h3>

      <div className="space-y-4">
        {renderTypeSettings()}
      </div>

      {/* Common Settings */}
      <div className="border-t border-surface-700 pt-4 space-y-4">
        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
          {t('newsletterAdmin.editor.settings.blockSpacing', 'Block Spacing')}
        </p>
        <SliderInput
          label={t('newsletterAdmin.editor.settings.paddingTop', 'Padding top')}
          value={s.paddingTop || 16}
          min={0}
          max={60}
          onChange={(v) => update('paddingTop', v)}
        />
        <SliderInput
          label={t('newsletterAdmin.editor.settings.paddingBottom', 'Padding bottom')}
          value={s.paddingBottom || 16}
          min={0}
          max={60}
          onChange={(v) => update('paddingBottom', v)}
        />
        <ColorInput
          label={t('newsletterAdmin.editor.settings.blockBgColor', 'Block Background')}
          value={s.blockBackgroundColor || ''}
          onChange={(v) => update('blockBackgroundColor', v)}
        />
      </div>

      {/* Actions */}
      <div className="border-t border-surface-700 pt-4 space-y-2">
        <button
          onClick={onDuplicate}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-neutral-300 bg-surface-700 hover:bg-surface-600 rounded-lg transition-colors"
        >
          <Copy className="w-4 h-4" />
          {t('newsletterAdmin.editor.duplicateBlock', 'Duplicate Block')}
        </button>
        <button
          onClick={onDelete}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-red-400 bg-red-600/10 hover:bg-red-600/20 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          {t('newsletterAdmin.editor.deleteBlock', 'Delete Block')}
        </button>
      </div>
    </div>
  );
};

export default BlockSettings;
