'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/stores/cartStore';
import { useStoreSelectionStore } from '@/stores/storeSelectionStore';
import { useOrderStore } from '@/stores/orderStore';
import { formatPrice } from '@/lib/formatters';
import { Button } from '@/components/ui/Button';
import { MapPin, ShoppingBag, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCartStore();
  const { selectedStore, postalCode, deliveryFee, openModal } = useStoreSelectionStore();
  const { placeOrder } = useOrderStore();

  const [address, setAddress] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [isPlacing, setIsPlacing] = useState(false);

  const sub = subtotal();
  const total = sub + deliveryFee;

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center py-20">
          <ShoppingBag size={48} className="text-text-faint mx-auto mb-4" />
          <h1 className="font-display text-2xl font-bold text-text-warm mb-3">Keine Artikel im Warenkorb</h1>
          <Link href="/menu" className="btn-primary mt-4 inline-flex">Zur Speisekarte</Link>
        </div>
      </div>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStore) {
      openModal();
      return;
    }

    setIsPlacing(true);

    // Simulate brief processing
    await new Promise(r => setTimeout(r, 800));

    const orderId = placeOrder({
      items,
      storeId: selectedStore.id,
      storeName: selectedStore.name,
      subtotal: sub,
      deliveryFee,
      postalCode,
      distanceKm: 5, // Default estimate; real would come from storeMatchingResult
    });

    clearCart();
    router.push(`/order/${orderId}`);
  };

  return (
    <div className="min-h-screen">
      <div className="container-wide py-10">
        <h1 className="font-display text-4xl font-bold text-text-warm mb-8">Kasse</h1>

        <form onSubmit={handlePlaceOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Delivery details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Store selection */}
              <div className="card p-5">
                <h2 className="font-semibold text-text-warm mb-4">Lieferfiliale</h2>
                {selectedStore ? (
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-brand-red/10 rounded-xl flex items-center justify-center">
                        <MapPin size={16} className="text-brand-red" />
                      </div>
                      <div>
                        <p className="font-medium text-text-warm">{selectedStore.name}</p>
                        <p className="text-text-muted text-sm">{selectedStore.address}, {selectedStore.postalCode} {selectedStore.city}</p>
                        <p className="text-text-muted text-sm">{selectedStore.phone}</p>
                      </div>
                    </div>
                    <button type="button" onClick={openModal} className="text-brand-red text-sm hover:underline">Ändern</button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={openModal}
                    className="w-full py-4 border-2 border-dashed border-brand-red/40 hover:border-brand-red rounded-xl text-brand-red font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <MapPin size={16} />
                    Filiale auswählen (Pflicht)
                  </button>
                )}
              </div>

              {/* Delivery address */}
              <div className="card p-5 space-y-4">
                <h2 className="font-semibold text-text-warm">Lieferadresse</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-text-muted text-sm mb-1.5 block">Dein Name *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Vor- und Nachname"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="text-text-muted text-sm mb-1.5 block">Telefonnummer *</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+49 7731 ..."
                      className="input-field"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-text-muted text-sm mb-1.5 block">Straße und Hausnummer *</label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="z. B. Hauptstraße 12"
                    className="input-field"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-text-muted text-sm mb-1.5 block">Postleitzahl</label>
                    <input
                      type="text"
                      value={postalCode}
                      readOnly
                      className="input-field opacity-60 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="text-text-muted text-sm mb-1.5 block">Stadt</label>
                    <input
                      type="text"
                      value={selectedStore?.city ?? ''}
                      readOnly
                      className="input-field opacity-60 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-text-muted text-sm mb-1.5 block">Anmerkungen (optional)</label>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="z. B. 3. Etage links, Klingelname …"
                    rows={3}
                    className="input-field resize-none"
                  />
                </div>
              </div>

              {/* Payment */}
              <div className="card p-5">
                <h2 className="font-semibold text-text-warm mb-4">Zahlung</h2>
                <div className="flex items-center gap-3 p-4 bg-bg-tertiary rounded-xl border border-border">
                  <div className="w-10 h-10 bg-bg-card rounded-lg flex items-center justify-center">
                    <span className="text-xl">💵</span>
                  </div>
                  <div>
                    <p className="font-medium text-text-warm">Barzahlung bei Lieferung</p>
                    <p className="text-text-muted text-sm">Bezahle wenn dein Fahrer ankommt</p>
                  </div>
                  <div className="ml-auto w-5 h-5 bg-brand-red rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle size={12} className="text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Order summary */}
            <div className="space-y-4">
              <div className="card p-5 space-y-4">
                <h2 className="font-semibold text-text-warm">Bestellübersicht</h2>

                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {items.map(item => (
                    <div key={item.id} className="flex items-center gap-3">
                      <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover bg-bg-tertiary" />
                      <div className="flex-1 min-w-0">
                        <p className="text-text-warm text-sm font-medium truncate">{item.name}</p>
                        {item.sizeName && <p className="text-text-faint text-xs">{item.sizeName}</p>}
                        <p className="text-text-muted text-xs">× {item.quantity}</p>
                      </div>
                      <span className="text-text-warm text-sm font-bold flex-shrink-0">
                        {formatPrice(item.unitPrice * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border pt-4 space-y-2 text-sm">
                  <div className="flex justify-between text-text-muted">
                    <span>Zwischensumme</span>
                    <span>{formatPrice(sub)}</span>
                  </div>
                  <div className="flex justify-between text-text-muted">
                    <span>Liefergebühr</span>
                    <span className={deliveryFee === 0 ? 'text-green-400' : ''}>
                      {deliveryFee === 0 ? 'Kostenlos' : formatPrice(deliveryFee)}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
                    <span className="text-text-warm">Gesamt</span>
                    <span className="text-brand-red">{formatPrice(total)}</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  loading={isPlacing}
                  disabled={!selectedStore}
                >
                  {isPlacing ? 'Bestellung aufgeben…' : `Jetzt bestellen – ${formatPrice(total)}`}
                </Button>

                {!selectedStore && (
                  <p className="text-brand-orange text-xs text-center">
                    Bitte wähle zuerst eine Filiale aus
                  </p>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
