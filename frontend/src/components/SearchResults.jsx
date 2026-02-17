export default function SearchResults({ results, onResultClick, query }) {
  if (!results || results.length === 0) {
    return null;
  }

  // Highlight matching terms in text
  const highlightText = (text, searchQuery) => {
    if (!text || !searchQuery) return text;
    
    const terms = searchQuery.toLowerCase().split(/\s+/).filter(t => t.length > 2);
    if (terms.length === 0) return text;
    
    const regex = new RegExp(`(${terms.join('|')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, i) => 
      terms.some(term => part.toLowerCase() === term) ? (
        <mark key={i} className="bg-yellow-200 px-0.5 rounded">{part}</mark>
      ) : (
        part
      )
    );
  };

  // Truncate text with ellipsis
  const truncate = (text, maxLength = 200) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + "...";
  };

  // Format URL for display
  const formatUrl = (url) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname + urlObj.pathname;
    } catch {
      return url;
    }
  };

  return (
    <div className="mt-6 space-y-4">
      {results.map((doc) => (
        <article
          key={doc.id}
          onClick={() => onResultClick(doc)}
          className="p-5 bg-white rounded-xl shadow-sm hover:shadow-md 
                     cursor-pointer transition-all duration-200 border border-gray-100
                     hover:border-blue-200 group"
        >
          {/* URL */}
          <div className="flex items-center gap-2 mb-1">
            <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
            </div>
            <p className="text-sm text-green-700 truncate max-w-md">
              {formatUrl(doc.url)}
            </p>
          </div>

          {/* Title */}
          <h2 className="text-lg font-semibold text-blue-700 group-hover:underline 
                         decoration-2 underline-offset-2 mb-2 line-clamp-2">
            {doc.title || "Untitled Page"}
          </h2>

          {/* Content Preview */}
          <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
            {highlightText(truncate(doc.rawContent, 250), query)}
          </p>

          {/* Metadata */}
          {doc.crawledAt && (
            <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Indexed: {new Date(doc.crawledAt).toLocaleDateString()}
            </p>
          )}
        </article>
      ))}
    </div>
  );
}
