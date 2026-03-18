'use client';

import { use } from 'react';
import { useOrderStore } from '@/stores/orderStore';
import { useOrderTracking } from '@/hooks/useOrderTracking';
import { ORDER_TIMELINE, getStatusIndex, getEstimatedDeliveryMinutes } from '@/lib/orderSimulation';
import { formatPrice, formatTime, formatETA } from '@/lib/formatters';
import { CheckCircle, Store, ChefHat, Bike, PartyPopper, Clock, MapPin } from 'lucide-react';
import { getStoreById } from '@/data/stores';
import Link from 'next/link';
import { cn } from '@/lib/cn';

const ICONS = { CheckCircle, Store, ChefHat, Bike, PartyPopper };

interface PageProps {
  params: Promise<{ orderId: string }>;
}

export default function OrderTrackingPage({ params }: PageProps) {
  const { orderId } = use(params);
  const order = useOrderTracking();
  const { currentOrder } = useOrderStore();

  // Use either the tracked order or current order
  const trackingOrder = order ?? currentOrder;

  if (!trackingOrder || trackingOrder.id !== orderId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center py-20 px-4">
          <div className="w-20 h-20 bg-bg-tertiary rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock size={32} className="text-text-faint" />
          </div>
          <h1 className="font-display text-2xl font-bold text-text-warm mb-3">Bestellung nicht gefunden</h1>
          <p className="text-text-muted mb-6">Diese Bestellung existiert nicht oder wurde bereits abgeschlossen.</p>
          <Link href="/menu" className="btn-primary">Neue Bestellung aufgeben</Link>
        </div>
      </div>
    );
  }

  const currentStepIdx = getStatusIndex(trackingOrder.status);
  const totalMinutes = getEstimatedDeliveryMinutes(trackingOrder.distanceKm);
  const store = getStoreById(trackingOrder.storeId);
  const isDelivered = trackingOrder.status === 'geliefert';
  const remainingMs = Math.max(0, trackingOrder.estimatedDeliveryAt - Date.now());
  const remainingMinutes = Math.ceil(remainingMs / 1000 / 60);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className={cn(
        'relative py-16 text-center transition-colors duration-1000',
        isDelivered
          ? 'bg-gradient-to-b from-green-900/30 to-bg-primary'
          : 'bg-gradient-to-b from-bg-warm to-bg-primary'
      )}>
        {isDelivered ? (
          <div className="space-y-3">
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto animate-bounce-scale">
              <span className="text-4xl">🎉</span>
            </div>
            <h1 className="font-display text-4xl font-bold text-text-warm">Guten Appetit!</h1>
            <p className="text-text-muted">Deine Bestellung wurde geliefert</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="w-20 h-20 bg-brand-red/10 rounded-full flex items-center justify-center mx-auto animate-pulse-glow">
              <Bike size={36} className="text-brand-red" />
            </div>
            <h1 className="font-display text-4xl font-bold text-text-warm">Bestellung verfolgen</h1>
            <p className="text-text-muted">
              {trackingOrder.status === 'unterwegs'
                ? `Noch ca. ${remainingMinutes} Minuten`
                : `Geschätzte Lieferzeit: ${formatETA(totalMinutes)}`
              }
            </p>
          </div>
        )}

        <div className="mt-4 text-text-faint text-sm">
          Bestellnummer: <span className="text-text-muted font-mono font-medium">{trackingOrder.id}</span>
        </div>
      </div>

      <div className="container-wide py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Tracking timeline */}
          <div className="lg:col-span-2">
            <div className="card p-6">
              <h2 className="font-semibold text-text-warm mb-6">Bestellstatus</h2>

              <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-5 top-6 bottom-6 w-0.5 bg-border" />

                <div className="space-y-6">
                  {ORDER_TIMELINE.map((step, idx) => {
                    const isDone = idx <= currentStepIdx;
                    const isCurrent = idx === currentStepIdx;
                    const IconComponent = ICONS[step.icon as keyof typeof ICONS] ?? CheckCircle;

                    return (
                      <div key={step.status} className="relative flex gap-5">
                        {/* Icon */}
                        <div className={cn(
                          'relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500',
                          isDone
                            ? isCurrent
                              ? 'bg-brand-red text-white shadow-glow-red animate-pulse-glow'
                              : 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-bg-tertiary text-text-faint border border-border'
                        )}>
                          <IconComponent size={18} />
                        </div>

                        {/* Content */}
                        <div className={cn(
                          'flex-1 pb-2 transition-all duration-500',
                          !isDone && 'opacity-40'
                        )}>
                          <div className="flex items-center justify-between">
                            <p className={cn(
                              'font-semibold',
                              isCurrent ? 'text-brand-red' : isDone ? 'text-text-warm' : 'text-text-faint'
                            )}>
                              {step.label}
                            </p>
                            {isDone && trackingOrder.statusHistory.find(e => e.status === step.status) && (
                              <span className="text-text-faint text-xs">
                                {formatTime(trackingOrder.statusHistory.find(e => e.status === step.status)!.timestamp)}
                              </span>
                            )}
                          </div>
                          <p className={cn(
                            'text-sm mt-0.5',
                            isCurrent ? 'text-text-muted' : 'text-text-faint'
                          )}>
                            {step.sublabel}
                          </p>
                          {isCurrent && step.status === 'unterwegs' && (
                            <div className="mt-2 flex items-center gap-2 text-brand-red text-sm font-medium">
                              <Clock size={14} />
                              Ankunft um ca. {formatTime(trackingOrder.estimatedDeliveryAt)}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Order summary */}
          <div className="space-y-4">
            {/* Store info */}
            {store && (
              <div className="card p-4">
                <h3 className="font-semibold text-text-warm text-sm mb-3">Deine Filiale</h3>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-brand-red/10 rounded-xl flex items-center justify-center">
                    <MapPin size={16} className="text-brand-red" />
                  </div>
                  <div>
                    <p className="font-medium text-text-warm text-sm">{store.name}</p>
                    <p className="text-text-muted text-xs">{store.address}</p>
                    <p className="text-text-muted text-xs">{store.postalCode} {store.city}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Items */}
            <div className="card p-4 space-y-3">
              <h3 className="font-semibold text-text-warm text-sm">Bestellte Artikel</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {trackingOrder.items.map(item => (
                  <div key={item.id} className="flex items-center gap-3">
                    <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover bg-bg-tertiary" />
                    <div className="flex-1 min-w-0">
                      <p className="text-text-warm text-xs font-medium truncate">{item.name}</p>
                      {item.sizeName && <p className="text-text-faint text-xs">{item.sizeName}</p>}
                    </div>
                    <span className="text-text-muted text-xs">×{item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-3 space-y-1 text-xs">
                <div className="flex justify-between text-text-muted">
                  <span>Zwischensumme</span>
                  <span>{formatPrice(trackingOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between text-text-muted">
                  <span>Lieferung</span>
                  <span>{trackingOrder.deliveryFee === 0 ? 'Kostenlos' : formatPrice(trackingOrder.deliveryFee)}</span>
                </div>
                <div className="flex justify-between font-bold text-sm pt-1 border-t border-border">
                  <span className="text-text-warm">Gesamt</span>
                  <span className="text-brand-red">{formatPrice(trackingOrder.total)}</span>
                </div>
              </div>
            </div>

            <Link href="/menu" className="btn-secondary w-full justify-center text-sm">
              Neue Bestellung aufgeben
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
