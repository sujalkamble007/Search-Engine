import axios from "axios";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE,
  timeout: 10000,
});

/**
 * Search for documents
 * @param {string} q - Search query
 * @param {number} page - Page number (0-indexed)
 * @param {number} size - Results per page
 */
export const search = (q, page = 0, size = 10) =>
  api.get("/search", { params: { q, page, size } });

/**
 * Get autocomplete suggestions
 * @param {string} prefix - Search prefix
 */
export const autocomplete = (prefix) =>
  api.get("/autocomplete", { params: { prefix } });

/**
 * Log a result click for analytics
 * @param {string} query - The search query
 */
export const logClick = (query) =>
  api.post("/click", null, { params: { query } });

/**
 * Get analytics data (top queries and clicks)
 */
export const getAnalytics = () => api.get("/analytics");

/**
 * Start crawling a website
 * @param {string} url - Seed URL to start crawling
 * @param {string} domain - Domain to restrict crawling to
 */
export const startCrawl = (url, domain) =>
  api.post("/crawl", null, { params: { url, domain } });

/**
 * Health check
 */
export const healthCheck = () => api.get("/health");

export default api;
