'use client';

import { useCartStore } from '@/stores/cartStore';
import { useStoreSelectionStore } from '@/stores/storeSelectionStore';
import { formatPrice } from '@/lib/formatters';
import { QuantityControl } from '@/components/ui/QuantityControl';
import { Trash2, ShoppingBag, ArrowRight, MapPin } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, itemCount, clearCart } = useCartStore();
  const { selectedStore, deliveryFee, setDeliveryFee, openModal } = useStoreSelectionStore();
  const count = itemCount();
  const sub = subtotal();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setDeliveryFee(sub); }, [sub]);

  const total = sub + deliveryFee;

  if (count === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center py-20 px-4">
          <div className="w-24 h-24 bg-bg-tertiary rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag size={40} className="text-text-faint" />
          </div>
          <h1 className="font-display text-3xl font-bold text-text-warm mb-3">Warenkorb ist leer</h1>
          <p className="text-text-muted mb-8">Füge leckere Pizzen aus unserer Speisekarte hinzu</p>
          <Link href="/menu" className="btn-primary">
            Zur Speisekarte
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container-wide py-10">
        <h1 className="font-display text-4xl font-bold text-text-warm mb-8">
          Warenkorb
          <span className="text-text-muted text-xl font-normal ml-3">({count} Artikel)</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(item => (
              <div key={item.id} className="card p-4 flex gap-4">
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-bg-tertiary flex-shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-text-warm">{item.name}</h3>
                  {item.sizeName && <p className="text-text-muted text-sm">{item.sizeName}</p>}
                  <div className="flex items-center justify-between mt-3">
                    <QuantityControl value={item.quantity} onChange={q => updateQuantity(item.id, q)} min={0} />
                    <span className="font-bold text-brand-red">{formatPrice(item.unitPrice * item.quantity)}</span>
                  </div>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="self-start w-8 h-8 rounded-lg bg-bg-tertiary hover:bg-red-900/30 text-text-faint hover:text-red-400 flex items-center justify-center transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}

            <button
              onClick={clearCart}
              className="text-text-faint hover:text-red-400 text-sm flex items-center gap-2 transition-colors"
            >
              <Trash2 size={14} />
              Warenkorb leeren
            </button>
          </div>

          {/* Summary */}
          <div className="space-y-4">
            {/* Store info */}
            <div className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-text-warm text-sm">Lieferfiliale</h3>
                <button onClick={openModal} className="text-brand-red text-xs hover:underline">Ändern</button>
              </div>
              {selectedStore ? (
                <div className="flex items-start gap-2">
                  <MapPin size={14} className="text-brand-red mt-0.5 shrink-0" />
                  <div>
                    <p className="text-text-warm text-sm font-medium">{selectedStore.name}</p>
                    <p className="text-text-muted text-xs">{selectedStore.address}, {selectedStore.city}</p>
                  </div>
                </div>
              ) : (
                <button
                  onClick={openModal}
                  className="w-full py-2.5 border-2 border-dashed border-brand-red/30 hover:border-brand-red/60 rounded-xl text-brand-red text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <MapPin size={14} />
                  Standort auswählen
                </button>
              )}
            </div>

            {/* Price summary */}
            <div className="card p-5 space-y-3">
              <h3 className="font-semibold text-text-warm">Bestellübersicht</h3>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-text-muted">
                  <span>Zwischensumme ({count} Artikel)</span>
                  <span className="text-text-warm">{formatPrice(sub)}</span>
                </div>
                <div className="flex justify-between text-text-muted">
                  <span>Liefergebühr</span>
                  <span className={deliveryFee === 0 ? 'text-green-400' : 'text-text-warm'}>
                    {deliveryFee === 0 ? 'Kostenlos' : formatPrice(deliveryFee)}
                  </span>
                </div>
                {deliveryFee > 0 && (
                  <p className="text-text-faint text-xs">
                    Kostenlose Lieferung ab {formatPrice(2500)}
                  </p>
                )}
              </div>

              <div className="border-t border-border pt-3 flex justify-between font-bold text-lg">
                <span className="text-text-warm">Gesamtbetrag</span>
                <span className="text-brand-red">{formatPrice(total)}</span>
              </div>

              <Link
                href="/checkout"
                className="flex items-center justify-center gap-2 w-full py-4 bg-brand-red hover:bg-brand-red-dark text-white font-bold rounded-full transition-all duration-200 hover:shadow-glow-red"
              >
                Zur Kasse
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
