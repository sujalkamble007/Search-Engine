import { useState, useEffect, useRef } from "react";
import { autocomplete } from "../api/searchApi";

export default function SearchBar({ onSearch, initialQuery = "", isHome = false }) {
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState({ local: [], wiki: [] });
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
      setSuggestions({ local: [], wiki: [] });
      setShowDropdown(false);
      return;
    }

    timer.current = setTimeout(async () => {
      try {
        const { data } = await autocomplete(query);
        if (Array.isArray(data)) {
          setSuggestions({ local: data, wiki: [] });
        } else {
          setSuggestions({ local: data.local || [], wiki: data.wiki || [] });
        }
        const hasResults =
          (data.local?.length > 0 || data.wiki?.length > 0) ||
          (Array.isArray(data) && data.length > 0);
        setShowDropdown(hasResults);
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

  const allItems = [
    ...suggestions.local.map((s) => ({ type: "search", text: s })),
    ...suggestions.wiki.map((s) => ({
      type: "wiki",
      text: s.title,
      description: s.description,
    })),
  ];

  const submit = (text) => {
    const q = (text || query).trim();
    if (!q) return;
    setShowDropdown(false);
    onSearch(q);
  };

  const handleKeyDown = (e) => {
    if (!showDropdown || allItems.length === 0) {
      if (e.key === "Enter") submit();
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((p) => (p < allItems.length - 1 ? p + 1 : p));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((p) => (p > 0 ? p - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0) {
          const sel = allItems[selectedIndex];
          setQuery(sel.text);
          submit(sel.text);
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

  const hasDropdown = showDropdown && allItems.length > 0;

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
          onFocus={() => allItems.length > 0 && setShowDropdown(true)}
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
                setSuggestions({ local: [], wiki: [] });
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

          {/* Local suggestions */}
          {suggestions.local.map((text, i) => (
            <button
              key={`l-${i}`}
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

          {/* Divider */}
          {suggestions.local.length > 0 && suggestions.wiki.length > 0 && (
            <div className="border-t border-gray-100 mx-3" />
          )}

          {/* Wikipedia suggestions */}
          {suggestions.wiki.map((item, i) => {
            const idx = suggestions.local.length + i;
            return (
              <button
                key={`w-${i}`}
                onClick={() => { setQuery(item.title); submit(item.title); }}
                className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-colors
                  ${idx === selectedIndex ? "bg-gray-100" : "hover:bg-gray-50"}`}
              >
                {/* Wikipedia "W" icon */}
                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.09 13.119c-.936 1.932-2.217 4.548-2.853 5.728-.616 1.074-1.127.931-1.532.029-1.406-3.321-4.293-9.144-5.651-12.409-.251-.601-.441-.987-.619-1.139-.181-.15-.554-.24-1.122-.271C.103 5.033 0 4.982 0 4.898v-.455l.052-.045c.924-.005 5.401 0 5.401 0l.051.045v.434c0 .119-.075.176-.225.176l-.564.031c-.485.029-.727.164-.727.407 0 .2.107.588.321 1.164l3.96 9.019 1.666-3.436-1.266-2.734c-.716-1.506-1.186-2.428-1.408-2.768-.267-.399-.517-.626-.749-.681l-.576-.031c-.154 0-.232-.056-.232-.169v-.453l.046-.046h4.747l.046.046v.453c0 .114-.069.169-.208.169l-.496.031c-.4.017-.593.107-.593.271 0 .155.094.452.282.894l1.703 3.686 1.679-3.508c.225-.463.338-.803.338-1.016 0-.24-.186-.377-.559-.411l-.539-.031c-.162 0-.244-.049-.244-.149V4.44l.046-.046c.876 0 3.823 0 3.823 0l.051.046v.453c0 .119-.062.169-.186.169-.46.022-.77.109-.929.26-.159.153-.396.529-.713 1.13L12.09 13.12zm1.86 5.726c-.636 1.147-1.227.967-1.62.031L8.1 9.614l-.024.057 2.392 5.409c.539 1.118 1.174 2.322 1.753 3.489.476.989 1.276 1.093 1.795.076.512-.984 2.799-5.639 2.799-5.639l2.506-5.553c.234-.514.351-.859.351-1.035 0-.223-.18-.349-.539-.379l-.543-.022c-.143 0-.214-.056-.214-.169v-.453l.044-.046h4.111l.048.046v.453c0 .114-.073.169-.219.169-.469.022-.774.107-.918.254-.144.147-.374.519-.689 1.116l-4.926 10.399z"/>
                </svg>
                <div className="flex-1 min-w-0">
                  <span className="text-sm block">{item.title}</span>
                  {item.description && (
                    <span className="text-xs text-gray-500 block truncate">{item.description}</span>
                  )}
                </div>
              </button>
            );
          })}

          {/* Bottom padding */}
          <div className="h-2" />
        </div>
      )}
    </div>
  );
}
