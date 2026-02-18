import { useState, useCallback, useEffect } from "react";
import SearchBar from "./components/SearchBar";
import SearchResults from "./components/SearchResults";
import KnowledgePanel from "./components/KnowledgePanel";
import Pagination from "./components/Pagination";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import CrawlerPanel from "./components/CrawlerPanel";
import { search, logClick } from "./api/searchApi";

export default function App() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalHits, setTotalHits] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [searchTime, setSearchTime] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsView, setSettingsView] = useState(null);
  const [theme, setTheme] = useState(() =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light"
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  const handleSearch = useCallback(async (q, p = 0) => {
    if (!q.trim()) return;
    setLoading(true);
    setQuery(q);
    setPage(p);
    setSearched(true);
    setShowSettings(false);

    const t0 = performance.now();
    try {
      const { data } = await search(q, p, 10);
      setSearchTime(((performance.now() - t0) / 1000).toFixed(2));
      setResults(data.results || []);
      setTotalPages(data.totalPages || 0);
      setTotalHits(data.totalHits || 0);
    } catch (err) {
      console.error("Search error:", err);
      setResults([]);
      setTotalPages(0);
      setTotalHits(0);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleResultClick = (doc) => {
    logClick(query).catch(() => {});
    window.open(doc.url, "_blank", "noopener,noreferrer");
  };

  const handlePageChange = (p) => {
    handleSearch(query, p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goHome = () => {
    setSearched(false);
    setQuery("");
    setResults([]);
    setTotalHits(0);
    setShowSettings(false);
    setSettingsView(null);
  };

  // ─── Theme Toggle Button ───
  const ThemeToggle = ({ className = "" }) => (
    <button
      onClick={toggleTheme}
      className={`w-8 h-8 rounded-full flex items-center justify-center
        hover:opacity-70 transition-opacity ${className}`}
      title={theme === "dark" ? "Switch to light" : "Switch to dark"}
    >
      {theme === "dark" ? (
        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="5" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      ) : (
        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );

  // ─── Logo ───
  const Logo = ({ size = "text-xl" }) => (
    <button
      onClick={goHome}
      className={`font-display ${size} tracking-tight select-none
        hover:opacity-70 transition-opacity italic`}
      style={{ color: "var(--text-primary)" }}
    >
      seek<span style={{ color: "var(--accent)" }}>.</span>
    </button>
  );

  // ═══════════════════════════════════════════
  //   HOME — Minimal centered layout
  // ═══════════════════════════════════════════
  if (!searched && !showSettings) {
    return (
      <div
        className="min-h-screen flex flex-col theme-transition"
        style={{ background: "var(--bg-primary)" }}
      >
        {/* Top bar */}
        <nav className="flex justify-end items-center gap-2 px-6 py-4">
          <button
            onClick={() => { setShowSettings(true); setSettingsView("crawler"); }}
            className="text-[13px] font-mono px-3 py-1.5 rounded-md transition-colors"
            style={{ color: "var(--text-secondary)" }}
            onMouseEnter={(e) => e.target.style.background = "var(--bg-secondary)"}
            onMouseLeave={(e) => e.target.style.background = "transparent"}
          >
            index
          </button>
          <button
            onClick={() => { setShowSettings(true); setSettingsView("analytics"); }}
            className="text-[13px] font-mono px-3 py-1.5 rounded-md transition-colors"
            style={{ color: "var(--text-secondary)" }}
            onMouseEnter={(e) => e.target.style.background = "var(--bg-secondary)"}
            onMouseLeave={(e) => e.target.style.background = "transparent"}
          >
            analytics
          </button>
          <ThemeToggle />
        </nav>

        {/* Center */}
        <div className="flex-1 flex flex-col items-center justify-center -mt-20 px-6">
          {/* Logo */}
          <h1 className="font-display text-[clamp(64px,12vw,120px)] leading-none tracking-tight select-none italic mb-2">
            <span style={{ color: "var(--text-primary)" }}>seek</span>
            <span style={{ color: "var(--accent)" }}>.</span>
          </h1>

          <p
            className="font-mono text-[11px] tracking-[0.3em] uppercase mb-10"
            style={{ color: "var(--text-tertiary)" }}
          >
            find what matters
          </p>

          {/* Search */}
          <div className="w-full max-w-[540px]">
            <SearchBar onSearch={handleSearch} initialQuery="" isHome />
          </div>

          {/* Subtle hint */}
          <div
            className="flex items-center gap-6 mt-8 text-[12px] font-mono"
            style={{ color: "var(--text-muted)" }}
          >
            <span>↵ search</span>
            <span>·</span>
            <button
              onClick={() => { setShowSettings(true); setSettingsView("crawler"); }}
              className="hover:opacity-70 transition-opacity"
              style={{ color: "var(--accent)" }}
            >
              + index pages
            </button>
          </div>
        </div>

        {/* Footer */}
        <footer
          className="py-4 text-center text-[11px] font-mono"
          style={{ color: "var(--text-muted)" }}
        >
          built with care · spring boot & react
        </footer>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  //   SETTINGS (Analytics / Crawler)
  // ═══════════════════════════════════════════
  if (showSettings) {
    return (
      <div className="min-h-screen theme-transition" style={{ background: "var(--bg-primary)" }}>
        <header
          className="sticky top-0 z-50 px-6 py-3 flex items-center gap-6 theme-transition"
          style={{
            background: "var(--bg-primary)",
            borderBottom: "1px solid var(--border-primary)",
          }}
        >
          <Logo />
          <div className="flex gap-0.5 font-mono text-[13px]">
            {[
              { key: "analytics", label: "analytics" },
              { key: "crawler", label: "index" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setSettingsView(key)}
                className="px-3 py-1.5 rounded-md transition-colors"
                style={{
                  background: settingsView === key ? "var(--accent-subtle)" : "transparent",
                  color: settingsView === key ? "var(--accent)" : "var(--text-secondary)",
                }}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex-1" />
          <ThemeToggle />
        </header>

        <main className="max-w-3xl mx-auto py-8 px-6">
          {settingsView === "analytics" && <AnalyticsDashboard />}
          {settingsView === "crawler" && <CrawlerPanel />}
        </main>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  //   RESULTS — Clean, editorial layout
  // ═══════════════════════════════════════════
  return (
    <div className="min-h-screen theme-transition" style={{ background: "var(--bg-primary)" }}>
      {/* Header */}
      <header
        className="sticky top-0 z-50 theme-transition"
        style={{
          background: "var(--bg-primary)",
          borderBottom: "1px solid var(--border-primary)",
        }}
      >
        <div className="flex items-center gap-5 px-6 py-3 max-w-[1200px] mx-auto">
          <Logo size="text-2xl" />
          <div className="flex-1 max-w-xl">
            <SearchBar onSearch={handleSearch} initialQuery={query} isHome={false} />
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => { setShowSettings(true); setSettingsView("analytics"); }}
              className="p-2 rounded-md transition-colors"
              title="Analytics"
              onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-secondary)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              <svg className="w-[18px] h-[18px]" style={{ color: "var(--text-tertiary)" }} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path d="M3 3v18h18M7 16v-3M11 16V9M15 16v-5M19 16V7" strokeLinecap="round" />
              </svg>
            </button>
            <button
              onClick={() => { setShowSettings(true); setSettingsView("crawler"); }}
              className="p-2 rounded-md transition-colors"
              title="Index Pages"
              onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-secondary)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              <svg className="w-[18px] h-[18px]" style={{ color: "var(--text-tertiary)" }} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path d="M12 4v16m-8-8h16" strokeLinecap="round" />
              </svg>
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-[1100px] mx-auto px-6 pt-6 pb-16">
        {/* Stats bar */}
        {!loading && totalHits > 0 && (
          <p
            className="text-[12px] font-mono mb-6"
            style={{ color: "var(--text-tertiary)" }}
          >
            {totalHits.toLocaleString()} results · {searchTime}s
          </p>
        )}

        {loading ? (
          <div className="flex items-center gap-3 py-20">
            <div
              className="w-4 h-4 rounded-full animate-pulse"
              style={{ background: "var(--accent)" }}
            />
            <span className="font-mono text-sm" style={{ color: "var(--text-tertiary)" }}>
              searching…
            </span>
          </div>
        ) : (
          <div className="flex gap-16">
            {/* Results column */}
            <div className="flex-1 min-w-0">
              <SearchResults
                results={results}
                onResultClick={handleResultClick}
                query={query}
              />

              {/* No results */}
              {searched && results.length === 0 && (
                <div className="py-16 fade-in">
                  <p className="font-display text-2xl italic mb-3" style={{ color: "var(--text-primary)" }}>
                    Nothing found for "<span style={{ color: "var(--accent)" }}>{query}</span>"
                  </p>
                  <ul
                    className="text-sm space-y-1.5 mt-4"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <li>· Check your spelling</li>
                    <li>· Try broader keywords</li>
                    <li>
                      ·{" "}
                      <button
                        onClick={() => { setShowSettings(true); setSettingsView("crawler"); }}
                        className="transition-opacity hover:opacity-70"
                        style={{ color: "var(--accent)" }}
                      >
                        Index new pages to expand the database
                      </button>
                    </li>
                  </ul>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12">
                  <Pagination
                    page={page}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </div>

            {/* Knowledge Panel */}
            {page === 0 && query && (
              <div className="hidden xl:block w-[320px] flex-shrink-0">
                <KnowledgePanel query={query} />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
