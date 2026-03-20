import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, Polyline, useMap } from 'react-leaflet';
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

function makeNumberedIcon(color, number) {
  return L.divIcon({
    className: '',
    html: `<div style="width:26px;height:26px;border-radius:50%;background:${color};border:3px solid #fff;box-shadow:0 2px 8px #0008;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:11px;color:#fff;font-family:system-ui;">${number}</div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -15],
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

const POPUP_STYLES = `
  .leaflet-popup-content-wrapper { background: #1e2028; color: #e2e4e9; border-radius: 10px; border: 1px solid #2a2d36; }
  .leaflet-popup-tip { background: #1e2028; }
  .leaflet-popup-content { font-size: 12px; margin: 8px 12px; }
`;

export default function MapView({ orders = [], routes = [], routeMarkers = [] }) {
  // Build a lookup of orderId -> routeMarker info
  const markerLookup = new Map();
  for (const rm of routeMarkers) {
    markerLookup.set(rm.orderId, rm);
  }

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
      <style>{POPUP_STYLES}</style>

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
          <div style={{ fontSize: '12px' }}>{ORIGIN.address}</div>
        </Popup>
      </Marker>

      {/* Route polylines */}
      {routes.map((route, idx) => {
        if (!route.geometry?.coordinates?.length) return null;
        // GeoJSON coordinates are [lng, lat], Leaflet needs [lat, lng]
        const positions = route.geometry.coordinates.map((c) => [c[1], c[0]]);
        return (
          <Polyline
            key={`route-${idx}`}
            positions={positions}
            pathOptions={{
              color: route.color,
              weight: 4,
              opacity: route.assigned ? 0.9 : 0.7,
              dashArray: route.assigned ? undefined : '6 6',
            }}
          />
        );
      })}

      {/* Order markers */}
      {activeOrders.map((order) => {
        const rm = markerLookup.get(order.id);
        const color = STATUS_COLOR[order.status] || '#6b7280';
        const icon = rm
          ? makeNumberedIcon(rm.color, rm.stopNumber)
          : makeOrderIcon(color);
        const addressFirst = order.address?.split(',')[0] || order.address || '';
        return (
          <Marker
            key={order.id}
            position={[order.lat, order.lng]}
            icon={icon}
          >
            <Popup>
              <div style={{ fontWeight: 'bold' }}>{order.customer_name}</div>
              <div style={{ fontSize: '12px' }}>{addressFirst}</div>
              <div style={{ fontSize: '11px', color: rm ? rm.color : color, marginTop: 2, textTransform: 'capitalize' }}>
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
