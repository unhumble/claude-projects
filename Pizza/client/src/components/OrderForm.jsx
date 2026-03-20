import { useState } from 'react';
import { createOrder } from '../api.js';
import { DELIVERY_AREAS } from '../constants.js';
import AddressAutocomplete from './AddressAutocomplete.jsx';

const EMPTY = {
  customer_name: '',
  street: '',
  area: DELIVERY_AREAS[0]?.value || '',
  deliver_at: '',
  phone: '',
  notes: '',
};

const inputStyle = {
  background: '#111318',
  border: '1px solid #2a2d36',
};

function Field({ children }) {
  return <div className="flex flex-col gap-1">{children}</div>;
}

function Label({ children }) {
  return (
    <label className="text-[10px] uppercase tracking-wider text-[#9ca3af]">
      {children}
    </label>
  );
}

function Input({ style, onFocus, onBlur, ...props }) {
  return (
    <input
      className="w-full rounded-md px-3 py-2 text-sm text-[#e2e4e9] placeholder-[#6b7280] outline-none transition-colors"
      style={inputStyle}
      onFocus={(e) => {
        e.target.style.borderColor = '#f59e0b';
        onFocus?.(e);
      }}
      onBlur={(e) => {
        e.target.style.borderColor = '#2a2d36';
        onBlur?.(e);
      }}
      {...props}
    />
  );
}

export default function OrderForm({ orders, setOrders }) {
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  // Store geocoded lat/lng from autocomplete selection
  const [geocoded, setGeocode] = useState(null);

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleAddressSelect = (result) => {
    setGeocode({ lat: result.lat, lng: result.lng });
    // If autocomplete gives us an area suggestion, pre-fill it
    if (result.area) {
      // Try to match against DELIVERY_AREAS values
      const match = DELIVERY_AREAS.find((a) =>
        a.value.startsWith(result.area.split(' ')[0]),
      );
      if (match) {
        setForm((f) => ({ ...f, area: match.value }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.customer_name.trim() || !form.street.trim()) return;

    setSubmitting(true);
    try {
      const fullAddress = `${form.street.trim()}, ${form.area}, Germany`;
      const payload = {
        customer_name: form.customer_name.trim(),
        address: fullAddress,
      };
      if (geocoded) {
        payload.lat = geocoded.lat;
        payload.lng = geocoded.lng;
      }
      if (form.phone.trim()) payload.phone = form.phone.trim();
      if (form.notes.trim()) payload.notes = form.notes.trim();
      if (form.deliver_at.trim()) payload.deliver_at = form.deliver_at.trim();

      const order = await createOrder(payload);
      setOrders((prev) => {
        if (prev.some((o) => o.id === order.id)) return prev;
        return [order, ...prev];
      });
      setForm(EMPTY);
      setGeocode(null);
    } catch (err) {
      console.error('Failed to create order:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="text-[10px] uppercase tracking-wider text-[#9ca3af]">
        New Order
      </div>

      {/* Row 1: customer name */}
      <Field>
        <Label>Customer Name</Label>
        <Input
          type="text"
          required
          placeholder="Full name"
          value={form.customer_name}
          onChange={set('customer_name')}
        />
      </Field>

      {/* Row 2: address with autocomplete */}
      <Field>
        <Label>Street Address</Label>
        <AddressAutocomplete
          value={form.street}
          onChange={(val) => setForm((f) => ({ ...f, street: val }))}
          onSelect={handleAddressSelect}
        />
      </Field>

      {/* Row 3: area | deliver_at | phone */}
      <div className="flex gap-2">
        {/* area: ~42% */}
        <Field>
          <Label>Area</Label>
          <select
            className="rounded-md px-3 py-2 text-sm text-[#e2e4e9] outline-none transition-colors"
            style={{ ...inputStyle, width: '160px' }}
            value={form.area}
            onChange={set('area')}
            onFocus={(e) => (e.target.style.borderColor = '#f59e0b')}
            onBlur={(e) => (e.target.style.borderColor = '#2a2d36')}
          >
            {DELIVERY_AREAS.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </select>
        </Field>

        {/* deliver_at: ~28% */}
        <Field>
          <Label>Deliver At</Label>
          <Input
            type="time"
            placeholder="--:--"
            value={form.deliver_at}
            onChange={set('deliver_at')}
            style={{ ...inputStyle, width: '96px', colorScheme: 'dark' }}
          />
        </Field>

        {/* phone: rest */}
        <Field className="flex-1">
          <Label>Phone</Label>
          <Input
            type="tel"
            placeholder="+49..."
            value={form.phone}
            onChange={set('phone')}
            style={{ ...inputStyle, minWidth: 0 }}
          />
        </Field>
      </div>

      {/* Row 4: notes */}
      <Field>
        <Label>Notes</Label>
        <Input
          type="text"
          placeholder="Doorbell, floor, etc."
          value={form.notes}
          onChange={set('notes')}
        />
      </Field>

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-md py-2 text-sm font-semibold transition-opacity disabled:opacity-60"
        style={{ background: '#f59e0b', color: '#000' }}
      >
        {submitting ? 'Geocoding...' : 'Add Order'}
      </button>
    </form>
  );
}
