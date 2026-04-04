'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { STORES, isStoreOpen } from '@/data/stores';
import { MapPin, Phone, Clock } from 'lucide-react';
import { DAY_NAMES_DE } from '@/lib/formatters';
import type { StoreLocation } from '@/types';

const StoreMap = dynamic(
  () => import('@/components/map/StoreMap').then(m => m.StoreMap),
  { ssr: false, loading: () => <div className="h-[500px] bg-bg-tertiary rounded-2xl animate-pulse" /> }
);

export default function StoresPage() {
  const [selectedStore, setSelectedStore] = useState<StoreLocation | null>(null);
  const activeStores = STORES.filter(s => s.isActive);

  return (
    <div className="min-h-screen">
      {/* Banner */}
      <div className="relative h-48 bg-bg-warm overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1400&q=80"
          alt="Unsere Filialen"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-bg-primary via-bg-warm to-transparent" />
        <div className="absolute inset-0 flex items-center">
          <div className="container-wide">
            <p className="text-brand-red text-sm font-semibold tracking-wide uppercase mb-1">Bodenseeregion</p>
            <h1 className="font-display text-4xl font-bold text-text-warm">Unsere Filialen</h1>
            <p className="text-text-muted mt-1">{activeStores.length} Standorte in der Region</p>
          </div>
        </div>
      </div>

      <div className="container-wide py-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Store list */}
          <div className="lg:col-span-2 space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {activeStores.map(store => {
              const open = isStoreOpen(store);
              const isSelected = selectedStore?.id === store.id;
              return (
                <button
                  key={store.id}
                  onClick={() => setSelectedStore(store)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 ${
                    isSelected
                      ? 'border-brand-red bg-brand-red/5 shadow-glow-red'
                      : 'border-border bg-bg-card hover:border-border-bright'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-brand-red shrink-0 mt-0.5" />
                      <span className="font-bold text-text-warm">{store.city}</span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1.5 ${
                      open
                        ? 'bg-green-500/10 text-green-400'
                        : 'bg-red-500/10 text-red-400'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${open ? 'bg-green-400' : 'bg-red-400'}`} />
                      {open ? 'Geöffnet' : 'Geschlossen'}
                    </span>
                  </div>
                  <p className="text-text-muted text-xs mb-1">{store.address}, {store.postalCode}</p>
                  <div className="flex items-center gap-3 text-xs text-text-faint">
                    <span className="flex items-center gap-1">
                      <Phone size={10} />
                      {store.phone}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={10} />
                      Mo–Fr 11:00–23:00
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Map */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl overflow-hidden border border-border">
              <StoreMap
                stores={activeStores}
                highlightedStoreId={selectedStore?.id}
                onStoreClick={setSelectedStore}
                className="h-[500px]"
              />
            </div>

            {/* Selected store detail */}
            {selectedStore && (
              <div className="mt-4 card p-5 space-y-3 animate-slide-up">
                <h3 className="font-bold text-text-warm text-lg">{selectedStore.name}</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-text-faint text-xs uppercase tracking-wide mb-1">Adresse</p>
                    <p className="text-text-muted">{selectedStore.address}</p>
                    <p className="text-text-muted">{selectedStore.postalCode} {selectedStore.city}</p>
                  </div>
                  <div>
                    <p className="text-text-faint text-xs uppercase tracking-wide mb-1">Öffnungszeiten</p>
                    {Object.entries(selectedStore.openingHours).map(([day, hours]) => (
                      <p key={day} className="text-text-muted text-xs">
                        <span className="inline-block w-16">{DAY_NAMES_DE[day]}</span>
                        {hours?.open} – {hours?.close}
                      </p>
                    ))}
                  </div>
                </div>
                <a
                  href={`tel:${selectedStore.phone}`}
                  className="btn-primary text-sm"
                >
                  <Phone size={14} />
                  {selectedStore.phone} anrufen
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
