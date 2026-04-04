'use client';

import Link from 'next/link';
import { ShoppingBag, MapPin, Menu, X, ChevronDown } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { useStoreSelectionStore } from '@/stores/storeSelectionStore';
import { formatPrice } from '@/lib/formatters';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/cn';

export function Header() {
  const { itemCount, subtotal, openDrawer } = useCartStore();
  const { selectedStore, postalCode, openModal } = useStoreSelectionStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const count = itemCount();
  const total = subtotal();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled
            ? 'bg-bg-primary/95 glass border-b border-border shadow-card'
            : 'bg-transparent'
        )}
      >
        <div className="container-wide">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group" onClick={() => setMobileOpen(false)}>
              <div className="w-9 h-9 bg-brand-red rounded-xl flex items-center justify-center shadow-glow-red group-hover:scale-105 transition-transform">
                <span className="text-white font-display font-bold text-lg">T</span>
              </div>
              <span className="font-display font-bold text-xl text-text-warm hidden sm:block">
                Tassone
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              <Link href="/menu" className="btn-ghost text-sm font-medium">Speisekarte</Link>
              <Link href="/stores" className="btn-ghost text-sm font-medium">Filialen</Link>
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              {/* Store selector */}
              <button
                onClick={openModal}
                className={cn(
                  'hidden sm:flex items-center gap-2 px-3 py-2 rounded-full border text-sm font-medium transition-all duration-200',
                  selectedStore
                    ? 'border-brand-red/30 bg-brand-red/5 text-text-warm hover:border-brand-red/60'
                    : 'border-border bg-bg-tertiary text-text-muted hover:border-border-bright hover:text-text-warm'
                )}
              >
                <MapPin size={14} className={selectedStore ? 'text-brand-red' : 'text-text-faint'} />
                <span className="max-w-[140px] truncate">
                  {selectedStore ? selectedStore.city : 'Standort wählen'}
                </span>
                {postalCode && <span className="text-text-faint">{postalCode}</span>}
                <ChevronDown size={12} className="text-text-faint" />
              </button>

              {/* Cart button */}
              <button
                onClick={openDrawer}
                className="relative flex items-center gap-2 px-3 py-2 bg-brand-red hover:bg-brand-red-dark text-white rounded-full font-semibold text-sm transition-all duration-200 hover:shadow-glow-red"
                aria-label={`Warenkorb, ${count} Artikel`}
              >
                <ShoppingBag size={16} />
                {count > 0 ? (
                  <>
                    <span className="hidden sm:block">{formatPrice(total)}</span>
                    <span
                      key={count}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white text-brand-red text-xs font-bold rounded-full flex items-center justify-center animate-bounce-scale"
                    >
                      {count}
                    </span>
                  </>
                ) : (
                  <span className="hidden sm:block">Warenkorb</span>
                )}
              </button>

              {/* Mobile menu toggle */}
              <button
                className="lg:hidden btn-ghost p-2"
                onClick={() => setMobileOpen(v => !v)}
                aria-label="Menü"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile nav drawer */}
        {mobileOpen && (
          <div className="lg:hidden bg-bg-secondary border-t border-border py-4">
            <div className="container-wide flex flex-col gap-1">
              <Link href="/menu"   className="py-3 px-4 text-text-warm hover:bg-bg-tertiary rounded-xl transition-colors" onClick={() => setMobileOpen(false)}>Speisekarte</Link>
              <Link href="/stores" className="py-3 px-4 text-text-warm hover:bg-bg-tertiary rounded-xl transition-colors" onClick={() => setMobileOpen(false)}>Filialen</Link>
              <button
                onClick={() => { openModal(); setMobileOpen(false); }}
                className="flex items-center gap-2 py-3 px-4 text-text-warm hover:bg-bg-tertiary rounded-xl transition-colors text-left"
              >
                <MapPin size={16} className="text-brand-red" />
                {selectedStore ? `Filiale: ${selectedStore.city}` : 'Standort wählen'}
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Spacer for fixed header */}
      <div className="h-16 lg:h-20" />
    </>
  );
}
