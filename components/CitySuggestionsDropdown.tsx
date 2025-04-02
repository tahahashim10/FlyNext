'use client';

import { useState, useEffect } from 'react';

interface CitySuggestion {
  city: string;
  country: string;
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
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!query || query.length < 2 || !visible) {
        setSuggestions([]);
        return;
      }
      
      setLoading(true);
      setError('');
      
      try {
        const res = await fetch('/api/cities');
        
        if (!res.ok) {
          setError('Failed to fetch city suggestions');
          return;
        }
        
        const cities = await res.json();
        
        // Filter cities based on query
        const filteredCities = cities.filter((city: CitySuggestion) => 
          city.city.toLowerCase().includes(query.toLowerCase())
        );
        
        setSuggestions(filteredCities);
      } catch (err) {
        console.error('Error fetching city suggestions:', err);
        setError('Error fetching city suggestions');
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [query, visible]);

  if (!visible || !query || query.length < 2) {
    return null;
  }

  return (
    <div className="absolute z-50 w-full mt-1 bg-card shadow-lg max-h-60 overflow-auto rounded-md border border-border">
      {loading && (
        <div className="px-4 py-2 text-sm text-muted">Loading suggestions...</div>
      )}
      
      {error && (
        <div className="px-4 py-2 text-sm text-destructive">{error}</div>
      )}
      
      {!loading && !error && suggestions.length === 0 && (
        <div className="px-4 py-2 text-sm text-muted">No cities found</div>
      )}
      
      <ul className="py-1">
        {suggestions.map((suggestion, index) => (
          <li
            key={`${suggestion.city}-${index}`}
            className="px-4 py-2 hover:bg-muted/30 cursor-pointer text-foreground transition-colors"
            onClick={() => onSelect(suggestion.city)}
          >
            <div className="font-medium">{suggestion.city}</div>
            <div className="text-xs text-muted">{suggestion.country}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}