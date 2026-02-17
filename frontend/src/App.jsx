import { useState, useCallback } from "react";
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
  const [searchSource, setSearchSource] = useState("wiki");
  const [showSettings, setShowSettings] = useState(false);
  const [settingsView, setSettingsView] = useState(null);

  const handleSearch = useCallback(
    async (q, p = 0, sourceOverride) => {
      if (!q.trim()) return;
      const src = sourceOverride || searchSource;

      setLoading(true);
      setQuery(q);
      setPage(p);
      setSearched(true);
      setShowSettings(false);

      const t0 = performance.now();
      try {
        const { data } = await search(q, p, 10, src);
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
    },
    [searchSource]
  );

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

  // ───────────── LOGO COMPONENT ─────────────
  const Logo = ({ size = "text-2xl" }) => (
    <button onClick={goHome} className={`${size} font-bold tracking-tight select-none`}>
      <span className="text-[#4285f4]">M</span>
      <span className="text-[#ea4335]">y</span>
      <span className="text-[#fbbc05]">S</span>
      <span className="text-[#4285f4]">e</span>
      <span className="text-[#34a853]">a</span>
      <span className="text-[#ea4335]">r</span>
      <span className="text-[#4285f4]">c</span>
      <span className="text-[#fbbc05]">h</span>
    </button>
  );

  // ═══════════════════════════════════════════
  //   HOME PAGE — Google-like centered search
  // ═══════════════════════════════════════════
  if (!searched && !showSettings) {
    return (
      <div className="min-h-screen flex flex-col">
        {/* Top-right nav */}
        <div className="flex justify-end items-center gap-3 px-4 py-3 text-sm">
          <button
            onClick={() => { setShowSettings(true); setSettingsView("crawler"); }}
            className="text-gray-700 hover:underline"
          >
            Web Crawler
          </button>
          <button
            onClick={() => { setShowSettings(true); setSettingsView("analytics"); }}
            className="text-gray-700 hover:underline"
          >
            Analytics
          </button>
          <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-medium text-sm">
            S
          </div>
        </div>

        {/* Centered content */}
        <div className="flex-1 flex flex-col items-center pt-[22vh]">
          {/* Logo */}
          <Logo size="text-[88px]" />

          {/* Search Bar */}
          <div className="w-full max-w-[584px] mt-8 px-4">
            <SearchBar onSearch={handleSearch} initialQuery="" isHome />
          </div>

          {/* Source pills */}
          <div className="flex justify-center gap-2 mt-7">
            {[
              { key: "wiki", label: "🌐 Wikipedia" },
              { key: "local", label: "💾 Local Index" },
              { key: "all", label: "🔍 All Sources" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setSearchSource(key)}
                className={`px-4 py-2 rounded-full text-sm transition-all border
                  ${searchSource === key
                    ? "bg-[#d2e3fc] border-[#d2e3fc] text-[#174ea6] font-medium"
                    : "bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300 hover:shadow-sm"
                  }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Buttons */}
          <div className="flex justify-center gap-3 mt-8">
            <button
              onClick={() => query && handleSearch(query)}
              className="px-5 py-2 bg-[#f8f9fa] text-sm text-gray-700 rounded
                         border border-[#f8f9fa] hover:border-gray-300 hover:shadow-sm transition-all"
            >
              MySearch Search
            </button>
            <button
              onClick={() =>
                window.open("https://en.wikipedia.org/wiki/Special:Random", "_blank")
              }
              className="px-5 py-2 bg-[#f8f9fa] text-sm text-gray-700 rounded
                         border border-[#f8f9fa] hover:border-gray-300 hover:shadow-sm transition-all"
            >
              I'm Feeling Lucky
            </button>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-[#f2f2f2] border-t border-gray-200 text-sm text-gray-600">
          <div className="px-6 py-3 border-b border-gray-300">India</div>
          <div className="px-6 py-3 flex flex-col sm:flex-row justify-between gap-2">
            <div className="flex gap-6">
              <span>Built with Spring Boot & React</span>
            </div>
            <div className="flex gap-6">
              <button
                onClick={() => { setShowSettings(true); setSettingsView("analytics"); }}
                className="hover:underline"
              >
                Analytics
              </button>
              <button
                onClick={() => { setShowSettings(true); setSettingsView("crawler"); }}
                className="hover:underline"
              >
                Crawler
              </button>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  //   SETTINGS PAGE (Analytics / Crawler)
  // ═══════════════════════════════════════════
  if (showSettings) {
    return (
      <div className="min-h-screen bg-white">
        <header className="border-b border-gray-200 px-6 py-3 flex items-center gap-6">
          <Logo />
          <div className="flex gap-1">
            {[
              { key: "analytics", label: "📊 Analytics" },
              { key: "crawler", label: "🕷️ Web Crawler" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setSettingsView(key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${settingsView === key
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50"
                  }`}
              >
                {label}
              </button>
            ))}
          </div>
        </header>
        <main className="max-w-4xl mx-auto py-6 px-6">
          {settingsView === "analytics" && <AnalyticsDashboard />}
          {settingsView === "crawler" && <CrawlerPanel />}
        </main>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  //   RESULTS PAGE — Google-like layout
  // ═══════════════════════════════════════════
  return (
    <div className="min-h-screen bg-white">
      {/* ─── Header ─── */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="flex items-center gap-5 px-5 py-3">
          <Logo />
          <div className="flex-1 max-w-2xl">
            <SearchBar onSearch={handleSearch} initialQuery={query} isHome={false} />
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => { setShowSettings(true); setSettingsView("analytics"); }}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              title="Analytics"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </button>
            <button
              onClick={() => { setShowSettings(true); setSettingsView("crawler"); }}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              title="Web Crawler"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-[166px]">
          {[
            { key: "wiki", label: "All" },
            { key: "local", label: "Local Index" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => {
                setSearchSource(key);
                handleSearch(query, 0, key);
              }}
              className={`flex items-center gap-1.5 px-3 pb-3 pt-1 text-sm border-b-[3px] transition-colors
                ${searchSource === key
                  ? "border-[#1a73e8] text-[#1a73e8]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
            >
              {key === "wiki" && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
              {key === "local" && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
              )}
              {label}
            </button>
          ))}
        </div>
      </header>

      {/* ─── Main ─── */}
      <main className="max-w-[1200px] mx-auto px-5 pt-5 pb-10">
        {/* Stats */}
        {!loading && totalHits > 0 && (
          <p className="text-sm text-gray-500 mb-4 pl-[146px]">
            About {totalHits.toLocaleString()} results ({searchTime} seconds)
          </p>
        )}

        {loading ? (
          <div className="flex items-center gap-3 py-16 pl-[146px]">
            <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full" />
            <span className="text-gray-500">Searching…</span>
          </div>
        ) : (
          <div className="flex gap-14">
            {/* ─── Results column ─── */}
            <div className="flex-1 pl-[146px] min-w-0">
              <SearchResults
                results={results}
                onResultClick={handleResultClick}
                query={query}
              />

              {/* No results */}
              {searched && results.length === 0 && (
                <div className="py-10">
                  <p className="text-gray-800 mb-2">
                    Your search – <strong>{query}</strong> – did not match any
                    documents.
                  </p>
                  <p className="text-sm text-gray-500 mt-4 mb-2">Suggestions:</p>
                  <ul className="text-sm text-gray-500 list-disc pl-5 space-y-1">
                    <li>Make sure all words are spelled correctly.</li>
                    <li>Try different keywords.</li>
                    <li>Try more general keywords.</li>
                    {searchSource === "local" && (
                      <li>
                        <button
                          onClick={() => {
                            setSearchSource("wiki");
                            handleSearch(query, 0, "wiki");
                          }}
                          className="text-blue-600 hover:underline"
                        >
                          Search Wikipedia instead
                        </button>
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-10">
                  <Pagination
                    page={page}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </div>

            {/* ─── Knowledge Panel (right) ─── */}
            {page === 0 && query && searchSource !== "local" && (
              <div className="hidden xl:block w-[360px] flex-shrink-0 pt-1">
                <KnowledgePanel query={query} />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
