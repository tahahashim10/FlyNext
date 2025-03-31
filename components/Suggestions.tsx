'use client';

import { useState } from 'react';

interface SuggestionsProps {
  type: 'hotel' | 'flight';
  query: string;
  placeholder?: string;
  onSelect: (selected: string) => void;
}

export default function Suggestions({ type, query, placeholder, onSelect }: SuggestionsProps) {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [error, setError] = useState('');

  const fetchSuggestions = async () => {
    try {
      const res = await fetch('/api/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(type === 'hotel' ? { destination: query } : { hotelId: query }),
        credentials: 'include'
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to fetch suggestions');
      } else {
        const data = await res.json();
        setSuggestions(data[type === 'hotel' ? 'hotels' : 'flights'] || []);
      }
    } catch (err: any) {
      setError('Error fetching suggestions');
    }
  };

  return (
    <div className="mt-2">
      <button onClick={fetchSuggestions} className="btn btn-secondary btn-sm mb-2">
        Get {type === 'hotel' ? 'Hotel' : 'Flight'} Suggestions
      </button>
      {error && <p className="text-red-500">{error}</p>}
      {suggestions.length > 0 && (
        <ul className="list-disc pl-5">
          {suggestions.map((sugg, index) => (
            <li
              key={index}
              className="cursor-pointer hover:underline"
              onClick={() => onSelect(type === 'hotel' ? sugg.name : sugg.id)}
            >
              {type === 'hotel'
                ? `${sugg.name} - ${sugg.starRating} stars`
                : `${sugg.airline.name} - $${sugg.price}`}
            </li>
          ))}
        </ul>
      )}
      {placeholder && <p className="text-gray-500 text-sm mt-1">{placeholder}</p>}
    </div>
  );
}
