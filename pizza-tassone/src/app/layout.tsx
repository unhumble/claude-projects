import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { StoreConfirmModal } from '@/components/store-selection/StoreConfirmModal';

export const metadata: Metadata = {
  title: {
    template: '%s | Pizza Service Tassone',
    default: 'Pizza Service Tassone – Frisch gebacken am Bodensee',
  },
  description:
    'Pizza Service Tassone – Dein Pizza-Lieferservice in der Bodenseeregion seit 1993. Online bestellen, frisch zubereitet, schnell geliefert.',
  keywords: ['Pizza', 'Lieferservice', 'Bodensee', 'Tassone', 'Singen', 'Konstanz', 'Radolfzell'],
  openGraph: {
    type: 'website',
    locale: 'de_DE',
    siteName: 'Pizza Service Tassone',
  },
};

export const viewport: Viewport = {
  themeColor: '#0D0D0D',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className="font-body bg-bg-primary text-text-warm antialiased">
        <Header />
        <CartDrawer />
        <StoreConfirmModal />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
