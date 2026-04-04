import Link from 'next/link';
import { MapPin, Clock, Phone, ArrowRight } from 'lucide-react';
import { STORES, isStoreOpen } from '@/data/stores';

export function StoresPreview() {
  const stores = STORES.filter(s => s.isActive).slice(0, 4);

  return (
    <section className="py-20 bg-bg-primary">
      <div className="container-wide">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-brand-red text-sm font-semibold tracking-wide uppercase mb-2">Am Bodensee</p>
            <h2 className="section-heading">Unsere Filialen</h2>
          </div>
          <Link href="/stores" className="hidden sm:flex items-center gap-2 text-text-muted hover:text-brand-red text-sm font-medium transition-colors">
            Alle Filialen <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {stores.map(store => (
            <div key={store.id} className="card card-hover p-5 group">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="w-10 h-10 bg-brand-red/10 rounded-xl flex items-center justify-center group-hover:bg-brand-red/20 transition-colors">
                  <MapPin size={18} className="text-brand-red" />
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1.5 ${
                  isStoreOpen(store)
                    ? 'bg-green-500/10 text-green-400'
                    : 'bg-red-500/10 text-red-400'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isStoreOpen(store) ? 'bg-green-400' : 'bg-red-400'}`} />
                  {isStoreOpen(store) ? 'Offen' : 'Geschlossen'}
                </span>
              </div>

              <h3 className="font-bold text-text-warm mb-1">{store.city}</h3>
              <p className="text-text-muted text-xs mb-3">{store.address}</p>

              <div className="space-y-1.5 text-xs text-text-faint">
                <div className="flex items-center gap-2">
                  <Clock size={11} />
                  <span>Mo–Fr 11:00–23:00</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={11} />
                  <span>{store.phone}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center sm:hidden">
          <Link href="/stores" className="btn-secondary text-sm">
            Alle {STORES.length} Filialen <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
