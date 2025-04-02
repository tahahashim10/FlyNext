'use client';

import { useState, useEffect } from 'react';

interface City {
  city: string;
  country: string;
}

interface Suggestion {
  label: string;
  value: string;
}

interface CitySuggestionsDropdownProps {
  query: string;
  onSelect: (city: string) => void;
  visible: boolean;
}

export default function CitySuggestionsDropdown({
  query,
  onSelect,
  visible,
}: CitySuggestionsDropdownProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query || query.length < 2 || !visible) {
      setSuggestions([]);
      return;
    }
    
    // Debounce the API call by 300ms to reduce lag
    const timer = setTimeout(() => {
      const fetchSuggestions = async () => {
        setLoading(true);
        try {
          const res = await fetch('/api/cities');
          if (!res.ok) {
            console.error('Failed to fetch city suggestions');
            return;
          }
          const cities: City[] = await res.json();
          const filtered: Suggestion[] = cities
            .map((c) => ({
              label: `${c.city}, ${c.country}`,
              value: c.city,
            }))
            .filter((sugg) =>
              sugg.label.toLowerCase().includes(query.toLowerCase())
            );
          setSuggestions(filtered);
        } catch (err) {
          console.error('Error fetching city suggestions:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchSuggestions();
    }, 300);

    return () => clearTimeout(timer);
  }, [query, visible]);

  if (!visible || !query || query.length < 2) {
    return null;
  }

  return (
    <div className="absolute z-50 w-full mt-1 bg-card shadow-lg max-h-60 overflow-auto rounded-md border border-border">
      {loading ? (
        <div className="px-4 py-2 text-sm text-muted">Loading suggestions...</div>
      ) : suggestions.length === 0 ? (
        <div className="px-4 py-2 text-sm text-muted">No cities found</div>
      ) : (
        <ul className="py-1">
          {suggestions.map((sugg, index) => (
            <li
              key={index}
              className="px-4 py-2 hover:bg-muted/30 cursor-pointer"
              onClick={() => onSelect(sugg.value)}
            >
              <div className="font-medium">{sugg.label}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
