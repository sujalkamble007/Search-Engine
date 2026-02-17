import { useState, useEffect } from "react";
import { getKnowledgePanel } from "../api/searchApi";

export default function KnowledgePanel({ query }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!query) return;
    setLoading(true);
    setData(null);
    setExpanded(false);

    getKnowledgePanel(query)
      .then(({ data: d }) => {
        if (d && d.title && !d.error) setData(d);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [query]);

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 overflow-hidden">
        <div className="h-48 shimmer" />
        <div className="p-5 space-y-3">
          <div className="h-6 w-3/4 shimmer rounded" />
          <div className="h-4 w-1/2 shimmer rounded" />
          <div className="h-20 shimmer rounded" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const extract = data.extract || "";
  const shortExtract =
    extract.length > 350 ? extract.substring(0, 350) + "..." : extract;

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden fade-in">
      {/* Image */}
      {data.thumbnail && (
        <div className="w-full bg-gray-50 flex items-center justify-center p-4">
          <img
            src={data.thumbnail}
            alt={data.title}
            className="max-h-56 rounded-lg object-contain"
            onError={(e) => {
              e.target.parentElement.style.display = "none";
            }}
          />
        </div>
      )}

      {/* Content */}
      <div className="p-5">
        <h3 className="text-xl font-medium text-gray-900 mb-0.5">
          {data.title}
        </h3>
        {data.description && (
          <p className="text-sm text-gray-500 mb-3 capitalize">
            {data.description}
          </p>
        )}

        <p className="text-sm text-[#4d5156] leading-relaxed">
          {expanded ? extract : shortExtract}
        </p>

        {extract.length > 350 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            className="text-blue-600 text-sm mt-2 hover:underline"
          >
            {expanded ? "Show less" : "More"}
          </button>
        )}

        {/* Wikipedia link */}
        {data.url && (
          <a
            href={data.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="mt-4 inline-flex items-center gap-1.5 text-sm text-blue-700 hover:underline"
          >
            Wikipedia
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center gap-2">
        <img
          src="https://en.wikipedia.org/static/favicon/wikipedia.ico"
          className="w-4 h-4"
          alt=""
        />
        <span className="text-xs text-gray-400">
          Data from Wikipedia, the free encyclopedia
        </span>
      </div>
    </div>
  );
}
