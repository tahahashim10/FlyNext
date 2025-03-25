'use client';

import React, { useState, useEffect } from 'react';

interface RoomTypeAutoCompleteProps {
  value: string;
  onChange: (value: string) => void;
}

export default function RoomTypeAutoComplete({ value, onChange }: RoomTypeAutoCompleteProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const fetchRoomTypes = async () => {
      try {
        const res = await fetch('/api/roomTypes/owner', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data);
        }
      } catch (error) {
        console.error('Error fetching room types:', error);
      }
    };
    fetchRoomTypes();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const userInput = e.target.value;
    onChange(userInput);
    if (userInput.trim().length > 0) {
      const filtered = suggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(userInput.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    setFilteredSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="Room Type Filter"
        className="input input-bordered w-full"
      />
      {showSuggestions && value && filteredSuggestions.length > 0 && (
        <ul className="absolute z-10 bg-white border border-gray-300 w-full max-h-60 overflow-y-auto">
          {filteredSuggestions.map((suggestion, index) => (
            <li
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="p-2 cursor-pointer hover:bg-gray-200"
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
