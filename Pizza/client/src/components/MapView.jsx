import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMap } from 'react-leaflet';
import L from 'leaflet';
import { ORIGIN } from '../constants.js';

const STATUS_COLOR = {
  pending: '#ef4444',
  assigned: '#22c55e',
  delivered: '#6b7280',
};

const pizzeriaIcon = L.divIcon({
  className: '',
  html: `<div style="
    width:32px;height:32px;border-radius:50%;
    background:#f59e0b;border:2px solid #fff;
    display:flex;align-items:center;justify-content:center;
    font-size:16px;line-height:32px;text-align:center;
    box-shadow:0 2px 6px rgba(0,0,0,0.5);
  ">🍕</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -18],
});

function makeOrderIcon(color) {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:20px;height:20px;border-radius:50%;
      background:${color};border:2px solid #fff;
      box-shadow:0 2px 6px rgba(0,0,0,0.6);
    "></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -12],
  });
}

// Fits the map bounds whenever orders change
function BoundsUpdater({ orders }) {
  const map = useMap();

  useEffect(() => {
    const activeOrders = orders.filter(
      (o) => o.status !== 'delivered' && o.lat != null && o.lng != null,
    );

    const points = [
      [ORIGIN.lat, ORIGIN.lng],
      ...activeOrders.map((o) => [o.lat, o.lng]),
    ];

    if (activeOrders.length > 0) {
      map.fitBounds(points, { padding: [60, 60] });
    }
  }, [orders, map]);

  return null;
}

export default function MapView({ orders = [], drivers = [] }) {
  // Only show non-delivered orders as markers
  const activeOrders = orders.filter(
    (o) => o.status !== 'delivered' && o.lat != null && o.lng != null,
  );

  return (
    <MapContainer
      center={[ORIGIN.lat, ORIGIN.lng]}
      zoom={12}
      style={{ width: '100%', height: '100%' }}
      zoomControl={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        subdomains="abcd"
        maxZoom={20}
      />
      <ZoomControl position="bottomright" />

      {/* Pizzeria marker */}
      <Marker position={[ORIGIN.lat, ORIGIN.lng]} icon={pizzeriaIcon}>
        <Popup>
          <div style={{ fontWeight: 'bold' }}>Pizzeria</div>
          <div style={{ fontSize: '12px', color: '#555' }}>{ORIGIN.address}</div>
        </Popup>
      </Marker>

      {/* Order markers */}
      {activeOrders.map((order) => {
        const color = STATUS_COLOR[order.status] || '#6b7280';
        const addressFirst = order.address?.split(',')[0] || order.address || '';
        return (
          <Marker
            key={order.id}
            position={[order.lat, order.lng]}
            icon={makeOrderIcon(color)}
          >
            <Popup>
              <div style={{ fontWeight: 'bold' }}>{order.customer_name}</div>
              <div style={{ fontSize: '12px', color: '#555' }}>{addressFirst}</div>
              <div style={{ fontSize: '11px', color, marginTop: 2, textTransform: 'capitalize' }}>
                {order.status}
              </div>
            </Popup>
          </Marker>
        );
      })}

      <BoundsUpdater orders={orders} />
    </MapContainer>
  );
}
