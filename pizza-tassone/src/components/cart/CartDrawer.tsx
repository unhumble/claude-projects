'use client';

import { X, ShoppingBag, ArrowRight, Trash2 } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { useStoreSelectionStore } from '@/stores/storeSelectionStore';
import { formatPrice } from '@/lib/formatters';
import { QuantityControl } from '@/components/ui/QuantityControl';
import Link from 'next/link';
import { useEffect } from 'react';

export function CartDrawer() {
  const { items, isDrawerOpen, closeDrawer, removeItem, updateQuantity, subtotal, itemCount } = useCartStore();
  const { selectedStore, deliveryFee, setDeliveryFee } = useStoreSelectionStore();
  const count = itemCount();
  const sub = subtotal();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setDeliveryFee(sub); }, [sub]);

  const total = sub + deliveryFee;

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = isDrawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isDrawerOpen]);

  return (
    <>
      {/* Backdrop */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/60 glass z-50 animate-fade-in"
          onClick={closeDrawer}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-bg-secondary border-l border-border flex flex-col transition-transform duration-300 ease-out ${
          isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Warenkorb"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <ShoppingBag size={20} className="text-brand-red" />
            <h2 className="font-semibold text-text-warm text-lg">
              Warenkorb
              {count > 0 && <span className="ml-2 text-text-muted text-sm font-normal">({count} Artikel)</span>}
            </h2>
          </div>
          <button
            onClick={closeDrawer}
            className="w-9 h-9 rounded-full bg-bg-tertiary hover:bg-border flex items-center justify-center text-text-muted hover:text-text-warm transition-colors"
            aria-label="Schließen"
          >
            <X size={16} />
          </button>
        </div>

        {/* Store info */}
        {selectedStore && (
          <div className="px-5 py-3 border-b border-border bg-brand-red/5">
            <p className="text-xs text-text-muted">
              Lieferung durch{' '}
              <span className="text-brand-red font-medium">{selectedStore.name}</span>
            </p>
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16 gap-4">
              <div className="w-20 h-20 bg-bg-tertiary rounded-full flex items-center justify-center">
                <ShoppingBag size={32} className="text-text-faint" />
              </div>
              <div>
                <p className="text-text-warm font-semibold mb-1">Noch nichts im Warenkorb</p>
                <p className="text-text-muted text-sm">Entdecke unsere Speisekarte und bestelle deine Lieblingspizza</p>
              </div>
              <Link href="/menu" onClick={closeDrawer} className="btn-primary mt-2">
                Zur Speisekarte
              </Link>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} className="flex gap-3 bg-bg-card rounded-xl p-3 border border-border">
                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-bg-tertiary">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-text-warm text-sm truncate">{item.name}</p>
                  {item.sizeName && (
                    <p className="text-text-muted text-xs">{item.sizeName}</p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <QuantityControl
                      value={item.quantity}
                      onChange={(q) => updateQuantity(item.id, q)}
                      min={0}
                      size="sm"
                    />
                    <span className="text-brand-red font-bold text-sm">
                      {formatPrice(item.unitPrice * item.quantity)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="self-start w-7 h-7 rounded-lg bg-bg-tertiary hover:bg-red-900/40 text-text-faint hover:text-red-400 flex items-center justify-center transition-colors flex-shrink-0"
                  aria-label="Entfernen"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-border p-5 space-y-3">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-text-muted">
                <span>Zwischensumme</span>
                <span className="text-text-warm">{formatPrice(sub)}</span>
              </div>
              <div className="flex justify-between text-text-muted">
                <span>Lieferung</span>
                <span className={deliveryFee === 0 ? 'text-green-400' : 'text-text-warm'}>
                  {deliveryFee === 0 ? 'Kostenlos' : formatPrice(deliveryFee)}
                </span>
              </div>
              <div className="flex justify-between font-bold text-base pt-2 border-t border-border text-text-warm">
                <span>Gesamt</span>
                <span className="text-brand-red">{formatPrice(total)}</span>
              </div>
            </div>
            <Link
              href="/checkout"
              onClick={closeDrawer}
              className="flex items-center justify-center gap-2 w-full py-3.5 bg-brand-red hover:bg-brand-red-dark text-white font-bold rounded-full transition-all duration-200 hover:shadow-glow-red"
            >
              Zur Kasse
              <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
