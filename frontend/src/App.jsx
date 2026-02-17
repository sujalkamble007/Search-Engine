import { useState, useEffect } from "react";
import SearchBar from "./components/SearchBar";
import SearchResults from "./components/SearchResults";
import Pagination from "./components/Pagination";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import CrawlerPanel from "./components/CrawlerPanel";
import { search, logClick, healthCheck } from "./api/searchApi";

export default function App() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalHits, setTotalHits] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [view, setView] = useState("search"); // "search" | "analytics" | "crawler"
  const [apiStatus, setApiStatus] = useState("checking"); // "checking" | "online" | "offline"
  const [searchSource, setSearchSource] = useState("wiki"); // "local" | "wiki" | "all"

  // Check API health on mount
  useEffect(() => {
    const checkHealth = async () => {
      try {
        await healthCheck();
        setApiStatus("online");
      } catch {
        setApiStatus("offline");
      }
    };
    checkHealth();
  }, []);

  const handleSearch = async (q, p = 0) => {
    if (!q.trim()) return;
    
    setLoading(true);
    setQuery(q);
    setPage(p);
    setSearched(true);

    try {
      const { data } = await search(q, p, 10, searchSource);
      setResults(data.results || []);
      setTotalPages(data.totalPages || 0);
      setTotalHits(data.totalHits || 0);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
      setTotalPages(0);
      setTotalHits(0);
    } finally {
      setLoading(false);
    }
  };

  const handleResultClick = (doc) => {
    // Log the click for analytics
    logClick(query).catch(console.error);
    // Open the URL in a new tab
    window.open(doc.url, "_blank", "noopener,noreferrer");
  };

  const handlePageChange = (newPage) => {
    handleSearch(query, newPage);
    // Scroll to top of results
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <button 
            onClick={() => {
              setView("search");
              setSearched(false);
              setQuery("");
              setResults([]);
            }}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <span className="text-3xl">🔍</span>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 
                           bg-clip-text text-transparent">
              MySearch
            </h1>
          </button>

          <div className="flex items-center gap-4">
            {/* API Status Indicator */}
            <div className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full
              ${apiStatus === "online" 
                ? "bg-green-100 text-green-700" 
                : apiStatus === "offline" 
                  ? "bg-red-100 text-red-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}>
              <div className={`w-2 h-2 rounded-full ${
                apiStatus === "online" 
                  ? "bg-green-500" 
                  : apiStatus === "offline" 
                    ? "bg-red-500"
                    : "bg-yellow-500 animate-pulse"
              }`}></div>
              {apiStatus === "online" ? "API Online" : 
               apiStatus === "offline" ? "API Offline" : "Checking..."}
            </div>

            {/* Navigation */}
            <nav className="flex gap-2">
              <NavButton 
                active={view === "search"} 
                onClick={() => setView("search")}
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                }
              >
                Search
              </NavButton>
              <NavButton 
                active={view === "analytics"} 
                onClick={() => setView("analytics")}
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                }
              >
                Analytics
              </NavButton>
              <NavButton 
                active={view === "crawler"} 
                onClick={() => setView("crawler")}
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                }
              >
                Crawler
              </NavButton>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-6">
        {view === "search" && (
          <>
            {/* Hero Section (shown when no search yet) */}
            {!searched && (
              <div className="text-center py-12">
                <h2 className="text-4xl font-bold text-gray-800 mb-4">
                  Search the Web
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                  Find what you're looking for with our powerful search engine
                </p>
              </div>
            )}

            {/* Search Bar */}
            <SearchBar onSearch={handleSearch} initialQuery={query} />

            {/* Source Toggle */}
            <div className="flex items-center justify-center gap-2 mt-4">
              <span className="text-xs text-gray-500 font-medium">Search from:</span>
              {[{key: "wiki", label: "🌐 Wikipedia", color: "blue"}, 
                {key: "local", label: "💾 Local DB", color: "green"}, 
                {key: "all", label: "🔍 All", color: "purple"}].map(({key, label, color}) => (
                <button
                  key={key}
                  onClick={() => {
                    setSearchSource(key);
                    if (query) handleSearch(query, 0);
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all
                    ${searchSource === key
                      ? `bg-${color}-600 text-white shadow-md`
                      : `bg-gray-100 text-gray-600 hover:bg-gray-200`
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-500">Searching...</p>
              </div>
            )}

            {/* Results Header */}
            {!loading && searched && (
              <div className="mt-6 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  {totalHits > 0 
                    ? `Found ${totalHits.toLocaleString()} result${totalHits !== 1 ? 's' : ''} for "${query}"`
                    : `No results found for "${query}"`
                  }
                  {totalHits > 0 && (
                    <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                      searchSource === "wiki" ? "bg-blue-100 text-blue-700" :
                      searchSource === "local" ? "bg-green-100 text-green-700" :
                      "bg-purple-100 text-purple-700"
                    }`}>
                      {searchSource === "wiki" ? "Wikipedia" : searchSource === "local" ? "Local DB" : "All Sources"}
                    </span>
                  )}
                </p>
                {totalHits > 0 && (
                  <p className="text-sm text-gray-400">
                    Page {page + 1} of {totalPages}
                  </p>
                )}
              </div>
            )}

            {/* Search Results */}
            {!loading && (
              <SearchResults 
                results={results} 
                onResultClick={handleResultClick}
                query={query}
              />
            )}

            {/* No Results Message */}
            {!loading && searched && results.length === 0 && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No results found
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchSource === "local" 
                    ? "No local results. Try searching Wikipedia instead!"
                    : "Try different keywords or crawl some websites first"}
                </p>
                <div className="flex gap-3 justify-center">
                  {searchSource === "local" && (
                    <button
                      onClick={() => { setSearchSource("wiki"); handleSearch(query, 0); }}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg 
                                 hover:bg-blue-700 transition-colors"
                    >
                      🌐 Search Wikipedia
                    </button>
                  )}
                  <button
                    onClick={() => setView("crawler")}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg 
                               hover:bg-purple-700 transition-colors"
                  >
                    Add Websites to Index
                  </button>
                </div>
              </div>
            )}

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}

        {view === "analytics" && <AnalyticsDashboard />}
        
        {view === "crawler" && <CrawlerPanel />}
      </main>

      {/* Footer */}
      <footer className="mt-auto py-6 text-center text-sm text-gray-400">
        <p>MySearch Engine © {new Date().getFullYear()}</p>
        <p className="mt-1">
          Built with Spring Boot, React & Tailwind CSS
        </p>
      </footer>
    </div>
  );
}

function NavButton({ children, active, onClick, icon }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium 
                  transition-all duration-200
        ${active 
          ? "bg-blue-600 text-white shadow-md" 
          : "text-gray-600 hover:bg-gray-100"
        }`}
    >
      {icon}
      {children}
    </button>
  );
}
