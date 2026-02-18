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
      } catch { /* ignore */ }
    }, 200);
    return () => clearTimeout(timer.current);
  }, [query]);

  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target))
        setShowDropdown(false);
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
        } else submit();
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
        className="flex items-center transition-all"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-primary)",
          borderRadius: hasDropdown ? "12px 12px 0 0" : "12px",
          borderBottom: hasDropdown ? "none" : undefined,
          boxShadow: isHome
            ? `0 2px 16px var(--shadow)`
            : `0 1px 4px var(--shadow)`,
        }}
      >
        {/* Search icon */}
        <div className="pl-4 pr-2 flex-shrink-0">
          <svg
            className="w-[18px] h-[18px]"
            style={{ color: "var(--text-muted)" }}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
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
          placeholder={isHome ? "search anything…" : "search…"}
          className="flex-1 bg-transparent outline-none"
          style={{
            color: "var(--text-primary)",
            fontSize: isHome ? "16px" : "14px",
            padding: isHome ? "14px 0" : "10px 0",
            fontFamily: "inherit",
          }}
          autoComplete="off"
          autoFocus={isHome}
        />

        {/* Clear */}
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setSuggestions([]);
              inputRef.current?.focus();
            }}
            className="p-2 flex-shrink-0 transition-opacity hover:opacity-60"
            style={{ color: "var(--text-tertiary)" }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Submit */}
        <button
          onClick={() => submit()}
          className="px-3 pr-4 flex-shrink-0 transition-opacity hover:opacity-60"
        >
          <svg
            className="w-[18px] h-[18px]"
            style={{ color: "var(--accent)" }}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Dropdown */}
      {hasDropdown && (
        <div
          className="absolute z-50 w-full overflow-hidden slide-up"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-primary)",
            borderTop: "none",
            borderRadius: "0 0 12px 12px",
            boxShadow: `0 8px 24px var(--shadow-hover)`,
          }}
        >
          <div className="mx-4" style={{ borderTop: "1px solid var(--border-secondary)" }} />

          {suggestions.map((text, i) => (
            <button
              key={i}
              onClick={() => { setQuery(text); submit(text); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors"
              style={{
                background: i === selectedIndex ? "var(--bg-secondary)" : "transparent",
                color: "var(--text-primary)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--bg-secondary)";
                setSelectedIndex(i);
              }}
              onMouseLeave={(e) => {
                if (i !== selectedIndex) e.currentTarget.style.background = "transparent";
              }}
            >
              <svg
                className="w-3.5 h-3.5 flex-shrink-0"
                style={{ color: "var(--text-muted)" }}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
              </svg>
              <span className="text-[13px] truncate">{text}</span>
            </button>
          ))}

          <div className="h-1.5" />
        </div>
      )}
    </div>
  );
}
