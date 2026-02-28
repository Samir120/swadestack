import React, { useState, useEffect } from 'react';
import { useToast } from '../common/Toast';
import apiClient from '../../models/api/apiClient';
import { useAppSelector } from '../../store/hooks';
import { fetchLegalSettings } from '../../store/slices/legalSettingsSlice';
import { useAppDispatch } from '../../store/hooks';
import LoadingSpinner from '../common/LoadingSpinner';

// --- PC Configuration invoice helpers ---

const CATEGORY_LABELS: Record<string, string> = {
  cpu: 'CPU', motherboard: 'Motherboard', ram: 'RAM', gpu: 'GPU',
  ssd: 'SSD', hdd: 'HDD', psu: 'PSU', case: 'Case',
  cooling: 'Cooling', optical: 'Optical Drive', os: 'OS', fan: 'Fan',
};

const ARRAY_COMPONENT_TYPES = ['rams', 'gpus', 'ssds', 'hdds', 'fans'];

function isPCConfigDescription(description: string): boolean {
  return typeof description === 'string' && description.startsWith('{') && description.includes('"components"');
}

interface PCComponent {
  category: string;
  name: string;
  price: number;
  quantity: number;
}

function parsePCConfigComponents(description: string, lang: string): PCComponent[] | null {
  try {
    const configData = JSON.parse(description);
    if (!configData.components) return null;

    const result: PCComponent[] = [];

    for (const [category, component] of Object.entries(configData.components)) {
      if (!component) continue;

      if (ARRAY_COMPONENT_TYPES.includes(category) && Array.isArray(component)) {
        const singular = category.slice(0, -1);
        const label = CATEGORY_LABELS[singular] || singular.toUpperCase();
        for (const comp of component) {
          if (comp && typeof comp === 'object') {
            const c = comp as Record<string, any>;
            const name = (lang === 'sv' ? (c.name_sv || c.name_en) : (c.name_en || c.name_sv)) || c.name || label;
            const price = typeof c.price === 'string' ? parseFloat(c.price) : (c.price || 0);
            const qty = c.quantity || 1;
            result.push({ category: label, name, price: price * qty, quantity: qty });
          }
        }
      } else if (typeof component === 'object' && !Array.isArray(component)) {
        const label = CATEGORY_LABELS[category] || category.toUpperCase();
        const c = component as Record<string, any>;
        const name = (lang === 'sv' ? (c.name_sv || c.name_en) : (c.name_en || c.name_sv)) || c.name || label;
        const price = typeof c.price === 'string' ? parseFloat(c.price) : (c.price || 0);
        const qty = c.quantity || 1;
        result.push({ category: label, name, price: price * qty, quantity: qty });
      }
    }

    // Build service
    if (configData.buildService) {
      const bs = configData.buildService;
      const name = (lang === 'sv' ? (bs.name_sv || bs.name_en) : (bs.name_en || bs.name_sv)) || bs.name || 'Professional Assembly';
      result.push({ category: 'Build Service', name, price: bs.price || 0, quantity: 1 });
    } else if (configData.includesBuildService && configData.buildServiceCharge) {
      result.push({ category: 'Build Service', name: 'Professional Assembly', price: configData.buildServiceCharge, quantity: 1 });
    } else if (configData.priceBreakdown?.buildServiceCharge) {
      result.push({ category: 'Build Service', name: 'Professional Assembly', price: configData.priceBreakdown.buildServiceCharge, quantity: 1 });
    }

    return result.length > 0 ? result : null;
  } catch {
    return null;
  }
}

const InvoicesTab: React.FC = () => {
  const toast = useToast();
  const dispatch = useAppDispatch();
  const language = useAppSelector((state) => state.ui.language);
  const legalSettings = useAppSelector((state) => state.legalSettings.settings);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  useEffect(() => {
    loadInvoices();
    if (!legalSettings) {
      dispatch(fetchLegalSettings());
    }
  }, []);

  const loadInvoices = async () => {
    try {
      const response = await apiClient.get<any[]>('/user/invoices');
      if (response.success && response.data) {
        setInvoices(response.data);
      }
    } catch (error) {
      console.error('Failed to load invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadInvoiceDetails = async (orderId: string) => {
    try {
      const response = await apiClient.get(`/user/invoices/${orderId}`);
      if (response.success) {
        setSelectedInvoice(response.data);
      }
    } catch (error) {
      console.error('Failed to load invoice details:', error);
    }
  };

  const downloadInvoice = async (orderId: string, invoiceNumber: string) => {
    try {
      const blob = await apiClient.getBlob(`/user/invoices/${orderId}/download`);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      console.error('Download failed:', error);
      toast.error(language === 'en' ? 'Failed to download invoice' : 'Kunde inte ladda ner faktura');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 gap-3">
        <LoadingSpinner />
        <span className="text-gray-500 dark:text-neutral-400 text-sm">
          {language === 'en' ? 'Loading invoices...' : 'Laddar fakturor...'}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {invoices.length === 0 ? (
        <div className="text-center py-10 sm:py-12 bg-gray-100 dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700">
          <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-2xl bg-gray-200 dark:bg-surface-700 flex items-center justify-center mb-3">
            <svg className="w-7 h-7 sm:w-8 sm:h-8 text-gray-400 dark:text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-gray-700 dark:text-neutral-300 text-sm sm:text-base font-bold mb-1">
            {language === 'en' ? 'No invoices available' : 'Inga fakturor tillgängliga'}
          </p>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-neutral-400">
            {language === 'en'
              ? 'Invoices are generated for paid and completed orders.'
              : 'Fakturor genereras för betalda och slutförda beställningar.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:gap-4">
          {invoices.map((invoice) => (
            <div
              key={invoice.id}
              className="bg-white dark:bg-surface-850 p-4 sm:p-5 md:p-6 rounded-2xl border border-gray-200 dark:border-surface-700 hover:shadow-light-md dark:hover:shadow-dark-md hover:border-gray-300 dark:hover:border-surface-600 transition-all"
            >
              {/* Mobile Layout */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary-600/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate">
                      {invoice.invoiceNumber}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-neutral-400">
                      {language === 'en' ? 'Order' : 'Beställning'} #{invoice.orderNumber}
                    </p>
                    <p className="text-[10px] sm:text-xs text-gray-500 dark:text-neutral-400">
                      {new Date(invoice.date).toLocaleDateString(language === 'en' ? 'en-US' : 'sv-SE', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2">
                  <div className="text-right">
                    <p className="text-lg sm:text-xl font-bold text-primary-600 dark:text-primary-400">
                      {Number(invoice.total).toLocaleString('sv-SE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} {invoice.currency}
                    </p>
                    <span
                      className={`inline-block px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold rounded-full mt-1 ${
                        invoice.status === 'completed'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                          : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      }`}
                    >
                      {invoice.status === 'completed'
                        ? (language === 'en' ? 'Completed' : 'Slutförd')
                        : (language === 'en' ? 'Paid' : 'Betald')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200 dark:border-surface-700">
                <button
                  onClick={() => loadInvoiceDetails(invoice.id)}
                  className="flex-1 sm:flex-none px-4 py-2 sm:py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-500 transition-colors text-xs sm:text-sm font-bold active:scale-[0.98]"
                >
                  {language === 'en' ? 'View' : 'Visa'}
                </button>
                <button
                  onClick={() => downloadInvoice(invoice.id, invoice.invoiceNumber)}
                  className="flex-1 sm:flex-none px-4 py-2 sm:py-2.5 bg-gray-200 dark:bg-surface-600 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-surface-500 transition-colors text-xs sm:text-sm font-bold active:scale-[0.98]"
                >
                  {language === 'en' ? 'Download' : 'Ladda ner'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Invoice Details Modal */}
      {selectedInvoice && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-[60]"
          onClick={() => setSelectedInvoice(null)}
        >
          <div
            className="bg-white dark:bg-surface-850 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-3xl max-h-modal-lg sm:max-h-modal overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-surface-850 border-b border-gray-200 dark:border-surface-700 p-4 sm:p-5 md:p-6 flex items-center justify-between z-10">
              <div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-blue-400">
                  {language === 'en' ? 'INVOICE' : 'FAKTURA'}
                </h2>
                <p className="text-gray-500 dark:text-neutral-400 text-xs sm:text-sm">{selectedInvoice.invoiceNumber}</p>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="p-2 text-gray-500 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-neutral-300 hover:bg-gray-200 dark:hover:bg-surface-700 rounded-full transition-colors"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-6">
              {/* Company & Customer Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-gray-100 dark:bg-surface-800 p-3 sm:p-4 rounded-xl">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-xs sm:text-sm">{language === 'en' ? 'From:' : 'Från:'}</h3>
                  <p className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">{selectedInvoice.from.company}</p>
                  <p className="text-gray-500 dark:text-neutral-400 text-xs sm:text-sm">{selectedInvoice.from.address}</p>
                  <p className="text-gray-500 dark:text-neutral-400 text-xs sm:text-sm">
                    {selectedInvoice.from.city}, {selectedInvoice.from.postalCode}
                  </p>
                  <p className="text-gray-500 dark:text-neutral-400 text-xs sm:text-sm">{selectedInvoice.from.country}</p>
                  <p className="text-gray-500 dark:text-neutral-400 text-xs sm:text-sm mt-1">{selectedInvoice.from.email}</p>
                  <p className="text-gray-500 dark:text-neutral-400 text-xs sm:text-sm">{selectedInvoice.from.phone}</p>
                </div>

                <div className="bg-gray-100 dark:bg-surface-800 p-3 sm:p-4 rounded-xl">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-xs sm:text-sm">{language === 'en' ? 'Bill To:' : 'Faktureras till:'}</h3>
                  <p className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">{selectedInvoice.to.name}</p>
                  <p className="text-gray-500 dark:text-neutral-400 text-xs sm:text-sm">{selectedInvoice.to.email}</p>
                  {selectedInvoice.to.address && (
                    <>
                      <p className="text-gray-500 dark:text-neutral-400 text-xs sm:text-sm">{selectedInvoice.to.address}</p>
                      <p className="text-gray-500 dark:text-neutral-400 text-xs sm:text-sm">
                        {selectedInvoice.to.city}, {selectedInvoice.to.postalCode}
                      </p>
                      <p className="text-gray-500 dark:text-neutral-400 text-xs sm:text-sm">{selectedInvoice.to.country}</p>
                    </>
                  )}
                </div>
              </div>

              {/* Invoice Meta */}
              <div className="bg-gray-100 dark:bg-surface-800 p-3 sm:p-4 rounded-xl">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  <div>
                    <p className="text-[10px] sm:text-xs text-gray-500 dark:text-neutral-400">{language === 'en' ? 'Invoice #' : 'Faktura #'}</p>
                    <p className="font-bold text-gray-900 dark:text-white text-xs sm:text-sm truncate">{selectedInvoice.invoiceNumber}</p>
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs text-gray-500 dark:text-neutral-400">{language === 'en' ? 'Order #' : 'Order #'}</p>
                    <p className="font-bold text-gray-900 dark:text-white text-xs sm:text-sm truncate">{selectedInvoice.orderNumber}</p>
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs text-gray-500 dark:text-neutral-400">{language === 'en' ? 'Invoice Date' : 'Fakturadatum'}</p>
                    <p className="font-bold text-gray-900 dark:text-white text-xs sm:text-sm">
                      {new Date(selectedInvoice.date).toLocaleDateString(language === 'en' ? 'en-US' : 'sv-SE')}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs text-gray-500 dark:text-neutral-400">{language === 'en' ? 'Status' : 'Status'}</p>
                    <span
                      className={`inline-block px-2 py-0.5 text-[10px] sm:text-xs font-bold rounded-full ${
                        selectedInvoice.status === 'paid' || selectedInvoice.status === 'completed'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                          : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                      }`}
                    >
                      {selectedInvoice.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Items - Mobile Card View */}
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-3 text-sm sm:text-base">
                  {language === 'en' ? 'Items' : 'Artiklar'}
                </h3>

                {/* Desktop Table */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-100 dark:bg-surface-800">
                        <th className="text-left p-3 font-medium text-gray-700 dark:text-neutral-300 text-xs sm:text-sm uppercase tracking-wider">{language === 'en' ? 'Item' : 'Artikel'}</th>
                        <th className="text-left p-3 font-medium text-gray-700 dark:text-neutral-300 text-xs sm:text-sm uppercase tracking-wider">{language === 'en' ? 'Description' : 'Beskrivning'}</th>
                        <th className="text-right p-3 font-medium text-gray-700 dark:text-neutral-300 text-xs sm:text-sm uppercase tracking-wider">{language === 'en' ? 'Qty' : 'Antal'}</th>
                        <th className="text-right p-3 font-medium text-gray-700 dark:text-neutral-300 text-xs sm:text-sm uppercase tracking-wider">{language === 'en' ? 'Price' : 'Pris'}</th>
                        <th className="text-right p-3 font-medium text-gray-700 dark:text-neutral-300 text-xs sm:text-sm uppercase tracking-wider">{language === 'en' ? 'Total' : 'Totalt'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedInvoice.items.map((item: any, idx: number) => {
                        const pcComponents = item.description && isPCConfigDescription(item.description)
                          ? parsePCConfigComponents(item.description, language)
                          : null;
                        if (pcComponents) {
                          return (
                            <React.Fragment key={idx}>
                              <tr className="border-b border-gray-100 dark:border-surface-700/50">
                                <td colSpan={2} className="p-3">
                                  <span className="font-bold text-gray-900 dark:text-white text-sm">{item.name}</span>
                                </td>
                                <td className="p-3 text-right text-gray-900 dark:text-white text-sm">{item.quantity}</td>
                                <td className="p-3 text-right text-gray-900 dark:text-white text-sm">
                                  {item.price.toLocaleString('sv-SE', { minimumFractionDigits: 0 })} {selectedInvoice.currency}
                                </td>
                                <td className="p-3 text-right font-bold text-gray-900 dark:text-white text-sm">
                                  {item.total.toLocaleString('sv-SE', { minimumFractionDigits: 0 })} {selectedInvoice.currency}
                                </td>
                              </tr>
                              {pcComponents.map((comp, i) => (
                                <tr key={`${idx}-${i}`} className={i === pcComponents.length - 1 ? 'border-b border-gray-200 dark:border-surface-700' : ''}>
                                  <td className="pl-6 py-0.5 text-xs text-gray-500 dark:text-neutral-400" colSpan={2}>
                                    <span className="font-semibold text-gray-700 dark:text-neutral-300">{comp.category}</span> — {comp.name}
                                  </td>
                                  <td className="py-0.5 text-right text-xs text-gray-500 dark:text-neutral-400">{comp.quantity}</td>
                                  <td className="py-0.5 pr-3 text-right text-xs text-gray-500 dark:text-neutral-400">
                                    {(comp.price / comp.quantity).toLocaleString('sv-SE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {selectedInvoice.currency}
                                  </td>
                                  <td className="py-0.5 pr-3 text-right text-xs text-gray-500 dark:text-neutral-400">
                                    {comp.price.toLocaleString('sv-SE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {selectedInvoice.currency}
                                  </td>
                                </tr>
                              ))}
                            </React.Fragment>
                          );
                        }
                        return (
                          <tr key={idx} className="border-b border-gray-200 dark:border-surface-700">
                            <td className="p-3 text-gray-900 dark:text-white text-sm">{item.name}</td>
                            <td className="p-3 text-gray-500 dark:text-neutral-400 text-xs">{item.description}</td>
                            <td className="p-3 text-right text-gray-900 dark:text-white text-sm">{item.quantity}</td>
                            <td className="p-3 text-right text-gray-900 dark:text-white text-sm">
                              {item.price.toLocaleString('sv-SE', { minimumFractionDigits: 0 })} {selectedInvoice.currency}
                            </td>
                            <td className="p-3 text-right font-bold text-gray-900 dark:text-white text-sm">
                              {item.total.toLocaleString('sv-SE', { minimumFractionDigits: 0 })} {selectedInvoice.currency}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="sm:hidden space-y-2">
                  {selectedInvoice.items.map((item: any, idx: number) => {
                    const pcComponents = item.description && isPCConfigDescription(item.description)
                      ? parsePCConfigComponents(item.description, language)
                      : null;
                    return (
                      <div key={idx} className="bg-gray-100 dark:bg-surface-800 p-3 rounded-xl">
                        <div className="flex justify-between items-start mb-1">
                          <p className="font-bold text-gray-900 dark:text-white text-sm flex-1">{item.name}</p>
                          <p className="font-bold text-gray-900 dark:text-white text-sm ml-2">
                            {item.total.toLocaleString('sv-SE', { minimumFractionDigits: 0 })} {selectedInvoice.currency}
                          </p>
                        </div>
                        {pcComponents ? (
                          <div className="space-y-0.5">
                            {pcComponents.map((comp, i) => (
                              <div key={i} className="flex justify-between gap-1 text-xs text-gray-500 dark:text-neutral-400">
                                <span><span className="font-semibold text-gray-600 dark:text-neutral-300">{comp.category}</span> — {comp.name}</span>
                                <span className="whitespace-nowrap">&times;{comp.quantity} &nbsp; {comp.price.toLocaleString('sv-SE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {selectedInvoice.currency}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <>
                            <p className="text-gray-500 dark:text-neutral-400 text-xs mb-1">{item.description}</p>
                            <p className="text-gray-500 dark:text-neutral-400 text-xs">
                              {item.quantity} × {item.price.toLocaleString('sv-SE', { minimumFractionDigits: 0 })} {selectedInvoice.currency}
                            </p>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-full sm:w-72 bg-gray-100 dark:bg-surface-800 p-3 sm:p-4 rounded-xl">
                  <div className="flex justify-between py-1.5 sm:py-2 text-gray-500 dark:text-neutral-400 text-xs sm:text-sm">
                    <span>{language === 'en' ? 'Subtotal:' : 'Delsumma:'}</span>
                    <span className="font-medium">
                      {selectedInvoice.subtotal.toLocaleString('sv-SE', { minimumFractionDigits: 0 })} {selectedInvoice.currency}
                    </span>
                  </div>
                  {selectedInvoice.discountAmount > 0 && (
                    <div className="flex justify-between py-1.5 sm:py-2 text-green-600 dark:text-green-400 text-xs sm:text-sm">
                      <span>{language === 'en' ? 'Coupon Discount' : 'Kupongrabatt'}{selectedInvoice.couponCode ? ` (${selectedInvoice.couponCode})` : ''}:</span>
                      <span className="font-medium">
                        -{selectedInvoice.discountAmount.toLocaleString('sv-SE', { minimumFractionDigits: 0 })} {selectedInvoice.currency}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between py-1.5 sm:py-2 text-gray-500 dark:text-neutral-400 text-xs sm:text-sm">
                    <span>{language === 'en' ? 'Tax' : 'Moms'} ({selectedInvoice.taxRate}%):</span>
                    <span className="font-medium">
                      {selectedInvoice.tax.toLocaleString('sv-SE', { minimumFractionDigits: 0 })} {selectedInvoice.currency}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 sm:py-3 text-base sm:text-lg font-bold text-blue-600 dark:text-blue-400 border-t-2 border-blue-600 dark:border-blue-400 mt-2">
                    <span>{language === 'en' ? 'Total:' : 'Totalt:'}</span>
                    <span>
                      {selectedInvoice.total.toLocaleString('sv-SE', { minimumFractionDigits: 0 })} {selectedInvoice.currency}
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 dark:border-surface-700 pt-4 sm:pt-6 text-xs sm:text-sm text-gray-500 dark:text-neutral-400">
                <p className="mb-1.5 sm:mb-2">
                  <strong>{language === 'en' ? 'Notes:' : 'Anteckningar:'}</strong> {selectedInvoice.notes}
                </p>
                <p className="mb-3 sm:mb-4">
                  <strong>{language === 'en' ? 'Terms:' : 'Villkor:'}</strong> {selectedInvoice.terms}
                </p>
                {selectedInvoice.paymentId && (
                  <p className="text-[10px] sm:text-xs text-gray-500 dark:text-neutral-400">
                    <strong>{language === 'en' ? 'Payment ID:' : 'Betalnings-ID:'}</strong> {selectedInvoice.paymentId}
                  </p>
                )}
              </div>

              {/* Invoice Disclaimer */}
              {legalSettings?.showInvoiceDisclaimer && (() => {
                const defaultEn = 'All payments and invoices are issued by {CompanyName} (Org.nr: {OrganizationNumber}, VAT: {VatNumber}), {StreetAddress}, {PostalCode} {City}. {TradingName} is a trading name of {CompanyName}.';
                const defaultSv = 'Alla betalningar och fakturor utfärdas av {CompanyName} (Org.nr: {OrganizationNumber}, Moms.nr: {VatNumber}), {StreetAddress}, {PostalCode} {City}. {TradingName} är ett handelsnamn för {CompanyName}.';
                const raw = language === 'sv'
                  ? (legalSettings.invoiceDisclaimer_sv || defaultSv)
                  : (legalSettings.invoiceDisclaimer_en || defaultEn);
                const rendered = raw
                  .replace(/\{CompanyName\}/g, legalSettings.companyName || '')
                  .replace(/\{TradingName\}/g, legalSettings.tradingName || '')
                  .replace(/\{OrganizationNumber\}/g, legalSettings.orgNumber || '')
                  .replace(/\{VatNumber\}/g, legalSettings.vatNumber || '')
                  .replace(/\{StreetAddress\}/g, legalSettings.streetAddress || '')
                  .replace(/\{PostalCode\}/g, legalSettings.postalCode || '')
                  .replace(/\{City\}/g, legalSettings.city || '');
                return (
                  <div className="text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700 pt-3 mt-6">
                    {rendered}
                  </div>
                );
              })()}

              {/* Actions */}
              <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-200 dark:bg-surface-700 text-gray-700 dark:text-neutral-300 rounded-lg hover:bg-gray-300 dark:hover:bg-surface-600 transition-colors font-bold text-sm active:scale-[0.98]"
                >
                  {language === 'en' ? 'Close' : 'Stäng'}
                </button>
                <button
                  onClick={() => {
                    // Find the invoice ID from the invoices list
                    const invoice = invoices.find(inv => inv.invoiceNumber === selectedInvoice.invoiceNumber);
                    if (invoice) {
                      downloadInvoice(invoice.id, selectedInvoice.invoiceNumber);
                    }
                  }}
                  className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-500 transition-colors font-bold text-sm active:scale-[0.98]"
                >
                  {language === 'en' ? 'Download Invoice' : 'Ladda ner faktura'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoicesTab;
