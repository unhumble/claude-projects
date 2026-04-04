'use client';

import { use, useState } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { getMenuItemBySlug } from '@/data/menu';
import { PIZZA_SIZES } from '@/data/menu';
import { TOPPINGS, getToppingsByCategory } from '@/data/toppings';
import { useCartStore } from '@/stores/cartStore';
import { calculatePizzaPrice } from '@/lib/pricing';
import { formatPrice } from '@/lib/formatters';
import { Button } from '@/components/ui/Button';
import { QuantityControl } from '@/components/ui/QuantityControl';
import { ArrowLeft, Check, Plus } from 'lucide-react';
import type { PizzaSize, Topping } from '@/types';
import { cn } from '@/lib/cn';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function PizzaCustomizerPage({ params }: PageProps) {
  const { slug } = use(params);
  const pizza = getMenuItemBySlug(slug);
  if (!pizza || pizza.category !== 'pizza') notFound();

  const router = useRouter();
  const { addItem } = useCartStore();

  const [selectedSize, setSelectedSize] = useState<PizzaSize>('medium');
  const [selectedToppings, setSelectedToppings] = useState<string[]>(pizza.defaultToppingIds ?? []);
  const [quantity, setQuantity] = useState(1);

  const defaultIds = pizza.defaultToppingIds ?? [];
  const extraToppings = TOPPINGS.filter(t => selectedToppings.includes(t.id) && !defaultIds.includes(t.id));
  const removedDefaults = defaultIds.filter(id => !selectedToppings.includes(id));

  const unitPrice = calculatePizzaPrice(pizza.basePrice, selectedSize, selectedToppings, defaultIds);
  const totalPrice = unitPrice * quantity;

  const toggleTopping = (id: string) => {
    setSelectedToppings(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const handleAddToCart = () => {
    const sizeInfo = PIZZA_SIZES.find(s => s.id === selectedSize);
    addItem({
      menuItemId: pizza.id,
      name: pizza.name,
      size: selectedSize,
      sizeName: sizeInfo ? `${sizeInfo.label} ${sizeInfo.diameter}` : selectedSize,
      selectedToppingIds: selectedToppings,
      removedToppingIds: removedDefaults,
      quantity,
      unitPrice,
      image: pizza.image,
    });
    router.push('/menu');
  };

  const toppingCategories: { label: string; id: Topping['category'] }[] = [
    { label: 'Saucen', id: 'sauce' },
    { label: 'Käse', id: 'cheese' },
    { label: 'Fleisch', id: 'meat' },
    { label: 'Gemüse', id: 'vegetable' },
    { label: 'Extras', id: 'extra' },
  ];

  return (
    <div className="min-h-screen">
      <div className="container-wide py-8">
        {/* Back button */}
        <Link href="/menu" className="inline-flex items-center gap-2 text-text-muted hover:text-text-warm text-sm mb-8 transition-colors">
          <ArrowLeft size={16} />
          Zurück zur Speisekarte
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Left: Pizza image + toppings */}
          <div className="lg:col-span-3 space-y-8">
            {/* Pizza header */}
            <div className="flex gap-6">
              <div className="w-32 h-32 rounded-2xl overflow-hidden flex-shrink-0 bg-bg-tertiary">
                <img src={pizza.image} alt={pizza.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <h1 className="font-display text-3xl font-bold text-text-warm mb-2">{pizza.name}</h1>
                <p className="text-text-muted leading-relaxed">{pizza.description}</p>
                <p className="text-brand-red font-bold text-xl mt-2">{formatPrice(pizza.basePrice)} <span className="text-text-faint text-sm font-normal">ab (Klassik)</span></p>
              </div>
            </div>

            {/* Size selector */}
            <div>
              <h2 className="font-semibold text-text-warm mb-4 flex items-center gap-2">
                Größe wählen
                <span className="text-text-faint text-sm font-normal">– inklusive im Preis</span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {PIZZA_SIZES.map(size => {
                  const price = calculatePizzaPrice(pizza.basePrice, size.id, selectedToppings, defaultIds);
                  return (
                    <button
                      key={size.id}
                      onClick={() => setSelectedSize(size.id)}
                      className={cn(
                        'relative p-4 rounded-2xl border-2 text-center transition-all duration-200',
                        selectedSize === size.id
                          ? 'border-brand-red bg-brand-red/5 shadow-glow-red'
                          : 'border-border bg-bg-card hover:border-border-bright'
                      )}
                    >
                      {selectedSize === size.id && (
                        <div className="absolute top-2 right-2 w-4 h-4 bg-brand-red rounded-full flex items-center justify-center">
                          <Check size={10} className="text-white" />
                        </div>
                      )}
                      {/* Pizza size visual */}
                      <div className="mx-auto mb-2 flex items-center justify-center" style={{ height: '48px' }}>
                        <div
                          className={cn(
                            'rounded-full bg-brand-orange/20 border-2 border-brand-orange/40',
                            size.id === 'klassik' && 'w-7 h-7',
                            size.id === 'medium'  && 'w-9 h-9',
                            size.id === 'jumbo'   && 'w-11 h-11',
                            size.id === 'familie' && 'w-12 h-10 rounded-lg',
                          )}
                        />
                      </div>
                      <p className="font-bold text-text-warm text-sm">{size.label}</p>
                      <p className="text-text-faint text-xs">{size.diameter}</p>
                      <p className="text-text-muted text-xs mt-0.5">{size.serves}</p>
                      <p className="text-brand-red font-semibold text-sm mt-2">{formatPrice(price)}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Toppings */}
            <div>
              <h2 className="font-semibold text-text-warm mb-4">
                Belag anpassen
                <span className="text-text-faint text-sm font-normal ml-2">– Extras werden berechnet</span>
              </h2>

              {toppingCategories.map(({ label, id }) => {
                const toppings = getToppingsByCategory(id);
                return (
                  <div key={id} className="mb-5">
                    <p className="text-text-muted text-xs font-semibold uppercase tracking-wide mb-2.5">{label}</p>
                    <div className="flex flex-wrap gap-2">
                      {toppings.map(topping => {
                        const isSelected = selectedToppings.includes(topping.id);
                        const isDefault = defaultIds.includes(topping.id);
                        return (
                          <button
                            key={topping.id}
                            onClick={() => toggleTopping(topping.id)}
                            className={cn(
                              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-200',
                              isSelected
                                ? isDefault
                                  ? 'bg-brand-orange/10 border-brand-orange/30 text-brand-orange'
                                  : 'bg-brand-red/10 border-brand-red/30 text-brand-red'
                                : 'bg-bg-tertiary border-border text-text-muted hover:border-border-bright hover:text-text-warm'
                            )}
                          >
                            <span>{topping.emoji}</span>
                            <span>{topping.name}</span>
                            {!isDefault && topping.priceExtra > 0 && (
                              <span className="text-xs opacity-70">+{formatPrice(topping.priceExtra)}</span>
                            )}
                            {isSelected ? (
                              <Check size={12} />
                            ) : (
                              <Plus size={12} />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Summary sidebar */}
          <div className="lg:col-span-2">
            <div className="sticky top-28 space-y-5">
              <div className="card p-5 space-y-4">
                <h3 className="font-semibold text-text-warm text-lg">Zusammenfassung</h3>

                {/* Selected config */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Größe</span>
                    <span className="text-text-warm font-medium">
                      {PIZZA_SIZES.find(s => s.id === selectedSize)?.label}
                      {' '}({PIZZA_SIZES.find(s => s.id === selectedSize)?.diameter})
                    </span>
                  </div>

                  {/* Default toppings */}
                  <div className="flex flex-col gap-1">
                    <span className="text-text-muted">Standard-Belag</span>
                    <div className="flex flex-wrap gap-1 ml-2">
                      {defaultIds.map(id => {
                        const t = TOPPINGS.find(t => t.id === id);
                        const removed = !selectedToppings.includes(id);
                        return t ? (
                          <span key={id} className={cn('text-xs px-2 py-0.5 rounded-full', removed ? 'line-through text-text-faint bg-bg-tertiary' : 'text-text-muted bg-bg-tertiary')}>
                            {t.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>

                  {/* Extra toppings */}
                  {extraToppings.length > 0 && (
                    <div className="flex flex-col gap-1">
                      <span className="text-text-muted">Extras</span>
                      {extraToppings.map(t => (
                        <div key={t.id} className="flex justify-between ml-2">
                          <span className="text-text-warm text-xs">{t.emoji} {t.name}</span>
                          <span className="text-brand-orange text-xs">+{formatPrice(t.priceExtra)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="border-t border-border pt-3 flex justify-between font-bold">
                    <span className="text-text-muted">Stückpreis</span>
                    <span className="text-brand-red text-lg">{formatPrice(unitPrice)}</span>
                  </div>
                </div>

                {/* Quantity */}
                <div className="flex items-center justify-between">
                  <span className="text-text-muted text-sm">Anzahl</span>
                  <QuantityControl value={quantity} onChange={setQuantity} />
                </div>

                {/* Total */}
                {quantity > 1 && (
                  <div className="flex justify-between font-bold border-t border-border pt-3">
                    <span className="text-text-muted">Gesamt</span>
                    <span className="text-brand-red text-xl">{formatPrice(totalPrice)}</span>
                  </div>
                )}

                <Button className="w-full" size="lg" onClick={handleAddToCart}>
                  In den Warenkorb – {formatPrice(totalPrice)}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
