import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Undo2, Redo2, Monitor, Smartphone, Save } from 'lucide-react';
import { newsletterAdminApi } from '../../models/api/newsletterAdminApi';
import {
  TemplateListItem,
  ContentBlock,
  BlockType,
  GlobalStylesConfig,
  SocialMediaConfig,
  FooterConfig,
} from '../../models/types/newsletterAdmin.types';
import BlockPalette from './newsletter-editor/BlockPalette';
import BlockSettings from './newsletter-editor/BlockSettings';
import GlobalStylesPanel from './newsletter-editor/GlobalStylesPanel';
import EmailPreview from './newsletter-editor/EmailPreview';

type LeftPanelMode = 'blocks' | 'settings' | 'globalStyles';

const DEFAULT_BLOCK_SETTINGS: Record<string, Record<string, any>> = {
  text: { html: '<p>Your text here...</p>', fontSize: '16px', textAlign: 'left', lineHeight: 150, paddingTop: 16, paddingBottom: 16 },
  image: { src: '', alt: '', width: 100, alignment: 'center', borderRadius: 0, paddingTop: 16, paddingBottom: 16 },
  button: { text: 'Click here', url: '', style: 'filled', backgroundColor: '#4F46E5', textColor: '#FFFFFF', size: 'medium', alignment: 'center', borderRadius: 8, fullWidth: false, paddingTop: 16, paddingBottom: 24 },
  divider: { style: 'solid', color: '#E2E8F0', width: 100, thickness: 1, paddingTop: 16, paddingBottom: 16 },
  spacer: { height: 24 },
  productCard: { source: 'manual', productId: null, productType: null, title: '', description: '', price: '', imageUrl: '', buttonText: 'View Details', buttonUrl: '', layout: 'horizontal', showPrice: true, pricePrefix: '', cardBackground: '#FFFFFF', showBorder: true, borderRadius: 8, padding: 16, imagePosition: 'left', paddingTop: 16, paddingBottom: 16 },
  productGrid: { columns: 2, products: [], cardBackground: '#FFFFFF', showBorders: true, equalHeight: true, gap: 16, paddingTop: 16, paddingBottom: 16 },
  coupon: { code: 'CODE', description: 'Get a discount!', validUntil: '', backgroundColor: '#FEF3C7', borderColor: '#F59E0B', paddingTop: 16, paddingBottom: 16 },
  hero: { backgroundType: 'gradient', backgroundColor: '#4F46E5', gradientEnd: '#7C3AED', heading: 'Hero Heading', subheading: '', buttonText: 'Shop Now', buttonUrl: '', textColor: '#FFFFFF', textAlign: 'center', paddingTop: 48, paddingBottom: 48 },
  personalization: { content: 'Hi {first_name}!', fallback: 'Hi there!', paddingTop: 16, paddingBottom: 16 },
  socialMedia: { paddingTop: 16, paddingBottom: 16 },
  columns: { layout: '1/2-1/2', paddingTop: 16, paddingBottom: 16 },
};

interface HistoryEntry {
  blocks: ContentBlock[];
  globalStyles: GlobalStylesConfig;
  socialMediaConfig: SocialMediaConfig;
  footerConfig: FooterConfig;
}

const NewsletterTemplateEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [template, setTemplate] = useState<TemplateListItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Editor state
  const [templateName, setTemplateName] = useState('');
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [globalStyles, setGlobalStyles] = useState<GlobalStylesConfig>({});
  const [socialMediaConfig, setSocialMediaConfig] = useState<SocialMediaConfig>({ platforms: [] });
  const [footerConfig, setFooterConfig] = useState<FooterConfig>({});

  // UI state
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [leftPanelMode, setLeftPanelMode] = useState<LeftPanelMode>('blocks');
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'mobile'>('desktop');

  // Undo/Redo
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const isUndoRedoRef = useRef(false);

  const pushHistory = useCallback((entry: HistoryEntry) => {
    if (isUndoRedoRef.current) return;
    setHistory((prev) => {
      const truncated = prev.slice(0, historyIndex + 1);
      const newHistory = [...truncated, entry].slice(-50);
      setHistoryIndex(newHistory.length - 1);
      return newHistory;
    });
  }, [historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex <= 0) return;
    const newIndex = historyIndex - 1;
    const entry = history[newIndex];
    isUndoRedoRef.current = true;
    setBlocks(entry.blocks);
    setGlobalStyles(entry.globalStyles);
    setSocialMediaConfig(entry.socialMediaConfig);
    setFooterConfig(entry.footerConfig);
    setHistoryIndex(newIndex);
    setHasUnsavedChanges(true);
    requestAnimationFrame(() => { isUndoRedoRef.current = false; });
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1) return;
    const newIndex = historyIndex + 1;
    const entry = history[newIndex];
    isUndoRedoRef.current = true;
    setBlocks(entry.blocks);
    setGlobalStyles(entry.globalStyles);
    setSocialMediaConfig(entry.socialMediaConfig);
    setFooterConfig(entry.footerConfig);
    setHistoryIndex(newIndex);
    setHasUnsavedChanges(true);
    requestAnimationFrame(() => { isUndoRedoRef.current = false; });
  }, [history, historyIndex]);

  // Load template
  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const response = await newsletterAdminApi.getTemplateById(id);
        if (response.success && response.data) {
          const tmpl = response.data;
          setTemplate(tmpl);
          setTemplateName(tmpl.name);
          setBlocks(tmpl.contentBlocks || []);
          setGlobalStyles(tmpl.globalStyles || {});
          setSocialMediaConfig(tmpl.socialMediaConfig || { platforms: [] });
          setFooterConfig(tmpl.footerConfig || {});

          const initialEntry: HistoryEntry = {
            blocks: tmpl.contentBlocks || [],
            globalStyles: tmpl.globalStyles || {},
            socialMediaConfig: tmpl.socialMediaConfig || { platforms: [] },
            footerConfig: tmpl.footerConfig || {},
          };
          setHistory([initialEntry]);
          setHistoryIndex(0);
        }
      } catch {
        // silently handle
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // Track changes for undo
  useEffect(() => {
    if (!loading && template) {
      pushHistory({ blocks, globalStyles, socialMediaConfig, footerConfig });
    }
  }, [blocks, globalStyles, socialMediaConfig, footerConfig]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    try {
      const response = await newsletterAdminApi.updateTemplate(id, {
        name: templateName,
        contentBlocks: blocks,
        globalStyles,
        socialMediaConfig,
        footerConfig,
      });
      if (response.success) {
        setHasUnsavedChanges(false);
      }
    } catch {
      // silently handle
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (hasUnsavedChanges) {
      if (window.confirm(t('newsletterAdmin.editor.unsavedChanges', 'You have unsaved changes. Leave anyway?'))) {
        navigate('/admin/newsletters/templates');
      }
    } else {
      navigate('/admin/newsletters/templates');
    }
  };

  const addBlock = (type: BlockType) => {
    const newBlock: ContentBlock = {
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      order: blocks.length,
      settings: { ...DEFAULT_BLOCK_SETTINGS[type] },
    };
    setBlocks([...blocks, newBlock]);
    setSelectedBlockId(newBlock.id);
    setLeftPanelMode('settings');
    setHasUnsavedChanges(true);
  };

  const updateBlockSettings = (blockId: string, settings: Record<string, any>) => {
    setBlocks(blocks.map((b) => (b.id === blockId ? { ...b, settings } : b)));
    setHasUnsavedChanges(true);
  };

  const deleteBlock = (blockId: string) => {
    setBlocks(blocks.filter((b) => b.id !== blockId));
    if (selectedBlockId === blockId) {
      setSelectedBlockId(null);
      setLeftPanelMode('blocks');
    }
    setHasUnsavedChanges(true);
  };

  const duplicateBlock = (blockId: string) => {
    const block = blocks.find((b) => b.id === blockId);
    if (!block) return;
    const index = blocks.indexOf(block);
    const newBlock: ContentBlock = {
      ...block,
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      order: block.order + 0.5,
      settings: { ...block.settings },
    };
    const newBlocks = [...blocks];
    newBlocks.splice(index + 1, 0, newBlock);
    setBlocks(newBlocks.map((b, i) => ({ ...b, order: i })));
    setSelectedBlockId(newBlock.id);
    setHasUnsavedChanges(true);
  };

  const moveBlock = (blockId: string, direction: 'up' | 'down') => {
    const index = blocks.findIndex((b) => b.id === blockId);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === blocks.length - 1) return;

    const newBlocks = [...blocks];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    [newBlocks[index], newBlocks[swapIndex]] = [newBlocks[swapIndex], newBlocks[index]];
    setBlocks(newBlocks.map((b, i) => ({ ...b, order: i })));
    setHasUnsavedChanges(true);
  };

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId);

  // When block is selected, switch to settings mode
  useEffect(() => {
    if (selectedBlockId && selectedBlock) {
      setLeftPanelMode('settings');
    }
  }, [selectedBlockId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
      </div>
    );
  }

  if (!template) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-neutral-400">
        <p>{t('newsletterAdmin.editor.notFound', 'Template not found')}</p>
        <button
          onClick={() => navigate('/admin/newsletters/templates')}
          className="mt-4 text-primary-400 hover:text-primary-300"
        >
          {t('newsletterAdmin.editor.backToTemplates', 'Back to Templates')}
        </button>
      </div>
    );
  }

  // Mobile warning
  return (
    <div className="fixed inset-0 bg-surface-950 flex flex-col z-50">
      {/* Mobile warning */}
      <div className="lg:hidden flex items-center justify-center min-h-screen p-6 text-center">
        <div>
          <Monitor className="w-12 h-12 text-neutral-500 mx-auto mb-4" />
          <p className="text-neutral-300 text-lg font-medium mb-2">
            {t('newsletterAdmin.editor.desktopOnly', 'Desktop Required')}
          </p>
          <p className="text-neutral-500 text-sm mb-6">
            {t('newsletterAdmin.editor.desktopOnlyDesc', 'Please use a desktop browser to edit newsletters.')}
          </p>
          <button
            onClick={() => navigate('/admin/newsletters/templates')}
            className="text-primary-400 hover:text-primary-300 text-sm"
          >
            {t('newsletterAdmin.editor.backToTemplates', 'Back to Templates')}
          </button>
        </div>
      </div>

      {/* Desktop Editor */}
      <div className="hidden lg:flex flex-col h-full">
        {/* Top Toolbar */}
        <div className="bg-surface-900 border-b border-surface-700 px-4 py-3 space-y-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBack}
                className="flex items-center gap-1.5 text-sm text-neutral-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                {t('newsletterAdmin.editor.back', 'Back')}
              </button>
              <input
                type="text"
                value={templateName}
                onChange={(e) => { setTemplateName(e.target.value); setHasUnsavedChanges(true); }}
                className="bg-transparent border-none text-white font-semibold text-lg focus:outline-none focus:ring-0 min-w-0"
                style={{ width: `${Math.max(templateName.length * 10, 100)}px` }}
              />
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors text-sm font-medium"
            >
              <Save className="w-4 h-4" />
              {saving
                ? t('newsletterAdmin.editor.saving', 'Saving...')
                : t('newsletterAdmin.editor.saveDraft', 'Save Draft')}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={undo}
                disabled={historyIndex <= 0}
                className="p-1.5 text-neutral-400 hover:text-white disabled:opacity-30 transition-colors rounded-lg hover:bg-surface-700"
                title="Undo (Ctrl+Z)"
              >
                <Undo2 className="w-4 h-4" />
              </button>
              <button
                onClick={redo}
                disabled={historyIndex >= history.length - 1}
                className="p-1.5 text-neutral-400 hover:text-white disabled:opacity-30 transition-colors rounded-lg hover:bg-surface-700"
                title="Redo (Ctrl+Shift+Z)"
              >
                <Redo2 className="w-4 h-4" />
              </button>

              <div className="ml-4 flex items-center bg-surface-800 rounded-lg border border-surface-600 overflow-hidden">
                <button
                  onClick={() => setDeviceMode('desktop')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
                    deviceMode === 'desktop'
                      ? 'bg-primary-600 text-white'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  Desktop
                </button>
                <button
                  onClick={() => setDeviceMode('mobile')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
                    deviceMode === 'mobile'
                      ? 'bg-primary-600 text-white'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  Mobile
                </button>
              </div>
            </div>

            {hasUnsavedChanges && (
              <span className="text-xs text-yellow-400">
                {t('newsletterAdmin.editor.unsaved', 'Unsaved changes')}
              </span>
            )}
          </div>
        </div>

        {/* Two-panel layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel */}
          <div className="w-80 bg-surface-850 border-r border-surface-700 flex flex-col flex-shrink-0">
            {/* Panel tabs */}
            <div className="flex border-b border-surface-700">
              <button
                onClick={() => {
                  setLeftPanelMode('blocks');
                  setSelectedBlockId(null);
                }}
                className={`flex-1 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                  leftPanelMode === 'blocks' || leftPanelMode === 'settings'
                    ? 'text-primary-400 border-b-2 border-primary-500'
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                {t('newsletterAdmin.editor.blocksTab', 'Blocks')}
              </button>
              <button
                onClick={() => setLeftPanelMode('globalStyles')}
                className={`flex-1 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                  leftPanelMode === 'globalStyles'
                    ? 'text-primary-400 border-b-2 border-primary-500'
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                {t('newsletterAdmin.editor.globalStylesTab', 'Global Styles')}
              </button>
            </div>

            {/* Panel content */}
            <div className="flex-1 overflow-y-auto p-4">
              {leftPanelMode === 'blocks' && (
                <BlockPalette onAddBlock={addBlock} />
              )}

              {leftPanelMode === 'settings' && selectedBlock && (
                <BlockSettings
                  block={selectedBlock}
                  onUpdate={(settings) => updateBlockSettings(selectedBlock.id, settings)}
                  onDuplicate={() => duplicateBlock(selectedBlock.id)}
                  onDelete={() => deleteBlock(selectedBlock.id)}
                  onBack={() => {
                    setLeftPanelMode('blocks');
                    setSelectedBlockId(null);
                  }}
                />
              )}

              {leftPanelMode === 'globalStyles' && (
                <GlobalStylesPanel
                  globalStyles={globalStyles}
                  socialMediaConfig={socialMediaConfig}
                  footerConfig={footerConfig}
                  onUpdateGlobalStyles={(s) => { setGlobalStyles(s); setHasUnsavedChanges(true); }}
                  onUpdateSocialMedia={(c) => { setSocialMediaConfig(c); setHasUnsavedChanges(true); }}
                  onUpdateFooter={(f) => { setFooterConfig(f); setHasUnsavedChanges(true); }}
                />
              )}
            </div>
          </div>

          {/* Right Panel - Preview */}
          <EmailPreview
            blocks={blocks}
            globalStyles={globalStyles}
            socialMediaConfig={socialMediaConfig}
            footerConfig={footerConfig}
            selectedBlockId={selectedBlockId}
            deviceMode={deviceMode}
            onSelectBlock={setSelectedBlockId}
            onDeleteBlock={deleteBlock}
            onMoveBlock={moveBlock}
          />
        </div>
      </div>
    </div>
  );
};

export default NewsletterTemplateEditor;
