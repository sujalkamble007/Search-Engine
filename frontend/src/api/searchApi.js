import axios from "axios";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const api = axios.create({
  baseURL: BASE,
  timeout: 15000,
});

/** Search documents — source: "local" | "wiki" | "all" */
export const search = (q, page = 0, size = 10, source = "wiki") =>
  api.get("/search", { params: { q, page, size, source } });

/** Rich autocomplete — returns { local: string[], wiki: [{title,description,url}] } */
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

/** Search Wikipedia directly */
export const searchWiki = (q, page = 0, size = 10) =>
  api.get("/wiki/search", { params: { q, page, size } });

/** Get Wikipedia article summary */
export const getWikiSummary = (title) =>
  api.get("/wiki/summary", { params: { title } });

/** Health check */
export const healthCheck = () => api.get("/health");

export default api;
