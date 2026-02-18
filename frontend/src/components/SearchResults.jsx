export default function SearchResults({ results, onResultClick, query }) {
  if (!results || results.length === 0) return null;

  const highlightText = (text, q) => {
    if (!text || !q) return text;
    const terms = q.toLowerCase().split(/\s+/).filter((t) => t.length > 2);
    if (!terms.length) return text;
    const escaped = terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    const regex = new RegExp(`(${escaped.join("|")})`, "gi");
    return text.split(regex).map((part, i) =>
      terms.some((t) => part.toLowerCase() === t) ? (
        <mark
          key={i}
          style={{
            background: "var(--accent-subtle)",
            color: "var(--accent)",
            padding: "0 2px",
            borderRadius: "2px",
            fontWeight: 600,
          }}
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const truncate = (t, max = 280) =>
    !t ? "" : t.length <= max ? t : t.substring(0, max).trim() + "…";

  const getBreadcrumb = (url) => {
    try {
      const u = new URL(url);
      const parts = [
        u.hostname,
        ...u.pathname.split("/").filter(Boolean).map((p) =>
          decodeURIComponent(p).replace(/_/g, " ")
        ),
      ];
      return parts;
    } catch {
      return [url];
    }
  };

  return (
    <div className="space-y-8 fade-in">
      {results.map((doc, idx) => {
        const crumbs = getBreadcrumb(doc.url);
        const isWiki = doc.url?.includes("wikipedia.org");

        return (
          <article
            key={doc.id}
            className="result-link group cursor-pointer max-w-[580px] transition-opacity hover:opacity-80"
            onClick={() => onResultClick(doc)}
            style={{ animationDelay: `${idx * 40}ms` }}
          >
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 mb-1.5">
              <div
                className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-mono flex-shrink-0"
                style={{
                  background: isWiki ? "var(--bg-tertiary)" : "var(--bg-secondary)",
                  color: "var(--text-tertiary)",
                }}
              >
                {isWiki ? "W" : crumbs[0]?.[0]?.toUpperCase() || "?"}
              </div>
              <div
                className="text-[12px] font-mono truncate"
                style={{ color: "var(--text-tertiary)" }}
              >
                {crumbs.map((c, i) => (
                  <span key={i}>
                    {i > 0 && (
                      <span style={{ color: "var(--text-muted)", margin: "0 4px" }}>/</span>
                    )}
                    {c}
                  </span>
                ))}
              </div>
            </div>

            {/* Title */}
            <h3
              className="text-[17px] leading-snug font-medium mb-1 group-hover:underline decoration-1 underline-offset-2"
              style={{ color: "var(--link)" }}
            >
              {doc.title || "Untitled"}
            </h3>

            {/* Snippet */}
            <p className="text-[13px] leading-[1.7]" style={{ color: "var(--text-secondary)" }}>
              {doc.wordCount > 0 && (
                <span className="font-mono text-[11px] mr-1.5" style={{ color: "var(--text-muted)" }}>
                  {doc.wordCount.toLocaleString()} words ·
                </span>
              )}
              {highlightText(truncate(doc.rawContent, 300), query)}
            </p>
          </article>
        );
      })}
    </div>
  );
}
