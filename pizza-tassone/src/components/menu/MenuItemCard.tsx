'use client';

import { Plus, Settings2 } from 'lucide-react';
import Link from 'next/link';
import { MenuItem } from '@/types';
import { formatPrice } from '@/lib/formatters';
import { MenuTag } from '@/components/ui/Badge';
import { useCartStore } from '@/stores/cartStore';
import { useState } from 'react';

interface MenuItemCardProps {
  item: MenuItem;
}

export function MenuItemCard({ item }: MenuItemCardProps) {
  const { addItem } = useCartStore();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    if (item.category === 'pizza') {
      // Redirect to customizer for pizzas
      return;
    }
    addItem({
      menuItemId: item.id,
      name: item.name,
      selectedToppingIds: [],
      removedToppingIds: [],
      quantity: 1,
      unitPrice: item.basePrice,
      image: item.image,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div className="card card-hover group flex flex-col sm:flex-row gap-0 sm:gap-0 h-full sm:h-auto">
      {/* Image */}
      <div className="relative w-full sm:w-36 h-44 sm:h-auto flex-shrink-0 overflow-hidden bg-bg-tertiary rounded-t-2xl sm:rounded-l-2xl sm:rounded-tr-none">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {/* Tags overlay on mobile */}
        <div className="absolute top-2 left-2 flex flex-wrap gap-1 sm:hidden">
          {item.tags.slice(0, 2).map(tag => (
            <MenuTag key={tag} tag={tag} />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        {/* Tags — desktop */}
        <div className="hidden sm:flex flex-wrap gap-1 mb-2">
          {item.tags.slice(0, 3).map(tag => (
            <MenuTag key={tag} tag={tag} />
          ))}
        </div>

        <h3 className="font-bold text-text-warm mb-1.5">{item.name}</h3>
        <p className="text-text-muted text-sm line-clamp-2 flex-1 mb-3">{item.description}</p>

        <div className="flex items-center justify-between mt-auto">
          <div>
            <span className="text-brand-red font-bold text-lg">{formatPrice(item.basePrice)}</span>
            {item.category === 'pizza' && (
              <span className="text-text-faint text-xs ml-1">ab</span>
            )}
          </div>

          {item.category === 'pizza' ? (
            <div className="flex gap-2">
              <Link
                href={`/pizza/${item.slug}`}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-text-muted hover:text-brand-red border border-border hover:border-brand-red/40 rounded-full transition-all duration-200"
              >
                <Settings2 size={12} />
                Anpassen
              </Link>
              <button
                onClick={() => {
                  addItem({
                    menuItemId: item.id,
                    name: item.name,
                    size: 'klassik',
                    sizeName: 'Klassik 24cm',
                    selectedToppingIds: item.defaultToppingIds ?? [],
                    removedToppingIds: [],
                    quantity: 1,
                    unitPrice: item.basePrice,
                    image: item.image,
                  });
                  setAdded(true);
                  setTimeout(() => setAdded(false), 1200);
                }}
                className={`w-9 h-9 rounded-full flex items-center justify-center text-white transition-all duration-200 ${
                  added ? 'bg-green-500' : 'bg-brand-red hover:bg-brand-red-dark hover:shadow-glow-red'
                }`}
                aria-label={`${item.name} hinzufügen`}
              >
                <Plus size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAdd}
              className={`w-9 h-9 rounded-full flex items-center justify-center text-white transition-all duration-200 ${
                added ? 'bg-green-500' : 'bg-brand-red hover:bg-brand-red-dark hover:shadow-glow-red'
              }`}
              aria-label={`${item.name} hinzufügen`}
            >
              <Plus size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
