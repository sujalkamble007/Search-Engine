import { useEffect, useState, useMemo } from "react";
import { getAnalytics } from "../api/searchApi";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, CartesianGrid,
} from "recharts";

/* ── Theming helper ────────────────────────────── */
const cssVar = (name) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

const useThemeColors = () => {
  const [colors, setColors] = useState({});
  useEffect(() => {
    const update = () =>
      setColors({
        accent: cssVar("--accent"),
        accentSubtle: cssVar("--accent-subtle"),
        textPrimary: cssVar("--text-primary"),
        textSecondary: cssVar("--text-secondary"),
        textTertiary: cssVar("--text-tertiary"),
        textMuted: cssVar("--text-muted"),
        bgCard: cssVar("--bg-card"),
        bgSecondary: cssVar("--bg-secondary"),
        border: cssVar("--border-primary"),
        link: cssVar("--link"),
        success: cssVar("--success"),
        error: cssVar("--error"),
      });
    update();
    const obs = new MutationObserver(update);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);
  return colors;
};

/* ── Custom Recharts tooltip ───────────────────── */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-lg px-3 py-2 shadow-lg"
      style={{
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-primary)",
      }}
    >
      <p className="font-mono text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>
        {label}
      </p>
      {payload.map((p, i) => (
        <p key={i} className="text-[12px] font-mono" style={{ color: p.color }}>
          {p.name}: <span style={{ color: "var(--text-primary)" }}>{p.value?.toLocaleString()}</span>
        </p>
      ))}
    </div>
  );
};

/* ── Card wrapper ──────────────────────────────── */
const Card = ({ children, className = "" }) => (
  <div
    className={`rounded-xl p-5 ${className}`}
    style={{
      border: "1px solid var(--border-primary)",
      background: "var(--bg-card)",
    }}
  >
    {children}
  </div>
);

const CardTitle = ({ children }) => (
  <h3 className="font-display text-base italic mb-4" style={{ color: "var(--text-primary)" }}>
    {children}
  </h3>
);

/* ═══════════════════════════════════════════════ */
export default function AnalyticsDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const tc = useThemeColors();

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

  /* ── Derived data ── */
  const stats = useMemo(() => {
    if (!data) return null;
    return {
      totalSearches: data.totalSearches ?? data.topQueries?.reduce((s, q) => s + q.count, 0) ?? 0,
      totalClicks: data.totalClicks ?? data.topClicked?.reduce((s, q) => s + q.clicks, 0) ?? 0,
      uniqueQueries: data.uniqueQueries ?? data.topQueries?.length ?? 0,
      totalDocuments: data.totalDocuments ?? 0,
      totalIndexEntries: data.totalIndexEntries ?? 0,
      ctr: data.ctr ?? 0,
    };
  }, [data]);

  const pieData = useMemo(() => {
    if (!stats) return [];
    return [
      { name: "Clicked", value: stats.totalClicks },
      { name: "Unclicked", value: Math.max(stats.totalSearches - stats.totalClicks, 0) },
    ];
  }, [stats]);

  const activityTimeline = useMemo(() => {
    if (!data?.activityTimeline) return [];
    return data.activityTimeline.map((d) => ({
      ...d,
      label: d.date.slice(5), // "MM-DD"
    }));
  }, [data]);

  const searchVsClicks = useMemo(() => data?.searchVsClicks || [], [data]);

  /* ── Loading / Error states ── */
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-5 h-5 rounded-full animate-pulse" style={{ background: "var(--accent)" }} />
        <p className="mt-4 font-mono text-[13px]" style={{ color: "var(--text-tertiary)" }}>
          loading analytics…
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="font-mono text-[13px]" style={{ color: "var(--error)" }}>{error}</p>
      </div>
    );
  }

  if (!data) return null;

  const PIE_COLORS = [tc.accent || "#c9644a", tc.textMuted || "#aaa"];

  /* ═══════════════════════════════════════════════ */
  return (
    <div className="mt-4 fade-in space-y-6">
      {/* ── Header ── */}
      <div className="flex items-end justify-between">
        <h2 className="font-display text-2xl italic" style={{ color: "var(--text-primary)" }}>
          Analytics
        </h2>
        <p className="font-mono text-[11px]" style={{ color: "var(--text-muted)" }}>
          auto-refreshes every 30s
        </p>
      </div>

      {/* ── Stat Cards ─────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "searches", value: stats.totalSearches },
          { label: "clicks", value: stats.totalClicks },
          { label: "unique queries", value: stats.uniqueQueries },
          { label: "ctr", value: `${stats.ctr}%` },
          { label: "documents", value: stats.totalDocuments },
          { label: "index entries", value: stats.totalIndexEntries },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="rounded-xl p-4"
            style={{
              border: "1px solid var(--border-primary)",
              background: "var(--bg-card)",
            }}
          >
            <p className="font-display text-2xl italic" style={{ color: "var(--text-primary)" }}>
              {typeof value === "number" ? value.toLocaleString() : value}
            </p>
            <p
              className="text-[10px] font-mono uppercase tracking-wider mt-1"
              style={{ color: "var(--text-muted)" }}
            >
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* ── Row: Activity Timeline + CTR Pie ───── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area chart — search activity (30 days) */}
        <Card className="lg:col-span-2">
          <CardTitle>Search Activity — Last 30 Days</CardTitle>
          {activityTimeline.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={activityTimeline} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={tc.accent} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={tc.accent} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={tc.border} opacity={0.5} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fontFamily: "JetBrains Mono", fill: tc.textMuted }}
                  axisLine={{ stroke: tc.border }}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 10, fontFamily: "JetBrains Mono", fill: tc.textMuted }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="searches"
                  stroke={tc.accent}
                  strokeWidth={2}
                  fill="url(#areaGrad)"
                  name="Searches"
                  dot={false}
                  activeDot={{ r: 4, fill: tc.accent }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center py-12 font-mono text-[13px]" style={{ color: "var(--text-muted)" }}>
              No activity data yet
            </p>
          )}
        </Card>

        {/* Pie chart — CTR */}
        <Card>
          <CardTitle>Click-Through Rate</CardTitle>
          {stats.totalSearches > 0 ? (
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <p className="font-display text-3xl italic -mt-2" style={{ color: "var(--accent)" }}>
                {stats.ctr}%
              </p>
              <p className="font-mono text-[10px] uppercase tracking-wider mt-1" style={{ color: "var(--text-muted)" }}>
                of searches result in clicks
              </p>
            </div>
          ) : (
            <p className="text-center py-12 font-mono text-[13px]" style={{ color: "var(--text-muted)" }}>
              No data yet
            </p>
          )}
        </Card>
      </div>

      {/* ── Row: Bar chart — Searches vs Clicks ── */}
      {searchVsClicks.length > 0 && (
        <Card>
          <CardTitle>Searches vs Clicks — Top Queries</CardTitle>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={searchVsClicks} margin={{ top: 5, right: 10, left: -20, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={tc.border} opacity={0.5} />
              <XAxis
                dataKey="query"
                tick={{ fontSize: 10, fontFamily: "JetBrains Mono", fill: tc.textMuted }}
                axisLine={{ stroke: tc.border }}
                tickLine={false}
                angle={-35}
                textAnchor="end"
                interval={0}
              />
              <YAxis
                tick={{ fontSize: 10, fontFamily: "JetBrains Mono", fill: tc.textMuted }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="searches" name="Searches" fill={tc.accent || "#c9644a"} radius={[4, 4, 0, 0]} barSize={24} />
              <Bar dataKey="clicks" name="Clicks" fill={tc.link || "#3d5a80"} radius={[4, 4, 0, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-6 mt-2">
            <span className="flex items-center gap-2 font-mono text-[11px]" style={{ color: "var(--text-tertiary)" }}>
              <span className="w-3 h-3 rounded-sm" style={{ background: tc.accent }} /> searches
            </span>
            <span className="flex items-center gap-2 font-mono text-[11px]" style={{ color: "var(--text-tertiary)" }}>
              <span className="w-3 h-3 rounded-sm" style={{ background: tc.link }} /> clicks
            </span>
          </div>
        </Card>
      )}

      {/* ── Row: Top Tables ────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Queries */}
        <Card>
          <CardTitle>Top Queries</CardTitle>
          {data.topQueries && data.topQueries.length > 0 ? (
            <div className="space-y-0.5">
              {data.topQueries.map((q, i) => {
                const maxCount = data.topQueries[0]?.count || 1;
                const pct = (q.count / maxCount) * 100;
                return (
                  <div key={i} className="relative rounded-md overflow-hidden px-3 py-2.5">
                    {/* Bar background */}
                    <div
                      className="absolute inset-y-0 left-0 rounded-md transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        background: "var(--accent-subtle)",
                        opacity: 0.6,
                      }}
                    />
                    <div className="relative flex items-center justify-between">
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
                      <span className="text-[11px] font-mono" style={{ color: "var(--text-tertiary)" }}>
                        {q.count}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center py-8 text-[13px]" style={{ color: "var(--text-muted)" }}>
              No search data yet
            </p>
          )}
        </Card>

        {/* Top Clicks */}
        <Card>
          <CardTitle>Most Clicked</CardTitle>
          {data.topClicked && data.topClicked.length > 0 ? (
            <div className="space-y-0.5">
              {data.topClicked.map((q, i) => {
                const maxClicks = data.topClicked[0]?.clicks || 1;
                const pct = (q.clicks / maxClicks) * 100;
                return (
                  <div key={i} className="relative rounded-md overflow-hidden px-3 py-2.5">
                    <div
                      className="absolute inset-y-0 left-0 rounded-md transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        background: "var(--accent-subtle)",
                        opacity: 0.6,
                      }}
                    />
                    <div className="relative flex items-center justify-between">
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
                      <span className="text-[11px] font-mono" style={{ color: "var(--text-tertiary)" }}>
                        {q.clicks}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center py-8 text-[13px]" style={{ color: "var(--text-muted)" }}>
              No click data yet
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
