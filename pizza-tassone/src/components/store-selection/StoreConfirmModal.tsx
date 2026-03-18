'use client';

import { X, MapPin, Phone, Clock, CheckCircle, Navigation } from 'lucide-react';
import { useStoreSelectionStore } from '@/stores/storeSelectionStore';
import { formatDistance } from '@/lib/formatters';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';
import { isStoreOpen } from '@/data/stores';

export function StoreConfirmModal() {
  const {
    isModalOpen, nearestResult, isSearching, searchError,
    closeModal, confirmStore, searchByPostalCode, postalCode
  } = useStoreSelectionStore();

  const [inputValue, setInputValue] = useState('');

  if (!isModalOpen && !searchError) return null;

  const store = nearestResult?.store;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      searchByPostalCode(inputValue.trim());
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 glass z-[60] animate-fade-in"
        onClick={closeModal}
      />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[60] w-full max-w-md mx-4 animate-slide-up">
        <div className="bg-bg-secondary border border-border rounded-2xl overflow-hidden shadow-card">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-brand-red/10 rounded-full flex items-center justify-center">
                <MapPin size={16} className="text-brand-red" />
              </div>
              <h2 className="font-semibold text-text-warm">Standort wählen</h2>
            </div>
            <button
              onClick={closeModal}
              className="w-8 h-8 rounded-full bg-bg-tertiary hover:bg-border flex items-center justify-center text-text-muted hover:text-text-warm transition-colors"
            >
              <X size={14} />
            </button>
          </div>

          <div className="p-5">
            {/* PLZ Input */}
            <form onSubmit={handleSearch} className="flex gap-2 mb-4">
              <input
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder="Postleitzahl eingeben, z. B. 78244"
                className="input-field flex-1 text-sm"
                maxLength={5}
                pattern="\d*"
                inputMode="numeric"
              />
              <Button type="submit" size="sm" loading={isSearching} disabled={isSearching}>
                Suchen
              </Button>
            </form>

            {/* Error */}
            {searchError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm mb-4">
                {searchError}
              </div>
            )}

            {/* Store result */}
            {store && nearestResult && (
              <div className="bg-bg-card border border-border rounded-xl p-4 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-text-warm">{store.name}</h3>
                    <p className="text-text-muted text-sm mt-0.5">
                      {store.address}, {store.postalCode} {store.city}
                    </p>
                  </div>
                  <div className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                    isStoreOpen(store)
                      ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                      : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isStoreOpen(store) ? 'bg-green-400' : 'bg-red-400'}`} />
                    {isStoreOpen(store) ? 'Geöffnet' : 'Geschlossen'}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm text-text-muted">
                  <div className="flex items-center gap-2">
                    <Navigation size={13} className="text-brand-red shrink-0" />
                    <span>{formatDistance(nearestResult.distanceKm)} entfernt</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={13} className="text-brand-red shrink-0" />
                    <span>{store.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 col-span-2">
                    <Clock size={13} className="text-brand-red shrink-0" />
                    <span>Mo–Fr 11:00–23:00, Sa–So 11:00–23:30</span>
                  </div>
                </div>

                {nearestResult.isExactMatch && (
                  <div className="flex items-center gap-2 text-xs text-green-400">
                    <CheckCircle size={13} />
                    Nächste Filiale für PLZ {postalCode}
                  </div>
                )}

                <Button
                  className="w-full"
                  onClick={confirmStore}
                >
                  Diese Filiale wählen
                </Button>
              </div>
            )}

            <p className="text-xs text-text-faint text-center mt-4">
              Pizza Service Tassone liefert in der gesamten Bodenseeregion
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
