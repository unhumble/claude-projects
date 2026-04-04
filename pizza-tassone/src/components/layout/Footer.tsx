import Link from 'next/link';
import { MapPin, Phone, Clock, Instagram, Facebook } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-bg-secondary border-t border-border mt-20">
      <div className="container-wide py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 bg-brand-red rounded-xl flex items-center justify-center">
                <span className="text-white font-display font-bold text-lg">T</span>
              </div>
              <span className="font-display font-bold text-xl text-text-warm">Tassone</span>
            </div>
            <p className="text-text-muted text-sm leading-relaxed">
              Seit 1993 dein Pizza-Service am Bodensee. Frische Zutaten, hausgemachter Teig, mit Liebe gebacken.
            </p>
            <div className="flex items-center gap-3 mt-5">
              <a href="https://www.instagram.com/pizzatassonede" target="_blank" rel="noopener noreferrer"
                 className="w-9 h-9 bg-bg-tertiary hover:bg-brand-red border border-border rounded-full flex items-center justify-center text-text-muted hover:text-white transition-all duration-200">
                <Instagram size={16} />
              </a>
              <a href="https://www.facebook.com/PizzaServiceTassone" target="_blank" rel="noopener noreferrer"
                 className="w-9 h-9 bg-bg-tertiary hover:bg-brand-red border border-border rounded-full flex items-center justify-center text-text-muted hover:text-white transition-all duration-200">
                <Facebook size={16} />
              </a>
            </div>
          </div>

          {/* Menu links */}
          <div>
            <h3 className="font-semibold text-text-warm mb-4">Speisekarte</h3>
            <ul className="space-y-2.5 text-sm text-text-muted">
              <li><Link href="/menu#pizza" className="hover:text-text-warm transition-colors">Pizzen</Link></li>
              <li><Link href="/menu#pasta" className="hover:text-text-warm transition-colors">Pasta</Link></li>
              <li><Link href="/menu#dessert" className="hover:text-text-warm transition-colors">Desserts</Link></li>
              <li><Link href="/menu#drink" className="hover:text-text-warm transition-colors">Getränke</Link></li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="font-semibold text-text-warm mb-4">Service</h3>
            <ul className="space-y-2.5 text-sm text-text-muted">
              <li><Link href="/stores" className="hover:text-text-warm transition-colors">Alle Filialen</Link></li>
              <li><Link href="/cart" className="hover:text-text-warm transition-colors">Warenkorb</Link></li>
              <li><a href="#" className="hover:text-text-warm transition-colors">Impressum</a></li>
              <li><a href="#" className="hover:text-text-warm transition-colors">Datenschutz</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-text-warm mb-4">Kontakt</h3>
            <ul className="space-y-3 text-sm text-text-muted">
              <li className="flex items-start gap-2">
                <MapPin size={14} className="text-brand-red mt-0.5 shrink-0" />
                <span>Bodenseeregion, Baden-Württemberg</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-brand-red shrink-0" />
                <span>Filiale wählen für Telefonnummer</span>
              </li>
              <li className="flex items-start gap-2">
                <Clock size={14} className="text-brand-red mt-0.5 shrink-0" />
                <div>
                  <p>Mo–Fr: 11:00–23:00</p>
                  <p>Sa–So: 11:00–23:30</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-faint">
          <p>© {new Date().getFullYear()} Pizza Service Tassone. Alle Rechte vorbehalten.</p>
          <p>Gegründet 1993 in Radolfzell am Bodensee</p>
        </div>
      </div>
    </footer>
  );
}
