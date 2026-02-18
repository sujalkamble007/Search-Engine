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
      <div
        className="rounded-lg overflow-hidden"
        style={{ border: "1px solid var(--border-primary)" }}
      >
        <div className="h-44 shimmer" />
        <div className="p-5 space-y-3">
          <div className="h-5 w-3/4 shimmer rounded" />
          <div className="h-4 w-1/2 shimmer rounded" />
          <div className="h-16 shimmer rounded" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const extract = data.extract || "";
  const shortExtract =
    extract.length > 300 ? extract.substring(0, 300) + "…" : extract;

  return (
    <div
      className="rounded-lg overflow-hidden fade-in"
      style={{
        border: "1px solid var(--border-primary)",
        background: "var(--bg-card)",
      }}
    >
      {/* Image */}
      {data.thumbnail && (
        <div
          className="w-full flex items-center justify-center p-6"
          style={{ background: "var(--bg-secondary)" }}
        >
          <img
            src={data.thumbnail}
            alt={data.title}
            className="max-h-48 rounded object-contain"
            onError={(e) => {
              e.target.parentElement.style.display = "none";
            }}
          />
        </div>
      )}

      {/* Content */}
      <div className="p-5">
        <h3
          className="font-display text-xl italic mb-0.5"
          style={{ color: "var(--text-primary)" }}
        >
          {data.title}
        </h3>

        {data.description && (
          <p
            className="text-[12px] font-mono uppercase tracking-wider mb-3"
            style={{ color: "var(--text-tertiary)" }}
          >
            {data.description}
          </p>
        )}

        <p className="text-[13px] leading-[1.8]" style={{ color: "var(--text-secondary)" }}>
          {expanded ? extract : shortExtract}
        </p>

        {extract.length > 300 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            className="text-[12px] font-mono mt-2 transition-opacity hover:opacity-60"
            style={{ color: "var(--accent)" }}
          >
            {expanded ? "— less" : "+ more"}
          </button>
        )}

        {/* Link */}
        {data.url && (
          <a
            href={data.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-mono transition-opacity hover:opacity-60"
            style={{ color: "var(--link)" }}
          >
            wikipedia ↗
          </a>
        )}
      </div>

      {/* Footer */}
      <div
        className="px-5 py-3 flex items-center gap-2"
        style={{
          background: "var(--bg-secondary)",
          borderTop: "1px solid var(--border-secondary)",
        }}
      >
        <span
          className="text-[10px] font-mono tracking-wider uppercase"
          style={{ color: "var(--text-muted)" }}
        >
          source: wikipedia
        </span>
      </div>
    </div>
  );
}
