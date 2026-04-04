'use client';

import { useState, useEffect, useRef } from 'react';
import { MENU_ITEMS, CATEGORY_LABELS, CATEGORY_ORDER } from '@/data/menu';
import { MenuItemCard } from '@/components/menu/MenuItemCard';
import { cn } from '@/lib/cn';
import type { MenuCategory } from '@/types';

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState<MenuCategory>('pizza');
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  // IntersectionObserver to highlight active section
  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    CATEGORY_ORDER.forEach(cat => {
      const el = sectionRefs.current[cat];
      if (!el) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveCategory(cat);
        },
        { rootMargin: '-20% 0px -60% 0px' }
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach(o => o.disconnect());
  }, []);

  const scrollToSection = (cat: MenuCategory) => {
    sectionRefs.current[cat]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen">
      {/* Hero banner */}
      <div className="relative h-48 bg-bg-warm overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=1400&q=80"
          alt="Speisekarte"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-bg-primary via-bg-warm to-transparent" />
        <div className="absolute inset-0 flex items-center">
          <div className="container-wide">
            <p className="text-brand-red text-sm font-semibold tracking-wide uppercase mb-1">Tassone</p>
            <h1 className="font-display text-4xl font-bold text-text-warm">Speisekarte</h1>
          </div>
        </div>
      </div>

      {/* Sticky category nav */}
      <div className="sticky top-[64px] lg:top-[80px] z-40 bg-bg-secondary/95 glass border-b border-border">
        <div className="container-wide">
          <nav className="flex gap-1 overflow-x-auto no-scrollbar py-3">
            {CATEGORY_ORDER.map(cat => (
              <button
                key={cat}
                onClick={() => scrollToSection(cat)}
                className={cn(
                  'flex-shrink-0 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200',
                  activeCategory === cat
                    ? 'bg-brand-red text-white shadow-glow-red'
                    : 'text-text-muted hover:text-text-warm hover:bg-bg-tertiary'
                )}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Menu sections */}
      <div className="container-wide py-10 space-y-16">
        {CATEGORY_ORDER.map(cat => {
          const items = MENU_ITEMS.filter(i => i.category === cat && i.isAvailable);

          return (
            <section
              key={cat}
              id={cat}
              ref={el => { sectionRefs.current[cat] = el; }}
            >
              <div className="flex items-center gap-4 mb-8">
                <h2 className="font-display text-3xl font-bold text-text-warm">
                  {CATEGORY_LABELS[cat]}
                </h2>
                <span className="text-text-faint text-sm">{items.length} Gerichte</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {items.map(item => (
                  <MenuItemCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
