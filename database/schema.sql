-- ══════════════════════════════════════════════════════════════════════════════
-- SEARCH ENGINE DATABASE SCHEMA
-- Run this script to create tables in PostgreSQL (Local or AWS RDS)
-- ══════════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────
-- TABLE 1: documents
-- Stores every crawled web page
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS documents (
    id            BIGSERIAL PRIMARY KEY,
    url           TEXT UNIQUE NOT NULL,
    title         VARCHAR(500),
    raw_content   TEXT,
    tokens        TEXT,
    crawled_at    TIMESTAMP DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- TABLE 2: inverted_index
-- Maps each word → which documents contain it
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS inverted_index (
    id      BIGSERIAL PRIMARY KEY,
    token   VARCHAR(255) NOT NULL,
    doc_id  BIGINT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    freq    INT DEFAULT 1
);

-- ─────────────────────────────────────────
-- TABLE 3: search_queries
-- Tracks every search made (for analytics)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS search_queries (
    id               BIGSERIAL PRIMARY KEY,
    query            VARCHAR(255) UNIQUE NOT NULL,
    count            BIGINT DEFAULT 0,
    clicks           BIGINT DEFAULT 0,
    last_searched_at TIMESTAMP DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════════════════════════
-- INDEXES (for faster search)
-- ══════════════════════════════════════════════════════════════════════════════

-- Speed up token lookups in inverted index
CREATE INDEX IF NOT EXISTS idx_token       ON inverted_index(token);
CREATE INDEX IF NOT EXISTS idx_doc_id      ON inverted_index(doc_id);
CREATE INDEX IF NOT EXISTS idx_token_doc   ON inverted_index(token, doc_id);

-- Speed up URL lookups when checking if page is already crawled
CREATE INDEX IF NOT EXISTS idx_url         ON documents(url);
CREATE INDEX IF NOT EXISTS idx_crawled_at  ON documents(crawled_at);

-- Speed up analytics sorting
CREATE INDEX IF NOT EXISTS idx_query_count  ON search_queries(count DESC);
CREATE INDEX IF NOT EXISTS idx_query_clicks ON search_queries(clicks DESC);
CREATE INDEX IF NOT EXISTS idx_query_text   ON search_queries(query);

-- ══════════════════════════════════════════════════════════════════════════════
-- GRANT PERMISSIONS (run after creating user)
-- ══════════════════════════════════════════════════════════════════════════════
-- GRANT ALL PRIVILEGES ON ALL TABLES    IN SCHEMA public TO searchuser;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO searchuser;
-- ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES    TO searchuser;
-- ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO searchuser;
