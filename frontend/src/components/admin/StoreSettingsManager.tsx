import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '../common/Toast';
import { useConfirm } from '../common/ConfirmDialog';
import { storeSettingsApi } from '../../models/api/storeSettingsApi';
import { pcComponentApi } from '../../models/api/pcComponentApi';
import {
  Currency,
  ExchangeRateStatus,
  ProfitMarginRule,
  PricePreview,
} from '../../models/types/storeSettings.types';
import { PCComponent, ComponentType } from '../../models/types/pcComponent.types';
import LoadingSpinner from '../common/LoadingSpinner';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaSync, FaStar, FaEye, FaCalculator, FaExchangeAlt } from 'react-icons/fa';

type TabId = 'currencies' | 'exchange-rates' | 'profit-rules' | 'converter';

const COMPONENT_TYPES: ComponentType[] = [
  'cpu', 'motherboard', 'ram', 'gpu', 'ssd', 'hdd', 'psu', 'case', 'cooling', 'optical', 'fan', 'os',
];

const COMPONENT_TYPE_LABELS: Record<ComponentType, string> = {
  cpu: 'CPU', motherboard: 'Motherboard', ram: 'RAM', gpu: 'GPU',
  ssd: 'SSD', hdd: 'HDD', psu: 'PSU', case: 'Case',
  cooling: 'Cooling', optical: 'Optical', fan: 'Fan', os: 'OS',
};

const StoreSettingsManager: React.FC = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const confirm = useConfirm();
  const [activeTab, setActiveTab] = useState<TabId>('currencies');

  // ─── CURRENCIES STATE ─────────────────────────────────────────
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [currenciesLoading, setCurrenciesLoading] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState<Currency | null>(null);
  const [currencyForm, setCurrencyForm] = useState({ code: '', name: '', symbol: '', decimalPlaces: 2 });

  // ─── EXCHANGE RATES STATE ─────────────────────────────────────
  const [rateStatus, setRateStatus] = useState<ExchangeRateStatus | null>(null);
  const [ratesLoading, setRatesLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // ─── PROFIT RULES STATE ───────────────────────────────────────
  const [rules, setRules] = useState<ProfitMarginRule[]>([]);
  const [rulesLoading, setRulesLoading] = useState(false);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [editingRule, setEditingRule] = useState<ProfitMarginRule | null>(null);
  const [ruleForm, setRuleForm] = useState({
    name: '',
    type: 'global' as 'global' | 'category' | 'product',
    pcComponentId: '',
    componentType: '',
    marginType: 'percentage' as 'percentage' | 'flat',
    marginValue: 0,
    isActive: true,
  });

  // ─── PRICE PREVIEW STATE ──────────────────────────────────────
  const [previewComponentId, setPreviewComponentId] = useState('');
  const [pricePreview, setPricePreview] = useState<PricePreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // ─── COMPONENT SEARCH (for product-level rules) ───────────────
  const [componentSearch, setComponentSearch] = useState('');
  const [searchResults, setSearchResults] = useState<PCComponent[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [allComponents, setAllComponents] = useState<PCComponent[]>([]);
  const [recalculating, setRecalculating] = useState(false);

  // ─── CONVERTER STATE ────────────────────────────────────────
  const [converterAmount, setConverterAmount] = useState<string>('1');
  const [converterFrom, setConverterFrom] = useState('');
  const [converterTo, setConverterTo] = useState('');
  const [converterResult, setConverterResult] = useState<number | null>(null);

  // ─── LOADERS ──────────────────────────────────────────────────

  const loadCurrencies = useCallback(async () => {
    setCurrenciesLoading(true);
    try {
      const res = await storeSettingsApi.getCurrencies();
      if (res.success && res.data) setCurrencies(res.data);
    } catch { /* handled */ }
    finally { setCurrenciesLoading(false); }
  }, []);

  const loadRates = useCallback(async () => {
    setRatesLoading(true);
    try {
      const res = await storeSettingsApi.getExchangeRates();
      if (res.success && res.data) setRateStatus(res.data);
    } catch { /* handled */ }
    finally { setRatesLoading(false); }
  }, []);

  const loadRules = useCallback(async () => {
    setRulesLoading(true);
    try {
      const res = await storeSettingsApi.getProfitRules();
      if (res.success && res.data) setRules(res.data);
    } catch { /* handled */ }
    finally { setRulesLoading(false); }
  }, []);

  const loadAllComponents = useCallback(async () => {
    try {
      const res = await pcComponentApi.getAllAdmin(1, 500);
      if (res.success && res.data) setAllComponents(res.data.components);
    } catch { /* handled */ }
  }, []);

  useEffect(() => {
    if (activeTab === 'currencies') loadCurrencies();
    if (activeTab === 'exchange-rates') loadRates();
    if (activeTab === 'profit-rules') { loadRules(); loadAllComponents(); }
    if (activeTab === 'converter') { loadCurrencies(); loadRates(); }
  }, [activeTab, loadCurrencies, loadRates, loadRules, loadAllComponents]);

  // ─── CURRENCY HANDLERS ────────────────────────────────────────

  const handleCreateCurrency = () => {
    setEditingCurrency(null);
    setCurrencyForm({ code: '', name: '', symbol: '', decimalPlaces: 2 });
    setShowCurrencyModal(true);
  };

  const handleEditCurrency = (c: Currency) => {
    setEditingCurrency(c);
    setCurrencyForm({ code: c.code, name: c.name, symbol: c.symbol, decimalPlaces: c.decimalPlaces });
    setShowCurrencyModal(true);
  };

  const handleSaveCurrency = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCurrency) {
        await storeSettingsApi.updateCurrency(editingCurrency.id, currencyForm);
        toast.success(t('storeSettings.currencies.updated'));
      } else {
        await storeSettingsApi.createCurrency(currencyForm);
        toast.success(t('storeSettings.currencies.created'));
      }
      setShowCurrencyModal(false);
      loadCurrencies();
    } catch {
      toast.error(t('storeSettings.currencies.saveFailed'));
    }
  };

  const handleDeleteCurrency = async (id: string) => {
    const confirmed = await confirm({
      title: t('storeSettings.currencies.deleteTitle'),
      message: t('storeSettings.currencies.deleteConfirm'),
      confirmText: t('storeSettings.currencies.deleteBtn'),
      cancelText: t('storeSettings.common.cancel'),
      type: 'danger',
    });
    if (!confirmed) return;
    try {
      await storeSettingsApi.deleteCurrency(id);
      toast.success(t('storeSettings.currencies.deleted'));
      loadCurrencies();
    } catch {
      toast.error(t('storeSettings.currencies.deleteFailed'));
    }
  };

  const handleSetBase = async (id: string) => {
    try {
      await storeSettingsApi.setBaseCurrency(id);
      toast.success(t('storeSettings.currencies.baseSet'));
      loadCurrencies();
    } catch {
      toast.error(t('storeSettings.currencies.baseFailed'));
    }
  };

  const handleSetDisplay = async (id: string) => {
    try {
      await storeSettingsApi.setDisplayCurrency(id);
      toast.success(t('storeSettings.currencies.displaySet'));
      loadCurrencies();
    } catch {
      toast.error(t('storeSettings.currencies.displayFailed'));
    }
  };

  // ─── EXCHANGE RATE HANDLERS ───────────────────────────────────

  const handleRefreshRates = async () => {
    setRefreshing(true);
    try {
      const res = await storeSettingsApi.refreshExchangeRates();
      if (res.success) {
        toast.success(res.message || t('storeSettings.exchangeRates.refreshed'));
        loadRates();
      }
    } catch {
      toast.error(t('storeSettings.exchangeRates.refreshFailed'));
    } finally {
      setRefreshing(false);
    }
  };

  // ─── PROFIT RULE HANDLERS ────────────────────────────────────

  const handleCreateRule = () => {
    setEditingRule(null);
    setRuleForm({
      name: '',
      type: 'global',
      pcComponentId: '',
      componentType: '',
      marginType: 'percentage',
      marginValue: 0,
      isActive: true,
    });
    setComponentSearch('');
    setSearchResults([]);
    setShowRuleModal(true);
  };

  const handleEditRule = (r: ProfitMarginRule) => {
    setEditingRule(r);
    setRuleForm({
      name: r.name,
      type: r.type,
      pcComponentId: r.pcComponentId || '',
      componentType: r.componentType || '',
      marginType: r.marginType,
      marginValue: Number(r.marginValue),
      isActive: r.isActive,
    });
    setShowRuleModal(true);
  };

  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = { ...ruleForm };
    if (payload.type !== 'product') payload.pcComponentId = null;
    if (payload.type !== 'category') payload.componentType = null;
    try {
      if (editingRule) {
        await storeSettingsApi.updateProfitRule(editingRule.id, payload);
        toast.success(t('storeSettings.profitRules.updated'));
      } else {
        await storeSettingsApi.createProfitRule(payload);
        toast.success(t('storeSettings.profitRules.created'));
      }
      setShowRuleModal(false);
      loadRules();
    } catch {
      toast.error(t('storeSettings.profitRules.saveFailed'));
    }
  };

  const handleDeleteRule = async (id: string) => {
    const confirmed = await confirm({
      title: t('storeSettings.profitRules.deleteTitle'),
      message: t('storeSettings.profitRules.deleteConfirm'),
      confirmText: t('storeSettings.profitRules.deleteBtn'),
      cancelText: t('storeSettings.common.cancel'),
      type: 'danger',
    });
    if (!confirmed) return;
    try {
      await storeSettingsApi.deleteProfitRule(id);
      toast.success(t('storeSettings.profitRules.deleted'));
      loadRules();
    } catch {
      toast.error(t('storeSettings.profitRules.deleteFailed'));
    }
  };

  const handlePreviewPrice = async () => {
    if (!previewComponentId) return;
    setPreviewLoading(true);
    try {
      const res = await storeSettingsApi.previewPrice(previewComponentId);
      if (res.success && res.data) setPricePreview(res.data);
    } catch {
      toast.error(t('storeSettings.profitRules.previewFailed'));
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleRecalculateAll = async () => {
    const confirmed = await confirm({
      title: t('storeSettings.profitRules.recalcTitle'),
      message: t('storeSettings.profitRules.recalcConfirm'),
      confirmText: t('storeSettings.profitRules.recalcBtn'),
      cancelText: t('storeSettings.common.cancel'),
      type: 'warning',
    });
    if (!confirmed) return;
    setRecalculating(true);
    try {
      const res = await storeSettingsApi.recalculateAllPrices();
      if (res.success) {
        toast.success(res.message || t('storeSettings.profitRules.recalcDone'));
      }
    } catch {
      toast.error(t('storeSettings.profitRules.recalcFailed'));
    } finally {
      setRecalculating(false);
    }
  };

  // Component search for product-level rules
  useEffect(() => {
    if (componentSearch.length < 2) { setSearchResults([]); return; }
    setSearchLoading(true);
    const timeout = setTimeout(async () => {
      try {
        const filtered = allComponents.filter(c =>
          c.name_en.toLowerCase().includes(componentSearch.toLowerCase()) ||
          c.manufacturer.toLowerCase().includes(componentSearch.toLowerCase())
        );
        setSearchResults(filtered.slice(0, 20));
      } catch { /* handled */ }
      finally { setSearchLoading(false); }
    }, 300);
    return () => clearTimeout(timeout);
  }, [componentSearch, allComponents]);

  // ─── CONVERTER HANDLER ──────────────────────────────────────

  const handleConvert = () => {
    const amount = parseFloat(converterAmount);
    if (!amount || !converterFrom || !converterTo || !rateStatus?.rates.length) {
      setConverterResult(null);
      return;
    }
    if (converterFrom === converterTo) {
      setConverterResult(amount);
      return;
    }

    const rates = rateStatus.rates;

    // Try direct rate: from -> to
    const direct = rates.find(r => r.baseCurrency === converterFrom && r.targetCurrency === converterTo);
    if (direct) {
      setConverterResult(amount * Number(direct.rate));
      return;
    }

    // Try inverse rate: to -> from
    const inverse = rates.find(r => r.baseCurrency === converterTo && r.targetCurrency === converterFrom);
    if (inverse) {
      setConverterResult(amount / Number(inverse.rate));
      return;
    }

    // Try cross-rate via any common base
    for (const r1 of rates) {
      if (r1.baseCurrency === converterFrom || r1.targetCurrency === converterFrom) {
        const fromToBase = r1.baseCurrency === converterFrom ? r1.targetCurrency : r1.baseCurrency;
        const amountInBase = r1.baseCurrency === converterFrom ? amount * Number(r1.rate) : amount / Number(r1.rate);

        const r2direct = rates.find(r => r.baseCurrency === fromToBase && r.targetCurrency === converterTo);
        if (r2direct) {
          setConverterResult(amountInBase * Number(r2direct.rate));
          return;
        }
        const r2inverse = rates.find(r => r.baseCurrency === converterTo && r.targetCurrency === fromToBase);
        if (r2inverse) {
          setConverterResult(amountInBase / Number(r2inverse.rate));
          return;
        }
      }
    }

    setConverterResult(null);
  };

  const handleSwapCurrencies = () => {
    setConverterFrom(converterTo);
    setConverterTo(converterFrom);
    setConverterResult(null);
  };

  // ─── TABS ─────────────────────────────────────────────────────

  const tabs: { id: TabId; label: string }[] = [
    { id: 'currencies', label: t('storeSettings.tabs.currencies') },
    { id: 'exchange-rates', label: t('storeSettings.tabs.exchangeRates') },
    { id: 'profit-rules', label: t('storeSettings.tabs.profitRules') },
    { id: 'converter', label: t('storeSettings.tabs.converter') },
  ];

  const getStatusColor = () => {
    if (!rateStatus) return 'bg-neutral-600';
    if (!rateStatus.lastFetchedAt) return 'bg-red-500';
    if (rateStatus.isStale) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getSelectedComponentName = () => {
    const comp = allComponents.find(c => c.id === ruleForm.pcComponentId);
    return comp ? `${comp.name_en} (${comp.manufacturer})` : '';
  };

  // ─── RENDER ───────────────────────────────────────────────────

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl sm:text-4xl font-thin text-white">{t('storeSettings.title')}</h2>
        <p className="font-medium text-[10px] sm:text-xs uppercase tracking-[0.2em] text-neutral-500 mt-2">
          {t('storeSettings.subtitle')}
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-surface-850 rounded-lg shadow-dark-md p-1 grid grid-cols-2 sm:grid-cols-4 gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-all ${
              activeTab === tab.id
                ? 'bg-primary-600/10 text-primary-400 border border-primary-500/30'
                : 'text-neutral-400 hover:text-white hover:bg-surface-700 border border-transparent'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── CURRENCIES TAB ──────────────────────────────────────── */}
      {activeTab === 'currencies' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={handleCreateCurrency}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-500 font-bold text-sm active:scale-[0.98] transition"
            >
              <FaPlus size={12} /> {t('storeSettings.currencies.add')}
            </button>
          </div>

          {currenciesLoading ? (
            <div className="flex justify-center py-12"><LoadingSpinner /></div>
          ) : (
            <div className="bg-surface-850 rounded-lg shadow-dark-md overflow-hidden">
              {currencies.length === 0 ? (
                <div className="px-4 py-8 text-center text-neutral-400 text-sm">
                  {t('storeSettings.currencies.empty')}
                </div>
              ) : (
                <>
                  {/* Mobile: Card layout */}
                  <div className="sm:hidden divide-y divide-surface-700">
                    {currencies.map((c) => (
                      <div key={c.id} className="p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">{c.code}</span>
                            <span className="text-sm text-neutral-400">({c.symbol})</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {!c.isBaseCurrency && (
                              <button onClick={() => handleSetBase(c.id)} className="p-1.5 text-blue-400 hover:bg-blue-900/20 rounded-lg transition" title={t('storeSettings.currencies.setBase')}>
                                <FaStar size={12} />
                              </button>
                            )}
                            {!c.isDisplayCurrency && (
                              <button onClick={() => handleSetDisplay(c.id)} className="p-1.5 text-purple-400 hover:bg-purple-900/20 rounded-lg transition" title={t('storeSettings.currencies.setDisplay')}>
                                <FaEye size={12} />
                              </button>
                            )}
                            <button onClick={() => handleEditCurrency(c)} className="p-1.5 text-primary-400 hover:bg-primary-600/20 rounded-lg transition">
                              <FaEdit size={12} />
                            </button>
                            {!c.isBaseCurrency && !c.isDisplayCurrency && (
                              <button onClick={() => handleDeleteCurrency(c.id)} className="p-1.5 text-red-400 hover:bg-red-900/20 rounded-lg transition">
                                <FaTrash size={12} />
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-neutral-400">{c.name}</p>
                        <div className="flex gap-1.5">
                          {c.isBaseCurrency && (
                            <span className="px-2 py-0.5 bg-blue-900/30 text-blue-400 text-[10px] font-bold rounded-full uppercase">
                              {t('storeSettings.currencies.base')}
                            </span>
                          )}
                          {c.isDisplayCurrency && (
                            <span className="px-2 py-0.5 bg-purple-900/30 text-purple-400 text-[10px] font-bold rounded-full uppercase">
                              {t('storeSettings.currencies.display')}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop: Table layout */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-surface-700">
                      <thead className="bg-surface-800">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">{t('storeSettings.currencies.code')}</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">{t('storeSettings.currencies.name')}</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">{t('storeSettings.currencies.symbol')}</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">{t('storeSettings.currencies.role')}</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-neutral-400 uppercase tracking-wider">{t('storeSettings.common.actions')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-surface-700">
                        {currencies.map((c) => (
                          <tr key={c.id} className="hover:bg-surface-800">
                            <td className="px-4 py-3 text-sm font-bold text-white">{c.code}</td>
                            <td className="px-4 py-3 text-sm text-neutral-300">{c.name}</td>
                            <td className="px-4 py-3 text-sm text-neutral-300">{c.symbol}</td>
                            <td className="px-4 py-3">
                              <div className="flex gap-1.5">
                                {c.isBaseCurrency && (
                                  <span className="px-2 py-0.5 bg-blue-900/30 text-blue-400 text-[10px] font-bold rounded-full uppercase">
                                    {t('storeSettings.currencies.base')}
                                  </span>
                                )}
                                {c.isDisplayCurrency && (
                                  <span className="px-2 py-0.5 bg-purple-900/30 text-purple-400 text-[10px] font-bold rounded-full uppercase">
                                    {t('storeSettings.currencies.display')}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {!c.isBaseCurrency && (
                                  <button onClick={() => handleSetBase(c.id)} className="p-1.5 text-blue-400 hover:bg-blue-900/20 rounded-lg transition text-[10px] font-bold" title={t('storeSettings.currencies.setBase')}>
                                    <FaStar size={12} />
                                  </button>
                                )}
                                {!c.isDisplayCurrency && (
                                  <button onClick={() => handleSetDisplay(c.id)} className="p-1.5 text-purple-400 hover:bg-purple-900/20 rounded-lg transition text-[10px] font-bold" title={t('storeSettings.currencies.setDisplay')}>
                                    <FaEye size={12} />
                                  </button>
                                )}
                                <button onClick={() => handleEditCurrency(c)} className="p-1.5 text-primary-400 hover:bg-primary-600/20 rounded-lg transition">
                                  <FaEdit size={12} />
                                </button>
                                {!c.isBaseCurrency && !c.isDisplayCurrency && (
                                  <button onClick={() => handleDeleteCurrency(c.id)} className="p-1.5 text-red-400 hover:bg-red-900/20 rounded-lg transition">
                                    <FaTrash size={12} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* ─── EXCHANGE RATES TAB ──────────────────────────────────── */}
      {activeTab === 'exchange-rates' && (
        <div className="space-y-4">
          {/* Status Bar */}
          <div className="bg-surface-850 rounded-lg shadow-dark-md p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full shrink-0 ${getStatusColor()}`} />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white">{t('storeSettings.exchangeRates.status')}</p>
                  <p className="text-xs text-neutral-400 truncate">
                    {rateStatus?.lastFetchedAt
                      ? `${t('storeSettings.exchangeRates.lastFetched')}: ${new Date(rateStatus.lastFetchedAt).toLocaleString()}`
                      : t('storeSettings.exchangeRates.neverFetched')}
                  </p>
                </div>
              </div>
              <button
                onClick={handleRefreshRates}
                disabled={refreshing}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-500 font-bold text-sm disabled:opacity-50 active:scale-[0.98] transition shrink-0"
              >
                <FaSync size={12} className={refreshing ? 'animate-spin' : ''} />
                {refreshing ? t('storeSettings.exchangeRates.refreshing') : t('storeSettings.exchangeRates.refresh')}
              </button>
            </div>
          </div>

          {rateStatus?.isStale && (
            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3">
              <p className="text-sm text-yellow-400 font-medium">{t('storeSettings.exchangeRates.staleWarning')}</p>
            </div>
          )}

          {ratesLoading ? (
            <div className="flex justify-center py-12"><LoadingSpinner /></div>
          ) : (
            <div className="bg-surface-850 rounded-lg shadow-dark-md overflow-hidden">
              {!rateStatus || rateStatus.rates.length === 0 ? (
                <div className="px-4 py-8 text-center text-neutral-400 text-sm">
                  {t('storeSettings.exchangeRates.empty')}
                </div>
              ) : (
                <>
                  {/* Mobile: Card layout */}
                  <div className="sm:hidden divide-y divide-surface-700">
                    {rateStatus.rates.map((r) => (
                      <div key={r.id} className="p-4 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-bold text-white">{r.baseCurrency}</span>
                            <span className="text-neutral-500">&rarr;</span>
                            <span className="text-neutral-300">{r.targetCurrency}</span>
                          </div>
                          <span className="text-sm font-mono text-primary-400">{Number(r.rate).toFixed(6)}</span>
                        </div>
                        <p className="text-[11px] text-neutral-500">{new Date(r.fetchedAt).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>

                  {/* Desktop: Table layout */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-surface-700">
                      <thead className="bg-surface-800">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">{t('storeSettings.exchangeRates.from')}</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">{t('storeSettings.exchangeRates.to')}</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">{t('storeSettings.exchangeRates.rate')}</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">{t('storeSettings.exchangeRates.fetchedAt')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-surface-700">
                        {rateStatus.rates.map((r) => (
                          <tr key={r.id} className="hover:bg-surface-800">
                            <td className="px-4 py-3 text-sm font-bold text-white">{r.baseCurrency}</td>
                            <td className="px-4 py-3 text-sm text-neutral-300">{r.targetCurrency}</td>
                            <td className="px-4 py-3 text-sm font-mono text-primary-400">{Number(r.rate).toFixed(6)}</td>
                            <td className="px-4 py-3 text-sm text-neutral-400">{new Date(r.fetchedAt).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* ─── PROFIT RULES TAB ────────────────────────────────────── */}
      {activeTab === 'profit-rules' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-end gap-2">
            <button
              onClick={handleRecalculateAll}
              disabled={recalculating}
              className="flex items-center gap-2 px-4 py-2 border border-primary-500/30 text-primary-400 rounded-lg hover:bg-primary-600/10 font-bold text-sm disabled:opacity-50 active:scale-[0.98] transition"
            >
              <FaCalculator size={12} />
              {recalculating ? t('storeSettings.profitRules.recalculating') : t('storeSettings.profitRules.recalcAll')}
            </button>
            <button
              onClick={handleCreateRule}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-500 font-bold text-sm active:scale-[0.98] transition"
            >
              <FaPlus size={12} /> {t('storeSettings.profitRules.add')}
            </button>
          </div>

          {rulesLoading ? (
            <div className="flex justify-center py-12"><LoadingSpinner /></div>
          ) : (
            <div className="bg-surface-850 rounded-lg shadow-dark-md overflow-hidden">
              {rules.length === 0 ? (
                <div className="px-4 py-8 text-center text-neutral-400 text-sm">
                  {t('storeSettings.profitRules.empty')}
                </div>
              ) : (
                <>
                  {/* Mobile: Card layout */}
                  <div className="sm:hidden divide-y divide-surface-700">
                    {rules.map((r) => (
                      <div key={r.id} className="p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-white">{r.name}</span>
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleEditRule(r)} className="p-1.5 text-primary-400 hover:bg-primary-600/20 rounded-lg transition">
                              <FaEdit size={12} />
                            </button>
                            <button onClick={() => handleDeleteRule(r.id)} className="p-1.5 text-red-400 hover:bg-red-900/20 rounded-lg transition">
                              <FaTrash size={12} />
                            </button>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                            r.type === 'global' ? 'bg-blue-900/30 text-blue-400' :
                            r.type === 'category' ? 'bg-green-900/30 text-green-400' :
                            'bg-purple-900/30 text-purple-400'
                          }`}>
                            {r.type}
                          </span>
                          {r.type === 'category' && r.componentType && (
                            <span className="text-xs text-neutral-400">{COMPONENT_TYPE_LABELS[r.componentType as ComponentType] || r.componentType}</span>
                          )}
                          {r.type === 'product' && r.pcComponent && (
                            <span className="text-xs text-neutral-400 truncate max-w-[180px]">{r.pcComponent.name_en}</span>
                          )}
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                            r.isActive ? 'bg-green-900/30 text-green-400' : 'bg-neutral-700 text-neutral-400'
                          }`}>
                            {r.isActive ? t('storeSettings.profitRules.active') : t('storeSettings.profitRules.inactive')}
                          </span>
                        </div>
                        <p className="text-sm font-mono text-primary-400">
                          {r.marginType === 'percentage' ? `${Number(r.marginValue)}%` : `${Number(r.marginValue)} SEK`}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Desktop: Table layout */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-surface-700">
                      <thead className="bg-surface-800">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">{t('storeSettings.profitRules.name')}</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">{t('storeSettings.profitRules.scope')}</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">{t('storeSettings.profitRules.margin')}</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">{t('storeSettings.profitRules.status')}</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-neutral-400 uppercase tracking-wider">{t('storeSettings.common.actions')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-surface-700">
                        {rules.map((r) => (
                          <tr key={r.id} className="hover:bg-surface-800">
                            <td className="px-4 py-3 text-sm font-bold text-white">{r.name}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                                r.type === 'global' ? 'bg-blue-900/30 text-blue-400' :
                                r.type === 'category' ? 'bg-green-900/30 text-green-400' :
                                'bg-purple-900/30 text-purple-400'
                              }`}>
                                {r.type}
                              </span>
                              {r.type === 'category' && r.componentType && (
                                <span className="ml-1.5 text-xs text-neutral-400">{COMPONENT_TYPE_LABELS[r.componentType as ComponentType] || r.componentType}</span>
                              )}
                              {r.type === 'product' && r.pcComponent && (
                                <span className="ml-1.5 text-xs text-neutral-400">{r.pcComponent.name_en}</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm font-mono text-primary-400">
                              {r.marginType === 'percentage' ? `${Number(r.marginValue)}%` : `${Number(r.marginValue)} SEK`}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                                r.isActive ? 'bg-green-900/30 text-green-400' : 'bg-neutral-700 text-neutral-400'
                              }`}>
                                {r.isActive ? t('storeSettings.profitRules.active') : t('storeSettings.profitRules.inactive')}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button onClick={() => handleEditRule(r)} className="p-1.5 text-primary-400 hover:bg-primary-600/20 rounded-lg transition">
                                  <FaEdit size={12} />
                                </button>
                                <button onClick={() => handleDeleteRule(r.id)} className="p-1.5 text-red-400 hover:bg-red-900/20 rounded-lg transition">
                                  <FaTrash size={12} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Price Preview Section */}
          <div className="bg-surface-850 rounded-lg shadow-dark-md p-4">
            <h3 className="text-sm font-semibold text-neutral-300 mb-3">{t('storeSettings.profitRules.pricePreview')}</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={previewComponentId}
                onChange={(e) => { setPreviewComponentId(e.target.value); setPricePreview(null); }}
                className="flex-1 px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
              >
                <option value="">{t('storeSettings.profitRules.selectComponent')}</option>
                {allComponents.filter(c => c.distributorCost && Number(c.distributorCost) > 0).map((c) => (
                  <option key={c.id} value={c.id}>{c.name_en} ({c.manufacturer})</option>
                ))}
              </select>
              <button
                onClick={handlePreviewPrice}
                disabled={!previewComponentId || previewLoading}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-500 font-bold text-sm disabled:opacity-50 active:scale-[0.98] transition"
              >
                {previewLoading ? t('storeSettings.profitRules.previewing') : t('storeSettings.profitRules.preview')}
              </button>
            </div>

            {pricePreview && (
              <div className="mt-4 bg-surface-800 rounded-lg p-3 space-y-2">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between gap-2">
                    <span className="text-neutral-400 shrink-0">{t('storeSettings.profitRules.distCost')}:</span>
                    <span className="text-white font-mono text-right">{pricePreview.distributorCost} {pricePreview.costCurrency}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-neutral-400 shrink-0">{t('storeSettings.profitRules.exchRate')}:</span>
                    <span className="text-white font-mono text-right">{pricePreview.exchangeRate.toFixed(6)}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-neutral-400 shrink-0">{t('storeSettings.profitRules.costBase')}:</span>
                    <span className="text-white font-mono text-right">{pricePreview.costInBaseCurrency.toFixed(2)} SEK</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-2">
                    <span className="text-neutral-400 shrink-0">{t('storeSettings.profitRules.marginApplied')}:</span>
                    <span className="text-white font-mono text-right break-words">
                      {pricePreview.marginRule
                        ? `${pricePreview.marginRule.name} (${pricePreview.marginRule.marginType === 'percentage' ? `${pricePreview.marginRule.marginValue}%` : `${pricePreview.marginRule.marginValue} flat`})`
                        : t('storeSettings.profitRules.noRule')}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-neutral-400 shrink-0">{t('storeSettings.profitRules.marginAmt')}:</span>
                    <span className="text-white font-mono text-right">+{pricePreview.marginAmount.toFixed(2)} SEK</span>
                  </div>
                  <div className="flex justify-between gap-2 pt-1 border-t border-surface-700">
                    <span className="text-neutral-400 font-semibold shrink-0">{t('storeSettings.profitRules.finalPrice')}:</span>
                    <span className="text-primary-400 font-bold font-mono text-lg">{pricePreview.finalPrice.toFixed(2)} SEK</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── CONVERTER TAB ───────────────────────────────────────── */}
      {activeTab === 'converter' && (
        <div className="space-y-4">
          {(!rateStatus || rateStatus.rates.length === 0) ? (
            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
              <p className="text-sm text-yellow-400 font-medium">{t('storeSettings.converter.noRates')}</p>
            </div>
          ) : (
            <div className="bg-surface-850 rounded-lg shadow-dark-md p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-4 items-end">
                {/* From */}
                <div>
                  <label className="block text-xs font-medium text-neutral-400 uppercase tracking-wider mb-1.5">
                    {t('storeSettings.converter.from')}
                  </label>
                  <select
                    value={converterFrom}
                    onChange={(e) => { setConverterFrom(e.target.value); setConverterResult(null); }}
                    className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                  >
                    <option value="">—</option>
                    {currencies.map((c) => (
                      <option key={c.id} value={c.code}>{c.code} — {c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Swap Button */}
                <button
                  type="button"
                  onClick={handleSwapCurrencies}
                  className="self-end p-2.5 text-neutral-400 hover:text-primary-400 hover:bg-primary-600/10 rounded-lg transition"
                  title={t('storeSettings.converter.swap')}
                >
                  <FaExchangeAlt size={16} />
                </button>

                {/* To */}
                <div>
                  <label className="block text-xs font-medium text-neutral-400 uppercase tracking-wider mb-1.5">
                    {t('storeSettings.converter.to')}
                  </label>
                  <select
                    value={converterTo}
                    onChange={(e) => { setConverterTo(e.target.value); setConverterResult(null); }}
                    className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                  >
                    <option value="">—</option>
                    {currencies.map((c) => (
                      <option key={c.id} value={c.code}>{c.code} — {c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Amount + Convert */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-neutral-400 uppercase tracking-wider mb-1.5">
                    {t('storeSettings.converter.amount')}
                  </label>
                  <input
                    type="number"
                    value={converterAmount}
                    onChange={(e) => { setConverterAmount(e.target.value); setConverterResult(null); }}
                    min={0}
                    step="any"
                    className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                  />
                </div>
                <button
                  onClick={handleConvert}
                  disabled={!converterFrom || !converterTo || !converterAmount}
                  className="self-end px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-500 font-bold text-sm disabled:opacity-50 active:scale-[0.98] transition"
                >
                  {t('storeSettings.converter.convert')}
                </button>
              </div>

              {/* Result */}
              {converterFrom && converterTo && converterFrom === converterTo && (
                <div className="bg-surface-800 rounded-lg p-3">
                  <p className="text-sm text-neutral-400">{t('storeSettings.converter.sameCurrency')}</p>
                </div>
              )}

              {converterResult !== null && converterFrom !== converterTo && (
                <div className="bg-surface-800 rounded-lg p-4">
                  <p className="text-xs text-neutral-400 uppercase tracking-wider mb-1">{t('storeSettings.converter.result')}</p>
                  <p className="text-2xl font-bold text-primary-400 font-mono">
                    {converterResult.toFixed(currencies.find(c => c.code === converterTo)?.decimalPlaces ?? 2)}{' '}
                    <span className="text-base text-neutral-300">{converterTo}</span>
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">
                    {converterAmount} {converterFrom} = {converterResult.toFixed(currencies.find(c => c.code === converterTo)?.decimalPlaces ?? 2)} {converterTo}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ─── CURRENCY MODAL ──────────────────────────────────────── */}
      {showCurrencyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
          <div className="bg-surface-900 rounded-2xl w-full max-w-md overflow-hidden">
            <div className="border-b border-surface-700 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-thin text-white">
                {editingCurrency ? t('storeSettings.currencies.edit') : t('storeSettings.currencies.addTitle')}
              </h3>
              <button onClick={() => setShowCurrencyModal(false)} className="p-2 text-neutral-500 hover:text-neutral-300 hover:bg-surface-700 rounded-lg">
                <FaTimes size={16} />
              </button>
            </div>
            <form onSubmit={handleSaveCurrency} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-400 uppercase tracking-wider mb-1.5">{t('storeSettings.currencies.code')}</label>
                  <input
                    type="text"
                    value={currencyForm.code}
                    onChange={(e) => setCurrencyForm({ ...currencyForm, code: e.target.value.toUpperCase() })}
                    maxLength={3}
                    required
                    className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                    placeholder="SEK"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-400 uppercase tracking-wider mb-1.5">{t('storeSettings.currencies.symbol')}</label>
                  <input
                    type="text"
                    value={currencyForm.symbol}
                    onChange={(e) => setCurrencyForm({ ...currencyForm, symbol: e.target.value })}
                    required
                    className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                    placeholder="kr"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-400 uppercase tracking-wider mb-1.5">{t('storeSettings.currencies.name')}</label>
                <input
                  type="text"
                  value={currencyForm.name}
                  onChange={(e) => setCurrencyForm({ ...currencyForm, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                  placeholder="Swedish Krona"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-400 uppercase tracking-wider mb-1.5">{t('storeSettings.currencies.decimals')}</label>
                <input
                  type="number"
                  value={currencyForm.decimalPlaces}
                  onChange={(e) => setCurrencyForm({ ...currencyForm, decimalPlaces: parseInt(e.target.value) || 2 })}
                  min={0}
                  max={8}
                  className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCurrencyModal(false)}
                  className="flex-1 px-4 py-2.5 border border-surface-600 rounded-lg text-neutral-300 font-bold text-sm hover:bg-surface-700">
                  {t('storeSettings.common.cancel')}
                </button>
                <button type="submit"
                  className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-lg font-bold text-sm hover:bg-primary-500">
                  {editingCurrency ? t('storeSettings.common.update') : t('storeSettings.common.create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── RULE MODAL ──────────────────────────────────────────── */}
      {showRuleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
          <div className="bg-surface-900 rounded-2xl w-full max-w-lg overflow-hidden">
            <div className="border-b border-surface-700 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-thin text-white">
                {editingRule ? t('storeSettings.profitRules.editTitle') : t('storeSettings.profitRules.addTitle')}
              </h3>
              <button onClick={() => setShowRuleModal(false)} className="p-2 text-neutral-500 hover:text-neutral-300 hover:bg-surface-700 rounded-lg">
                <FaTimes size={16} />
              </button>
            </div>
            <form onSubmit={handleSaveRule} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-400 uppercase tracking-wider mb-1.5">{t('storeSettings.profitRules.name')}</label>
                <input
                  type="text"
                  value={ruleForm.name}
                  onChange={(e) => setRuleForm({ ...ruleForm, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                  placeholder={t('storeSettings.profitRules.namePlaceholder')}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 uppercase tracking-wider mb-1.5">{t('storeSettings.profitRules.ruleType')}</label>
                <select
                  value={ruleForm.type}
                  onChange={(e) => setRuleForm({ ...ruleForm, type: e.target.value as 'global' | 'category' | 'product' })}
                  className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                >
                  <option value="global">{t('storeSettings.profitRules.typeGlobal')}</option>
                  <option value="category">{t('storeSettings.profitRules.typeCategory')}</option>
                  <option value="product">{t('storeSettings.profitRules.typeProduct')}</option>
                </select>
              </div>

              {ruleForm.type === 'category' && (
                <div>
                  <label className="block text-xs font-medium text-neutral-400 uppercase tracking-wider mb-1.5">{t('storeSettings.profitRules.componentType')}</label>
                  <select
                    value={ruleForm.componentType}
                    onChange={(e) => setRuleForm({ ...ruleForm, componentType: e.target.value })}
                    required
                    className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                  >
                    <option value="">{t('storeSettings.profitRules.selectType')}</option>
                    {COMPONENT_TYPES.map((type) => (
                      <option key={type} value={type}>{COMPONENT_TYPE_LABELS[type]}</option>
                    ))}
                  </select>
                </div>
              )}

              {ruleForm.type === 'product' && (
                <div>
                  <label className="block text-xs font-medium text-neutral-400 uppercase tracking-wider mb-1.5">{t('storeSettings.profitRules.component')}</label>
                  {ruleForm.pcComponentId ? (
                    <div className="flex items-center gap-2 px-3 py-2 border border-surface-600 rounded-lg">
                      <span className="flex-1 text-sm text-white truncate">{getSelectedComponentName()}</span>
                      <button type="button" onClick={() => setRuleForm({ ...ruleForm, pcComponentId: '' })}
                        className="text-neutral-400 hover:text-white">
                        <FaTimes size={12} />
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      <input
                        type="text"
                        value={componentSearch}
                        onChange={(e) => setComponentSearch(e.target.value)}
                        placeholder={t('storeSettings.profitRules.searchComponent')}
                        className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                      />
                      {searchLoading && <div className="absolute right-3 top-2.5"><LoadingSpinner /></div>}
                      {searchResults.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-surface-800 border border-surface-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                          {searchResults.map((c) => (
                            <button
                              type="button"
                              key={c.id}
                              onClick={() => {
                                setRuleForm({ ...ruleForm, pcComponentId: c.id });
                                setComponentSearch('');
                                setSearchResults([]);
                              }}
                              className="w-full px-3 py-2 text-left text-sm text-neutral-300 hover:bg-surface-700 hover:text-white"
                            >
                              {c.name_en} <span className="text-neutral-500">({c.manufacturer})</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-400 uppercase tracking-wider mb-1.5">{t('storeSettings.profitRules.marginType')}</label>
                  <select
                    value={ruleForm.marginType}
                    onChange={(e) => setRuleForm({ ...ruleForm, marginType: e.target.value as 'percentage' | 'flat' })}
                    className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                  >
                    <option value="percentage">{t('storeSettings.profitRules.percentage')}</option>
                    <option value="flat">{t('storeSettings.profitRules.flat')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-400 uppercase tracking-wider mb-1.5">
                    {t('storeSettings.profitRules.marginValue')} {ruleForm.marginType === 'percentage' ? '(%)' : '(SEK)'}
                  </label>
                  <input
                    type="number"
                    value={ruleForm.marginValue}
                    onChange={(e) => setRuleForm({ ...ruleForm, marginValue: parseFloat(e.target.value) || 0 })}
                    min={0}
                    step={ruleForm.marginType === 'percentage' ? '0.1' : '1'}
                    required
                    className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowRuleModal(false)}
                  className="flex-1 px-4 py-2.5 border border-surface-600 rounded-lg text-neutral-300 font-bold text-sm hover:bg-surface-700">
                  {t('storeSettings.common.cancel')}
                </button>
                <button type="submit"
                  className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-lg font-bold text-sm hover:bg-primary-500">
                  {editingRule ? t('storeSettings.common.update') : t('storeSettings.common.create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreSettingsManager;
