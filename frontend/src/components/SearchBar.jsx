import { useState, useEffect, useRef } from "react";
import { autocomplete } from "../api/searchApi";

export default function SearchBar({ onSearch, initialQuery = "" }) {
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const timer = useRef(null);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Update query when initialQuery changes
  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  // Fetch autocomplete suggestions with debounce
  useEffect(() => {
    clearTimeout(timer.current);
    
    if (query.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    timer.current = setTimeout(async () => {
      try {
        const { data } = await autocomplete(query);
        setSuggestions(data);
        setShowDropdown(data.length > 0);
        setSelectedIndex(-1);
      } catch (error) {
        console.error("Autocomplete error:", error);
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer.current);
  }, [query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !inputRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (searchQuery) => {
    const q = searchQuery || query;
    if (q.trim()) {
      setShowDropdown(false);
      onSearch(q.trim());
    }
  };

  const handleKeyDown = (e) => {
    if (!showDropdown || suggestions.length === 0) {
      if (e.key === "Enter") {
        handleSubmit();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSubmit(suggestions[selectedIndex]);
          setQuery(suggestions[selectedIndex]);
        } else {
          handleSubmit();
        }
        break;
      case "Escape":
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
    }
  };

  return (
    <div className="relative mt-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
            placeholder="Search anything..."
            className="w-full p-4 pr-12 border border-gray-300 rounded-xl shadow-sm 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       text-lg transition-all duration-200"
            autoComplete="off"
          />
          {query && (
            <button
              onClick={() => {
                setQuery("");
                setSuggestions([]);
                inputRef.current?.focus();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 
                         hover:text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <button
          onClick={() => handleSubmit()}
          className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                     transition-all duration-200 font-medium shadow-sm hover:shadow-md
                     flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Search
        </button>
      </div>

      {/* Autocomplete Dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <ul
          ref={dropdownRef}
          className="absolute z-20 w-full bg-white border border-gray-200 rounded-xl 
                     shadow-lg mt-2 max-h-80 overflow-auto"
        >
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              onClick={() => {
                setQuery(suggestion);
                handleSubmit(suggestion);
              }}
              className={`px-4 py-3 cursor-pointer flex items-center gap-3 transition-colors
                ${index === selectedIndex 
                  ? "bg-blue-50 text-blue-700" 
                  : "hover:bg-gray-50"
                }
                ${index === 0 ? "rounded-t-xl" : ""}
                ${index === suggestions.length - 1 ? "rounded-b-xl" : ""}
              `}
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="text-sm">{suggestion}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
