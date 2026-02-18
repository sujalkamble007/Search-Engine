import axios from "axios";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const api = axios.create({
  baseURL: BASE,
  timeout: 15000,
});

/** Search documents with BM25 ranking (unified — all indexed pages) */
export const search = (q, page = 0, size = 10) =>
  api.get("/search", { params: { q, page, size } });

/** Autocomplete suggestions from local Trie index */
export const autocomplete = (prefix) =>
  api.get("/autocomplete", { params: { prefix } });

/** Knowledge panel — Wikipedia article summary with image */
export const getKnowledgePanel = (q) =>
  api.get("/knowledge", { params: { q } });

/** Log a result click for analytics */
export const logClick = (query) =>
  api.post("/click", null, { params: { query } });

/** Get analytics data */
export const getAnalytics = () => api.get("/analytics");

/** Start crawling a website */
export const startCrawl = (url, domain) =>
  api.post("/crawl", null, { params: { url, domain } });

/** Crawl and index Wikipedia articles for a topic */
export const crawlWikipedia = (q, limit = 20) =>
  api.post("/crawl/wikipedia", null, { params: { q, limit } });

/** Health check */
export const healthCheck = () => api.get("/health");

export default api;
