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
        <strong key={i} className="font-bold">{part}</strong>
      ) : (
        part
      )
    );
  };

  const truncate = (t, max = 260) =>
    !t ? "" : t.length <= max ? t : t.substring(0, max).trim() + " ...";

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
    <div className="space-y-7 fade-in">
      {results.map((doc) => {
        const crumbs = getBreadcrumb(doc.url);
        const isWiki = doc.url?.includes("wikipedia.org");

        return (
          <article
            key={doc.id}
            className="result-link group cursor-pointer max-w-[600px]"
            onClick={() => onResultClick(doc)}
          >
            {/* Breadcrumb URL */}
            <div className="flex items-center gap-1.5 mb-0.5">
              {isWiki ? (
                <img
                  src="https://en.wikipedia.org/static/favicon/wikipedia.ico"
                  className="w-7 h-7 rounded-full bg-white p-0.5 border border-gray-100"
                  alt=""
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                  {crumbs[0]?.[0]?.toUpperCase() || "?"}
                </div>
              )}
              <div className="text-sm text-gray-700 truncate">
                {crumbs.map((c, i) => (
                  <span key={i}>
                    {i > 0 && <span className="mx-1 text-gray-400">›</span>}
                    {c}
                  </span>
                ))}
              </div>
            </div>

            {/* Title */}
            <h3 className="text-xl leading-snug text-[#1a0dab] group-hover:underline decoration-2 underline-offset-2 mb-0.5">
              {doc.title || "Untitled"}
            </h3>

            {/* Snippet */}
            <p className="text-sm text-[#4d5156] leading-[1.58] line-clamp-3">
              {doc.wordCount > 0 && (
                <span className="text-gray-500 mr-1">
                  {doc.wordCount.toLocaleString()} words —
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
