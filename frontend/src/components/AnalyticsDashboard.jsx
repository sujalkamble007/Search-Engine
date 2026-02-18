import { useEffect, useState } from "react";
import { getAnalytics } from "../api/searchApi";

export default function AnalyticsDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await getAnalytics();
        setData(response.data);
        setError(null);
      } catch (err) {
        setError("Failed to load analytics data");
        console.error("Analytics error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div
          className="w-5 h-5 rounded-full animate-pulse"
          style={{ background: "var(--accent)" }}
        />
        <p className="mt-4 font-mono text-[13px]" style={{ color: "var(--text-tertiary)" }}>
          loading analytics…
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="font-mono text-[13px]" style={{ color: "var(--error)" }}>
          {error}
        </p>
      </div>
    );
  }

  if (!data) return null;

  const totalSearches = data.topQueries?.reduce((sum, q) => sum + q.count, 0) || 0;
  const totalClicks = data.topClicked?.reduce((sum, q) => sum + q.clicks, 0) || 0;
  const uniqueQueries = data.topQueries?.length || 0;
  const ctr = totalSearches > 0 ? ((totalClicks / totalSearches) * 100).toFixed(1) : "0";

  return (
    <div className="mt-4 fade-in">
      <h2 className="font-display text-2xl italic mb-6" style={{ color: "var(--text-primary)" }}>
        Analytics
      </h2>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { label: "searches", value: totalSearches },
          { label: "clicks", value: totalClicks },
          { label: "unique", value: uniqueQueries },
          { label: "ctr", value: `${ctr}%` },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="rounded-lg p-4"
            style={{
              border: "1px solid var(--border-primary)",
              background: "var(--bg-card)",
            }}
          >
            <p className="font-display text-2xl italic" style={{ color: "var(--text-primary)" }}>
              {typeof value === "number" ? value.toLocaleString() : value}
            </p>
            <p
              className="text-[11px] font-mono uppercase tracking-wider mt-1"
              style={{ color: "var(--text-muted)" }}
            >
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Queries */}
        <div
          className="rounded-lg overflow-hidden"
          style={{
            border: "1px solid var(--border-primary)",
            background: "var(--bg-card)",
          }}
        >
          <div
            className="px-5 py-3"
            style={{ borderBottom: "1px solid var(--border-secondary)" }}
          >
            <h3 className="font-display text-base italic" style={{ color: "var(--text-primary)" }}>
              Top Queries
            </h3>
          </div>
          <div className="p-2">
            {data.topQueries && data.topQueries.length > 0 ? (
              data.topQueries.map((q, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-3 py-2.5 rounded-md transition-colors"
                  onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-secondary)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="text-[11px] font-mono w-5 text-center"
                      style={{ color: i < 3 ? "var(--accent)" : "var(--text-muted)" }}
                    >
                      {i + 1}
                    </span>
                    <span className="text-[13px]" style={{ color: "var(--text-primary)" }}>
                      {q.query}
                    </span>
                  </div>
                  <span
                    className="text-[11px] font-mono"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    {q.count}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-center py-8 text-[13px]" style={{ color: "var(--text-muted)" }}>
                No search data yet
              </p>
            )}
          </div>
        </div>

        {/* Top Clicks */}
        <div
          className="rounded-lg overflow-hidden"
          style={{
            border: "1px solid var(--border-primary)",
            background: "var(--bg-card)",
          }}
        >
          <div
            className="px-5 py-3"
            style={{ borderBottom: "1px solid var(--border-secondary)" }}
          >
            <h3 className="font-display text-base italic" style={{ color: "var(--text-primary)" }}>
              Most Clicked
            </h3>
          </div>
          <div className="p-2">
            {data.topClicked && data.topClicked.length > 0 ? (
              data.topClicked.map((q, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-3 py-2.5 rounded-md transition-colors"
                  onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-secondary)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="text-[11px] font-mono w-5 text-center"
                      style={{ color: i < 3 ? "var(--accent)" : "var(--text-muted)" }}
                    >
                      {i + 1}
                    </span>
                    <span className="text-[13px]" style={{ color: "var(--text-primary)" }}>
                      {q.query}
                    </span>
                  </div>
                  <span
                    className="text-[11px] font-mono"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    {q.clicks}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-center py-8 text-[13px]" style={{ color: "var(--text-muted)" }}>
                No click data yet
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
