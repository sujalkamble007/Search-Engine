import { useState } from "react";
import { startCrawl, crawlWikipedia } from "../api/searchApi";

export default function CrawlerPanel() {
  const [url, setUrl] = useState("");
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

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
    try { new URL(url); } catch {
      setMessage({ type: "error", text: "Please enter a valid URL" });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      await startCrawl(url, domain);
      setMessage({
        type: "success",
        text: `Crawling started for ${domain || url}`,
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
        text: data.message || `Indexing articles for "${wikiQuery}"`,
      });
      setWikiQuery("");
    } catch (error) {
      setWikiMessage({
        type: "error",
        text: error.response?.data || "Failed to start indexing",
      });
    } finally {
      setWikiLoading(false);
    }
  };

  const handleUrlChange = (value) => {
    setUrl(value);
    try {
      const urlObj = new URL(value);
      setDomain(urlObj.hostname);
    } catch { /* */ }
  };

  const inputStyle = {
    background: "var(--bg-primary)",
    border: "1px solid var(--border-primary)",
    color: "var(--text-primary)",
    borderRadius: "8px",
    padding: "10px 14px",
    fontSize: "14px",
    fontFamily: "inherit",
    width: "100%",
    outline: "none",
    transition: "border-color 0.2s",
  };

  const labelStyle = {
    display: "block",
    fontSize: "12px",
    fontFamily: '"JetBrains Mono", monospace',
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "var(--text-tertiary)",
    marginBottom: "6px",
  };

  const hintStyle = {
    fontSize: "11px",
    color: "var(--text-muted)",
    marginTop: "4px",
  };

  return (
    <div className="space-y-8 mt-4 fade-in">

      {/* ─── Wikipedia ─── */}
      <section
        className="rounded-lg overflow-hidden"
        style={{
          border: "1px solid var(--border-primary)",
          background: "var(--bg-card)",
        }}
      >
        <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border-secondary)" }}>
          <h3 className="font-display text-lg italic" style={{ color: "var(--text-primary)" }}>
            Index Wikipedia Articles
          </h3>
          <p className="text-[12px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>
            Search a topic and index relevant Wikipedia articles into your database
          </p>
        </div>

        <form onSubmit={handleWikipediaCrawl} className="p-5 space-y-4">
          <div>
            <label style={labelStyle}>topic</label>
            <input
              type="text"
              value={wikiQuery}
              onChange={(e) => setWikiQuery(e.target.value)}
              placeholder="e.g. machine learning, solar system…"
              style={inputStyle}
              onFocus={(e) => e.target.style.borderColor = "var(--accent)"}
              onBlur={(e) => e.target.style.borderColor = "var(--border-primary)"}
            />
          </div>

          <div>
            <label style={labelStyle}>max articles</label>
            <input
              type="number"
              min="1"
              max="50"
              value={wikiLimit}
              onChange={(e) =>
                setWikiLimit(Math.min(50, Math.max(1, parseInt(e.target.value) || 1)))
              }
              style={inputStyle}
              onFocus={(e) => e.target.style.borderColor = "var(--accent)"}
              onBlur={(e) => e.target.style.borderColor = "var(--border-primary)"}
            />
            <p style={hintStyle}>1–50 articles will be fetched and indexed</p>
          </div>

          {wikiMessage && (
            <div
              className="text-[13px] px-4 py-3 rounded-md"
              style={{
                background: wikiMessage.type === "success" ? "var(--accent-subtle)" : "var(--bg-secondary)",
                color: wikiMessage.type === "success" ? "var(--success)" : "var(--error)",
                border: `1px solid ${wikiMessage.type === "success" ? "var(--success)" : "var(--error)"}`,
                opacity: 0.9,
              }}
            >
              {wikiMessage.text}
            </div>
          )}

          <button
            type="submit"
            disabled={wikiLoading}
            className="w-full py-2.5 rounded-md text-[13px] font-mono transition-all flex items-center justify-center gap-2"
            style={{
              background: "var(--accent)",
              color: "#fff",
              opacity: wikiLoading ? 0.6 : 1,
              cursor: wikiLoading ? "not-allowed" : "pointer",
            }}
            onMouseEnter={(e) => !wikiLoading && (e.target.style.background = "var(--accent-hover)")}
            onMouseLeave={(e) => (e.target.style.background = "var(--accent)")}
          >
            {wikiLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                indexing…
              </>
            ) : (
              "index articles"
            )}
          </button>
        </form>
      </section>

      {/* ─── Website Crawler ─── */}
      <section
        className="rounded-lg overflow-hidden"
        style={{
          border: "1px solid var(--border-primary)",
          background: "var(--bg-card)",
        }}
      >
        <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border-secondary)" }}>
          <h3 className="font-display text-lg italic" style={{ color: "var(--text-primary)" }}>
            Crawl Website
          </h3>
          <p className="text-[12px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>
            Crawl and index pages from any website
          </p>
        </div>

        <form onSubmit={handleStartCrawl} className="p-5 space-y-4">
          <div>
            <label style={labelStyle}>start url</label>
            <input
              type="text"
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://example.com/page"
              style={inputStyle}
              onFocus={(e) => e.target.style.borderColor = "var(--accent)"}
              onBlur={(e) => e.target.style.borderColor = "var(--border-primary)"}
            />
            <p style={hintStyle}>the crawler will start from this page and follow links</p>
          </div>

          <div>
            <label style={labelStyle}>domain filter</label>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="example.com"
              style={inputStyle}
              onFocus={(e) => e.target.style.borderColor = "var(--accent)"}
              onBlur={(e) => e.target.style.borderColor = "var(--border-primary)"}
            />
            <p style={hintStyle}>only crawl pages from this domain</p>
          </div>

          {message && (
            <div
              className="text-[13px] px-4 py-3 rounded-md"
              style={{
                background: message.type === "success" ? "var(--accent-subtle)" : "var(--bg-secondary)",
                color: message.type === "success" ? "var(--success)" : "var(--error)",
                border: `1px solid ${message.type === "success" ? "var(--success)" : "var(--error)"}`,
                opacity: 0.9,
              }}
            >
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-md text-[13px] font-mono transition-all flex items-center justify-center gap-2"
            style={{
              background: "var(--text-primary)",
              color: "var(--bg-primary)",
              opacity: loading ? 0.6 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
            onMouseEnter={(e) => !loading && (e.target.style.opacity = "0.8")}
            onMouseLeave={(e) => (e.target.style.opacity = loading ? "0.6" : "1")}
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                starting…
              </>
            ) : (
              "start crawl"
            )}
          </button>
        </form>
      </section>
    </div>
  );
}
