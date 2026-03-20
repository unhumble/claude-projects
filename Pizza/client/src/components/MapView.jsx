import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import { ORIGIN } from '../constants.js';

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

export default function MapView({ orders = [], drivers = [] }) {
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
      <Marker position={[ORIGIN.lat, ORIGIN.lng]} icon={pizzeriaIcon}>
        <Popup>
          <div style={{ fontWeight: 'bold' }}>Pizzeria</div>
          <div style={{ fontSize: '12px', color: '#555' }}>{ORIGIN.address}</div>
        </Popup>
      </Marker>
    </MapContainer>
  );
}
