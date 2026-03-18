'use client';

import Link from 'next/link';
import { ArrowRight, Plus } from 'lucide-react';
import { MenuItem } from '@/types';
import { formatPrice } from '@/lib/formatters';
import { MenuTag } from '@/components/ui/Badge';
import { useCartStore } from '@/stores/cartStore';

interface FeaturedPizzasProps {
  pizzas: MenuItem[];
}

export function FeaturedPizzas({ pizzas }: FeaturedPizzasProps) {
  const { addItem } = useCartStore();

  const handleQuickAdd = (pizza: MenuItem) => {
    addItem({
      menuItemId: pizza.id,
      name: pizza.name,
      size: 'klassik',
      sizeName: 'Klassik 24cm',
      selectedToppingIds: pizza.defaultToppingIds ?? [],
      removedToppingIds: [],
      quantity: 1,
      unitPrice: pizza.basePrice,
      image: pizza.image,
    });
  };

  return (
    <section className="py-20 bg-bg-primary">
      <div className="container-wide">
        {/* Section header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-brand-red text-sm font-semibold tracking-wide uppercase mb-2">Beliebt</p>
            <h2 className="section-heading">Unsere Favoriten</h2>
          </div>
          <Link href="/menu" className="hidden sm:flex items-center gap-2 text-text-muted hover:text-brand-red text-sm font-medium transition-colors">
            Alle ansehen <ArrowRight size={14} />
          </Link>
        </div>

        {/* Cards — horizontal scroll on mobile, grid on desktop */}
        <div className="flex gap-5 overflow-x-auto no-scrollbar pb-3 lg:grid lg:grid-cols-3 lg:overflow-visible">
          {pizzas.map((pizza) => (
            <div
              key={pizza.id}
              className="flex-shrink-0 w-72 lg:w-auto card card-hover group"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden bg-bg-tertiary">
                <img
                  src={pizza.image}
                  alt={pizza.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                {/* Tags overlay */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                  {pizza.tags.slice(0, 2).map(tag => (
                    <MenuTag key={tag} tag={tag} />
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-bold text-text-warm text-lg mb-1">{pizza.name}</h3>
                <p className="text-text-muted text-sm line-clamp-2 mb-4">{pizza.description}</p>

                <div className="flex items-center justify-between">
                  <span className="text-brand-red font-bold text-lg">
                    {formatPrice(pizza.basePrice)}
                  </span>
                  <div className="flex gap-2">
                    <Link
                      href={`/pizza/${pizza.slug}`}
                      className="px-3 py-2 text-xs font-semibold text-text-muted hover:text-text-warm border border-border hover:border-border-bright rounded-full transition-colors"
                    >
                      Anpassen
                    </Link>
                    <button
                      onClick={() => handleQuickAdd(pizza)}
                      className="w-9 h-9 bg-brand-red hover:bg-brand-red-dark text-white rounded-full flex items-center justify-center transition-colors hover:shadow-glow-red"
                      aria-label={`${pizza.name} hinzufügen`}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-8 sm:hidden">
          <Link href="/menu" className="btn-secondary text-sm">
            Alle Pizzen ansehen <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
