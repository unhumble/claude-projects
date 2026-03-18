'use client';

import { useEffect, useRef } from 'react';
import type { StoreLocation } from '@/types';
import { isStoreOpen } from '@/data/stores';

interface StoreMapProps {
  stores: StoreLocation[];
  highlightedStoreId?: string;
  onStoreClick?: (store: StoreLocation) => void;
  className?: string;
  zoom?: number;
  center?: [number, number];
}

// Leaflet must be loaded client-side only
export function StoreMap({
  stores,
  highlightedStoreId,
  onStoreClick,
  className = 'h-96',
  zoom = 10,
  center = [47.74, 9.02],
}: StoreMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const leafletMapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;

    // Dynamic import to avoid SSR issues
    import('leaflet').then(L => {
      // Fix default marker icons
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(mapRef.current!, {
        center,
        zoom,
        zoomControl: true,
        scrollWheelZoom: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map);

      leafletMapRef.current = map;

      // Create custom SVG icon
      const createIcon = (isHighlighted: boolean, isOpen: boolean) => L.divIcon({
        className: '',
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -36],
        html: `
          <div style="
            width: ${isHighlighted ? 44 : 36}px;
            height: ${isHighlighted ? 44 : 36}px;
            background: ${isHighlighted ? '#E8001D' : isOpen ? '#1E1E1E' : '#3D3D3D'};
            border: 3px solid ${isHighlighted ? '#FF6B35' : '#E8001D'};
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            box-shadow: 0 4px 16px rgba(232, 0, 29, ${isHighlighted ? '0.6' : '0.3'});
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <span style="
              transform: rotate(45deg);
              color: ${isHighlighted ? 'white' : '#E8001D'};
              font-size: 14px;
              font-weight: bold;
              font-family: sans-serif;
            ">T</span>
          </div>
        `,
      });

      // Add markers
      stores.forEach(store => {
        const isHighlighted = store.id === highlightedStoreId;
        const isOpen = isStoreOpen(store);
        const icon = createIcon(isHighlighted, isOpen);

        const marker = L.marker([store.lat, store.lng], { icon })
          .bindPopup(`
            <div style="min-width: 200px; font-family: sans-serif;">
              <strong style="color: #F5F0E8; font-size: 15px;">${store.name}</strong>
              <p style="color: #A89880; font-size: 13px; margin: 6px 0 4px;">${store.address}<br/>${store.postalCode} ${store.city}</p>
              <p style="color: #A89880; font-size: 12px; margin: 2px 0;">${store.phone}</p>
              <span style="
                display: inline-flex;
                align-items: center;
                gap: 4px;
                margin-top: 8px;
                padding: 3px 10px;
                border-radius: 999px;
                font-size: 11px;
                font-weight: 600;
                background: ${isOpen ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)'};
                color: ${isOpen ? '#4ade80' : '#f87171'};
                border: 1px solid ${isOpen ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'};
              ">
                <span style="width: 6px; height: 6px; border-radius: 50%; background: ${isOpen ? '#4ade80' : '#f87171'};"></span>
                ${isOpen ? 'Geöffnet' : 'Geschlossen'}
              </span>
            </div>
          `)
          .addTo(map);

        if (onStoreClick) {
          marker.on('click', () => onStoreClick(store));
        }

        markersRef.current.push(marker);

        if (isHighlighted) {
          marker.openPopup();
        }
      });

      // Fit bounds to show all stores
      if (stores.length > 1) {
        const bounds = L.latLngBounds(stores.map(s => [s.lat, s.lng]));
        map.fitBounds(bounds, { padding: [40, 40] });
      }
    });

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
        markersRef.current = [];
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update highlighted marker when it changes
  useEffect(() => {
    if (!leafletMapRef.current) return;
    // Re-center on highlighted store
    const highlighted = stores.find(s => s.id === highlightedStoreId);
    if (highlighted) {
      leafletMapRef.current.setView([highlighted.lat, highlighted.lng], 13, { animate: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlightedStoreId]);

  return (
    <>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        crossOrigin=""
      />
      <div ref={mapRef} className={className} />
    </>
  );
}
