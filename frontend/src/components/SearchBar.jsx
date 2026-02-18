import { useState, useEffect, useRef } from "react";
import { autocomplete } from "../api/searchApi";

export default function SearchBar({ onSearch, initialQuery = "", isHome = false }) {
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const timer = useRef(null);
  const inputRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  // Fetch suggestions with debounce
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
        const items = Array.isArray(data) ? data : [];
        setSuggestions(items);
        setShowDropdown(items.length > 0);
        setSelectedIndex(-1);
      } catch {
        /* ignore */
      }
    }, 200);

    return () => clearTimeout(timer.current);
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const submit = (text) => {
    const q = (text || query).trim();
    if (!q) return;
    setShowDropdown(false);
    onSearch(q);
  };

  const handleKeyDown = (e) => {
    if (!showDropdown || suggestions.length === 0) {
      if (e.key === "Enter") submit();
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((p) => (p < suggestions.length - 1 ? p + 1 : p));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((p) => (p > 0 ? p - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0) {
          const sel = suggestions[selectedIndex];
          setQuery(sel);
          submit(sel);
        } else {
          submit();
        }
        break;
      case "Escape":
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const hasDropdown = showDropdown && suggestions.length > 0;

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div
        className={`
          flex items-center bg-white border
          ${hasDropdown
            ? "border-gray-200 shadow-lg rounded-t-3xl border-b-0"
            : `border-gray-200 rounded-full ${isHome ? "shadow-sm hover:shadow-md" : "shadow-sm"}`
          }
          transition-shadow
        `}
      >
        {/* Search icon */}
        <div className="pl-4 pr-2 flex-shrink-0">
          <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
          placeholder="Search MySearch or type a URL"
          className={`flex-1 bg-transparent outline-none text-base ${isHome ? "py-3.5" : "py-2.5"}`}
          autoComplete="off"
          autoFocus={isHome}
        />

        {/* Clear button */}
        {query && (
          <>
            <button
              onClick={() => {
                setQuery("");
                setSuggestions([]);
                inputRef.current?.focus();
              }}
              className="p-2 text-gray-400 hover:text-gray-600 flex-shrink-0"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="w-px h-6 bg-gray-300 mx-1 flex-shrink-0" />
          </>
        )}

        {/* Blue search button */}
        <button onClick={() => submit()} className="px-3 pr-4 flex-shrink-0">
          <svg className="w-6 h-6 text-blue-500 hover:text-blue-600" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
          </svg>
        </button>
      </div>

      {/* ─── Dropdown ─── */}
      {hasDropdown && (
        <div className="absolute z-50 w-full bg-white border border-t-0 border-gray-200 rounded-b-3xl shadow-lg overflow-hidden">
          <div className="border-t border-gray-100 mx-3" />

          {suggestions.map((text, i) => (
            <button
              key={i}
              onClick={() => { setQuery(text); submit(text); }}
              className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-colors
                ${i === selectedIndex ? "bg-gray-100" : "hover:bg-gray-50"}`}
            >
              <svg className="w-4 h-4 text-gray-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="text-sm">{text}</span>
            </button>
          ))}

          {/* Bottom padding */}
          <div className="h-2" />
        </div>
      )}
    </div>
  );
}
