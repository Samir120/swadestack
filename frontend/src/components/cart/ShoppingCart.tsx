import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { toggleCart } from '../../store/slices/uiSlice';
import { useCartViewModel } from '../../viewmodels/cartViewModel';
import { useServicesViewModel } from '../../viewmodels/servicesViewModel';
import Lottie from 'lottie-react';
import emptyCartAnimation from '../../assets/animations/empty-cart.json';
import { useVatRate } from '../../hooks/useVatRate';
import { netToGross } from '../../utils/vat';

const ShoppingCart: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isOpen = useAppSelector((state) => state.ui.isCartOpen);
  const language = useAppSelector((state) => state.ui.language);
  const vatRate = useVatRate();

  const {
    items,
    pcItems,
    componentItems,
    isEmpty,
    formatTotal,
    removeServiceFromCart,
    removePCFromCart,
    removeComponentFromCart,
    incrementQuantity,
    decrementQuantity,
    incrementComponentQuantity,
    decrementComponentQuantity,
  } = useCartViewModel();

  // Formatter only — the drawer renders names from its own cart items, so it needs
  // nothing out of the services store. The drawer mounts on every page, so leaving the
  // hook's auto-load on cost a /services request site-wide.
  const { getServiceName } = useServicesViewModel({ autoLoad: false });

  // Prevent background scrolling when cart is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleCheckout = () => {
    dispatch(toggleCart());
    navigate('/checkout');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop - Above header (z-50) */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
        onClick={() => dispatch(toggleCart())}
      />

      {/* Slide-over - Above backdrop */}
      <div className="fixed right-0 top-0 h-full w-full max-w-full sm:max-w-md bg-white shadow-light-xl border-l border-gray-200 dark:bg-surface-850 dark:shadow-dark-xl dark:border-surface-700 z-[70] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-surface-700">
          <h2 className="text-xl sm:text-2xl font-thin text-gray-900 dark:text-white">
            {language === 'en' ? 'Shopping Cart' : 'Kundvagn'}
          </h2>
          <button
            onClick={() => dispatch(toggleCart())}
            className="text-gray-400 hover:text-gray-600 dark:text-neutral-400 dark:hover:text-white p-1"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-grow overflow-y-auto p-4 sm:p-6">
          {isEmpty() ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 opacity-50 dark:opacity-40">
                <Lottie animationData={emptyCartAnimation} loop />
              </div>
              <p className="text-gray-500 dark:text-neutral-400">
                {language === 'en' ? 'Your cart is empty' : 'Din kundvagn är tom'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.service.id} className="flex items-center space-x-4 border-b border-gray-200 dark:border-surface-700 pb-4">
                  {/* Service Info */}
                  <div className="flex-grow">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {getServiceName(item.service, language)}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-neutral-400">
                      {item.service.discountPrice != null ? (
                        <>
                          <span className="line-through mr-1">
                            {netToGross(item.service.price, vatRate).toLocaleString('sv-SE', { maximumFractionDigits: 0 })} {item.service.currency}
                          </span>
                          <span className="text-red-400 font-medium">
                            {netToGross(item.service.discountPrice, vatRate).toLocaleString('sv-SE', { maximumFractionDigits: 0 })} {item.service.currency}
                          </span>
                        </>
                      ) : (
                        <>{netToGross(item.service.price, vatRate).toLocaleString('sv-SE', { maximumFractionDigits: 0 })} {item.service.currency}</>
                      )}
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => decrementQuantity(item.service.id)}
                      className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded hover:bg-gray-100 text-gray-700 dark:border-surface-700 dark:hover:bg-surface-700 dark:text-neutral-300"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-gray-900 dark:text-white">{item.quantity}</span>
                    <button
                      onClick={() => incrementQuantity(item.service.id)}
                      className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded hover:bg-gray-100 text-gray-700 dark:border-surface-700 dark:hover:bg-surface-700 dark:text-neutral-300"
                    >
                      +
                    </button>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeServiceFromCart(item.service.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}

              {/* PC Items */}
              {pcItems.map((item) => {
                const pc = item.preConfiguredPC;
                const pcName = language === 'en' ? pc.name_en : pc.name_sv;
                const componentPrice = Number(pc.discountedPrice ?? pc.totalPrice) || 0;
                const buildCharge = pc.includesBuildService ? (Number(pc.buildServiceCharge) || 0) : 0;
                const totalPrice = componentPrice + buildCharge;
                const hasDiscount = pc.discountedPrice != null && Number(pc.discountedPrice) < Number(pc.totalPrice);

                return (
                  <div key={pc.id} className="flex items-center space-x-4 border-b border-gray-200 dark:border-surface-700 pb-4">
                    {/* PC Info */}
                    <div className="flex-grow">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {pcName || 'Gaming PC'}
                        </h3>
                        {pc.tier && (
                          <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400 uppercase">
                            {pc.tier}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-neutral-400">
                        {hasDiscount ? (
                          <>
                            <span className="line-through mr-1">
                              {netToGross(Number(pc.totalPrice) + buildCharge, vatRate).toLocaleString('sv-SE', { maximumFractionDigits: 0 })} {pc.currency}
                            </span>
                            <span className="text-red-400 font-medium">
                              {netToGross(totalPrice, vatRate).toLocaleString('sv-SE', { maximumFractionDigits: 0 })} {pc.currency}
                            </span>
                          </>
                        ) : (
                          <>{netToGross(totalPrice, vatRate).toLocaleString('sv-SE', { maximumFractionDigits: 0 })} {pc.currency}</>
                        )}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-neutral-500 mt-0.5">
                        {language === 'en' ? 'Pre-Built PC' : 'Färdigbyggd dator'}
                      </p>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removePCFromCart(pc.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                );
              })}

              {/* Component Items */}
              {componentItems.map((item) => {
                const comp = item.component;
                const compName = language === 'en' ? comp.name_en : comp.name_sv;
                return (
                  <div key={comp.id} className="flex items-center space-x-4 border-b border-gray-200 dark:border-surface-700 pb-4">
                    <div className="flex-grow">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900 dark:text-white">{compName}</h3>
                        <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 uppercase">
                          {comp.manufacturer}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-neutral-400">
                        {netToGross(comp.price, vatRate).toLocaleString('sv-SE', { maximumFractionDigits: 0 })} {comp.currency}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-neutral-500 mt-0.5">
                        {language === 'en' ? 'PC Component' : 'Datorkomponent'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => decrementComponentQuantity(comp.id)}
                        className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded hover:bg-gray-100 text-gray-700 dark:border-surface-700 dark:hover:bg-surface-700 dark:text-neutral-300"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-gray-900 dark:text-white">{item.quantity}</span>
                      <button
                        onClick={() => incrementComponentQuantity(comp.id)}
                        className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded hover:bg-gray-100 text-gray-700 dark:border-surface-700 dark:hover:bg-surface-700 dark:text-neutral-300"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeComponentFromCart(comp.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {!isEmpty() && (
          <div className="border-t border-gray-200 dark:border-surface-700 p-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold text-gray-700 dark:text-neutral-300">
                {language === 'en' ? 'Total' : 'Totalt'}:
              </span>
              <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {formatTotal()}
              </span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full btn-primary"
            >
              {language === 'en' ? 'Proceed to Checkout' : 'Gå till kassan'}
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default ShoppingCart;
