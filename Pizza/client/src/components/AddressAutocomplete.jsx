import { useState, useRef, useCallback } from 'react';
import { searchAddress } from '../api.js';
import { VALID_POSTCODES } from '../constants.js';

export default function AddressAutocomplete({ value, onChange, onSelect }) {
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef(null);

  const handleChange = useCallback((e) => {
    const query = e.target.value;
    onChange(query);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.length < 3) {
      setResults([]);
      setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const raw = await searchAddress(query);

        // Filter to valid postcodes
        const filtered = raw.filter((r) => {
          const pc = r.address?.postcode?.replace(/\s/g, '').slice(0, 5);
          return pc && VALID_POSTCODES.has(pc);
        });

        // Deduplicate by road|house_number|town
        const seen = new Set();
        const deduped = filtered.filter((r) => {
          const key = [
            r.address?.road || '',
            r.address?.house_number || '',
            r.address?.town || r.address?.city || r.address?.village || '',
          ].join('|');
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        setResults(deduped);
        setOpen(deduped.length > 0);
      } catch (err) {
        console.error('Address search failed:', err);
      }
    }, 350);
  }, [onChange]);

  const handleSelect = useCallback((result) => {
    const road = result.address?.road || '';
    const houseNumber = result.address?.house_number || '';
    const display = houseNumber ? `${road} ${houseNumber}` : road;

    const postcode = result.address?.postcode?.replace(/\s/g, '').slice(0, 5) || '';
    const town =
      result.address?.town ||
      result.address?.city ||
      result.address?.village ||
      '';

    onChange(display);
    onSelect({
      display,
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      area: `${postcode} ${town}`.trim(),
    });
    setResults([]);
    setOpen(false);
  }, [onChange, onSelect]);

  const handleBlur = useCallback(() => {
    // Delay so click on dropdown item registers first
    setTimeout(() => setOpen(false), 200);
  }, []);

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="Street and number"
        className="w-full rounded-md px-3 py-2 text-sm text-[#e2e4e9] placeholder-[#6b7280] outline-none transition-colors"
        style={{
          background: '#111318',
          border: '1px solid #2a2d36',
        }}
        onFocus={(e) => (e.target.style.borderColor = '#f59e0b')}
        onBlur={(e) => {
          e.target.style.borderColor = '#2a2d36';
          handleBlur();
        }}
        autoComplete="off"
      />

      {open && results.length > 0 && (
        <ul
          className="absolute left-0 right-0 mt-1 rounded-md shadow-lg z-50 overflow-hidden"
          style={{
            background: '#1e2028',
            border: '1px solid #2a2d36',
            maxHeight: '220px',
            overflowY: 'auto',
          }}
        >
          {results.map((r, i) => {
            const road = r.address?.road || r.display_name?.split(',')[0] || '';
            const houseNumber = r.address?.house_number || '';
            const mainLine = houseNumber ? `${road} ${houseNumber}` : road;
            const postcode = r.address?.postcode?.replace(/\s/g, '').slice(0, 5) || '';
            const town =
              r.address?.town ||
              r.address?.city ||
              r.address?.village ||
              '';
            const subLine = postcode && town ? `${town} (${postcode})` : town || postcode;

            return (
              <li
                key={i}
                className="px-3 py-2 cursor-pointer hover:bg-[#2a2d36] transition-colors"
                onMouseDown={() => handleSelect(r)}
              >
                <div className="text-sm font-semibold text-[#e2e4e9]">{mainLine}</div>
                {subLine && (
                  <div className="text-xs text-[#6b7280] mt-0.5">{subLine}</div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
