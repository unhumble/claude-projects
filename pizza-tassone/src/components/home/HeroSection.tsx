'use client';

import Link from 'next/link';
import { ArrowRight, MapPin, Star } from 'lucide-react';
import { useStoreSelectionStore } from '@/stores/storeSelectionStore';
import { useState } from 'react';

export function HeroSection() {
  const { searchByPostalCode, isSearching, openModal } = useStoreSelectionStore();
  const [plzInput, setPlzInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (plzInput.trim().length === 5) {
      searchByPostalCode(plzInput.trim());
    } else {
      openModal();
    }
  };

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-bg-warm">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1600&q=80"
          alt="Pizza frisch aus dem Ofen"
          className="w-full h-full object-cover opacity-25"
        />
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-bg-primary via-bg-warm/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="container-wide relative z-10 py-20 lg:py-32">
        <div className="max-w-2xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-red/10 border border-brand-red/20 text-brand-red text-sm font-medium mb-6">
            <Star size={14} fill="currentColor" />
            Seit 1993 am Bodensee
          </div>

          {/* Headline */}
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-text-warm leading-tight mb-6">
            Pizza.{' '}
            <span className="text-brand-red">Frisch.</span>
            <br />
            Direkt zu dir.
          </h1>

          <p className="text-text-muted text-lg sm:text-xl leading-relaxed mb-10 max-w-lg">
            Hausgemachter Teig, frische Zutaten, mit Liebe gebacken. Dein Lieferservice in der gesamten Bodenseeregion.
          </p>

          {/* PLZ form */}
          <form onSubmit={handleSubmit} className="flex gap-3 flex-col sm:flex-row max-w-md mb-8">
            <div className="relative flex-1">
              <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-red" />
              <input
                type="text"
                value={plzInput}
                onChange={e => setPlzInput(e.target.value.replace(/\D/g, '').slice(0, 5))}
                placeholder="Deine Postleitzahl"
                className="input-field pl-10 w-full"
                inputMode="numeric"
                maxLength={5}
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="btn-primary whitespace-nowrap"
            >
              {isSearching ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>Jetzt bestellen <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          {/* Quick links */}
          <div className="flex items-center gap-4 flex-wrap">
            <Link href="/menu" className="text-text-muted hover:text-text-warm text-sm font-medium transition-colors flex items-center gap-1.5">
              <ArrowRight size={13} />
              Speisekarte ansehen
            </Link>
            <Link href="/stores" className="text-text-muted hover:text-text-warm text-sm font-medium transition-colors flex items-center gap-1.5">
              <MapPin size={13} />
              Alle Filialen
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <div className="w-6 h-10 border-2 border-border rounded-full flex items-start justify-center p-1.5">
          <div className="w-1 h-2.5 bg-brand-red rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
}
