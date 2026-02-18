import { useState } from "react";
import { startCrawl, crawlWikipedia } from "../api/searchApi";

export default function CrawlerPanel() {
  const [url, setUrl] = useState("");
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Wikipedia crawl state
  const [wikiQuery, setWikiQuery] = useState("");
  const [wikiLimit, setWikiLimit] = useState(20);
  const [wikiLoading, setWikiLoading] = useState(false);
  const [wikiMessage, setWikiMessage] = useState(null);

  const handleStartCrawl = async (e) => {
    e.preventDefault();

    if (!url.trim()) {
      setMessage({ type: "error", text: "Please enter a URL" });
      return;
    }

    try {
      new URL(url);
    } catch {
      setMessage({ type: "error", text: "Please enter a valid URL" });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await startCrawl(url, domain);
      setMessage({
        type: "success",
        text: `Crawling started! The crawler will index pages from ${domain || url}`,
      });
      setUrl("");
      setDomain("");
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data || "Failed to start crawling",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWikipediaCrawl = async (e) => {
    e.preventDefault();

    if (!wikiQuery.trim()) {
      setWikiMessage({ type: "error", text: "Please enter a topic" });
      return;
    }

    setWikiLoading(true);
    setWikiMessage(null);

    try {
      const { data } = await crawlWikipedia(wikiQuery, wikiLimit);
      setWikiMessage({
        type: "success",
        text: data.message || `Indexing Wikipedia articles for "${wikiQuery}"`,
      });
      setWikiQuery("");
    } catch (error) {
      setWikiMessage({
        type: "error",
        text: error.response?.data || "Failed to start Wikipedia indexing",
      });
    } finally {
      setWikiLoading(false);
    }
  };

  // Auto-extract domain from URL
  const handleUrlChange = (value) => {
    setUrl(value);
    try {
      const urlObj = new URL(value);
      setDomain(urlObj.hostname);
    } catch {
      // Invalid URL, don't update domain
    }
  };

  return (
    <div className="space-y-6 mt-6">
      {/* ─── Wikipedia Crawl Section ─── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-5 py-4">
          <h3 className="font-bold text-white flex items-center gap-2">
            <span className="text-xl">📚</span>
            Index Wikipedia Articles
          </h3>
          <p className="text-blue-100 text-sm mt-1">
            Search and index Wikipedia articles into your local search database
          </p>
        </div>

        <form onSubmit={handleWikipediaCrawl} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Topic
            </label>
            <input
              type="text"
              value={wikiQuery}
              onChange={(e) => setWikiQuery(e.target.value)}
              placeholder="e.g. Machine Learning, Solar System, JavaScript..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         transition-all"
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter a topic to fetch and index relevant Wikipedia articles
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of Articles (max)
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={wikiLimit}
              onChange={(e) =>
                setWikiLimit(
                  Math.min(50, Math.max(1, parseInt(e.target.value) || 1))
                )
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         transition-all"
            />
            <p className="text-xs text-gray-500 mt-1">
              How many Wikipedia articles to fetch and index (1–50)
            </p>
          </div>

          {wikiMessage && (
            <div
              className={`p-3 rounded-lg text-sm ${
                wikiMessage.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {wikiMessage.text}
            </div>
          )}

          <button
            type="submit"
            disabled={wikiLoading}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium
                       hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
                       transition-colors flex items-center justify-center gap-2"
          >
            {wikiLoading ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                Indexing…
              </>
            ) : (
              <>📚 Index Wikipedia Articles</>
            )}
          </button>
        </form>
      </div>

      {/* ─── Website Crawl Section ─── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-4">
          <h3 className="font-bold text-white flex items-center gap-2">
            <span className="text-xl">🕷️</span>
            Crawl Website
          </h3>
          <p className="text-purple-100 text-sm mt-1">
            Crawl and index pages from any website
          </p>
        </div>

        <form onSubmit={handleStartCrawl} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start URL
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://example.com/page"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg
                         focus:ring-2 focus:ring-purple-500 focus:border-transparent
                         transition-all"
            />
            <p className="text-xs text-gray-500 mt-1">
              The crawler will start from this page and follow links
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Domain Filter (optional)
            </label>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg
                         focus:ring-2 focus:ring-purple-500 focus:border-transparent
                         transition-all"
            />
            <p className="text-xs text-gray-500 mt-1">
              Only crawl pages from this domain
            </p>
          </div>

          {message && (
            <div
              className={`p-3 rounded-lg text-sm ${
                message.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-purple-600 text-white rounded-lg font-medium
                       hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed
                       transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                Starting…
              </>
            ) : (
              <>🕷️ Start Crawling</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
