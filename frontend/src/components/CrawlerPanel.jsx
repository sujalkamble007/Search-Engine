import { useState } from "react";
import { startCrawl } from "../api/searchApi";

export default function CrawlerPanel() {
  const [url, setUrl] = useState("");
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleStartCrawl = async (e) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setMessage({ type: "error", text: "Please enter a URL" });
      return;
    }

    // Validate URL
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
        text: `Crawling started! The crawler will index pages from ${domain || url}` 
      });
      setUrl("");
      setDomain("");
    } catch (error) {
      setMessage({ 
        type: "error", 
        text: error.response?.data || "Failed to start crawling" 
      });
    } finally {
      setLoading(false);
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
    <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-4">
        <h3 className="font-bold text-white flex items-center gap-2">
          <span className="text-xl">🕷️</span>
          Web Crawler
        </h3>
        <p className="text-purple-100 text-sm mt-1">
          Add websites to the search index
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
          <div className={`p-3 rounded-lg text-sm ${
            message.type === "success" 
              ? "bg-green-50 text-green-700 border border-green-200" 
              : "bg-red-50 text-red-700 border border-red-200"
          }`}>
            {message.text}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-purple-600 text-white rounded-lg font-medium
                     hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Starting Crawler...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Start Crawling
            </>
          )}
        </button>
      </form>
    </div>
  );
}
