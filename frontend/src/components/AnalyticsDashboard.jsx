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
    
    // Refresh analytics every 30 seconds
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-500">Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="text-red-500 mb-2">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="mt-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        Analytics Dashboard
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Searched Queries */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 px-5 py-4">
            <h3 className="font-bold text-white flex items-center gap-2">
              <span className="text-xl">🔥</span>
              Top Searched Queries
            </h3>
          </div>
          <div className="p-4">
            {data.topQueries && data.topQueries.length > 0 ? (
              <ul className="divide-y divide-gray-100">
                {data.topQueries.map((q, i) => (
                  <li key={i} className="flex justify-between items-center py-3 hover:bg-gray-50 px-2 rounded transition-colors">
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                        ${i === 0 ? 'bg-yellow-400 text-yellow-900' : 
                          i === 1 ? 'bg-gray-300 text-gray-700' : 
                          i === 2 ? 'bg-orange-300 text-orange-800' : 
                          'bg-gray-100 text-gray-600'}`}>
                        {i + 1}
                      </span>
                      <span className="text-gray-700 font-medium">{q.query}</span>
                    </div>
                    <span className="text-blue-600 font-semibold bg-blue-50 px-3 py-1 rounded-full text-sm">
                      {q.count} searches
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400 text-center py-8">No search data yet</p>
            )}
          </div>
        </div>

        {/* Most Clicked Results */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-5 py-4">
            <h3 className="font-bold text-white flex items-center gap-2">
              <span className="text-xl">👆</span>
              Most Clicked Results
            </h3>
          </div>
          <div className="p-4">
            {data.topClicked && data.topClicked.length > 0 ? (
              <ul className="divide-y divide-gray-100">
                {data.topClicked.map((q, i) => (
                  <li key={i} className="flex justify-between items-center py-3 hover:bg-gray-50 px-2 rounded transition-colors">
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                        ${i === 0 ? 'bg-yellow-400 text-yellow-900' : 
                          i === 1 ? 'bg-gray-300 text-gray-700' : 
                          i === 2 ? 'bg-orange-300 text-orange-800' : 
                          'bg-gray-100 text-gray-600'}`}>
                        {i + 1}
                      </span>
                      <span className="text-gray-700 font-medium">{q.query}</span>
                    </div>
                    <span className="text-green-600 font-semibold bg-green-50 px-3 py-1 rounded-full text-sm">
                      {q.clicks} clicks
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400 text-center py-8">No click data yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard 
          label="Total Queries" 
          value={data.topQueries?.reduce((sum, q) => sum + q.count, 0) || 0}
          icon="🔍"
          color="blue"
        />
        <StatCard 
          label="Total Clicks" 
          value={data.topClicked?.reduce((sum, q) => sum + q.clicks, 0) || 0}
          icon="👆"
          color="green"
        />
        <StatCard 
          label="Unique Queries" 
          value={data.topQueries?.length || 0}
          icon="📊"
          color="purple"
        />
        <StatCard 
          label="Avg CTR" 
          value={calculateCTR(data)}
          icon="📈"
          color="orange"
          suffix="%"
        />
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color, suffix = "" }) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className={`w-10 h-10 rounded-lg ${colorClasses[color]} flex items-center justify-center text-xl mb-3`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-gray-800">
        {typeof value === 'number' ? value.toLocaleString() : value}{suffix}
      </p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}

function calculateCTR(data) {
  if (!data?.topQueries || !data?.topClicked) return 0;
  
  const totalSearches = data.topQueries.reduce((sum, q) => sum + q.count, 0);
  const totalClicks = data.topClicked.reduce((sum, q) => sum + q.clicks, 0);
  
  if (totalSearches === 0) return 0;
  return ((totalClicks / totalSearches) * 100).toFixed(1);
}
