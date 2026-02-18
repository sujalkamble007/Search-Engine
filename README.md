# 🔍 MySearch Engine

A **production-grade, full-stack search engine** built from scratch with **Java 21 / Spring Boot 3.4** and **React 18**. It features BFS web crawling, inverted-index construction, BM25 relevance ranking, Trie-based autocomplete, Wikipedia integration with Knowledge Panels, real-time analytics, and a pixel-perfect Google-inspired UI — all wired together with clean REST APIs and multi-environment configuration.

![Java](https://img.shields.io/badge/Java-21-orange?style=flat-square&logo=openjdk)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4.1-green?style=flat-square&logo=springboot)
![React](https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4-38B2AC?style=flat-square&logo=tailwindcss)
![Gradle](https://img.shields.io/badge/Gradle-8.x-02303A?style=flat-square&logo=gradle)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

---

## 📋 Table of Contents

- [Features](#-features)
- [Screenshots / UI Overview](#-screenshots--ui-overview)
- [Architecture](#-architecture)
  - [High-Level Architecture](#high-level-architecture)
  - [Data Flow](#data-flow)
  - [Backend Module Breakdown](#backend-module-breakdown)
  - [Frontend Component Tree](#frontend-component-tree)
- [How It Works — Deep Dive](#-how-it-works--deep-dive)
  - [1. Web Crawling Pipeline](#1-web-crawling-pipeline)
  - [2. Text Processing & Indexing](#2-text-processing--indexing)
  - [3. BM25 Search Ranking Algorithm](#3-bm25-search-ranking-algorithm)
  - [4. Trie Autocomplete](#4-trie-autocomplete)
  - [5. Wikipedia Integration](#5-wikipedia-integration)
  - [6. Analytics Tracking](#6-analytics-tracking)
  - [7. Caching Strategy](#7-caching-strategy)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
  - [Access Points](#access-points)
- [API Documentation](#-api-documentation)
  - [Search Endpoints](#search-endpoints)
  - [Autocomplete Endpoint](#autocomplete-endpoint)
  - [Knowledge Panel Endpoint](#knowledge-panel-endpoint)
  - [Crawler Endpoints](#crawler-endpoints)
  - [Wikipedia Endpoints](#wikipedia-endpoints)
  - [Analytics Endpoints](#analytics-endpoints)
  - [Utility Endpoints](#utility-endpoints)
- [Project Structure](#-project-structure)
- [Configuration](#-configuration)
  - [Environment Profiles](#environment-profiles)
  - [Environment Variables](#environment-variables)
  - [Application Properties](#application-properties)
- [Database Schema](#-database-schema)
- [Deployment](#-deployment)
  - [Docker](#docker)
  - [AWS Architecture](#aws-architecture)
- [Testing](#-testing)
- [Contributing](#-contributing)
- [License](#-license)
- [Acknowledgments](#-acknowledgments)

---

## ✨ Features

### 🕷️ Web Crawler
- **BFS traversal** starting from any seed URL
- Domain-boundary enforcement — stays within the target website
- Configurable crawl delay (default 1 s) and page limit (default 100)
- Polite crawling with custom `User-Agent` header
- Automatic link extraction and duplicate URL detection
- Background crawling via async thread (non-blocking API)

### 🔎 Search Engine
- **BM25 (Okapi) ranking** — the same algorithm used by Elasticsearch and Lucene
- **Inverted index** — token → {document, frequency} mappings for O(1) token lookups
- **Text processing pipeline** — lowercase normalization, special-character removal, 100+ stop-word filtering, short-word pruning, deduplication
- **Paginated results** with total hit counts
- **Search result caching** using Spring Cache (in-memory or Redis)

### ⌨️ Autocomplete
- **Trie data structure** with O(k) prefix lookups (k = prefix length)
- **Dual-source suggestions** — local Trie results + live Wikipedia OpenSearch
- Preloaded on startup from database (crawled tokens + past search queries)
- Keyboard navigation (↑ ↓ Enter Escape) with highlighted active item
- Debounced API calls (200 ms) to avoid excessive requests

### 🌐 Wikipedia Integration
- **Full-text search** via Wikipedia MediaWiki API
- **Knowledge Panel** — article summaries, descriptions, thumbnail/original images (via REST API)
- **Full article content** with categories and related links
- **OpenSearch suggestions** for autocomplete enrichment
- Paginated Wikipedia search results with the same response format as local search

### 📊 Analytics Dashboard
- Track **top 10 most searched queries** (ranked by count)
- Track **top 10 most clicked results** (ranked by clicks)
- **Click-through rate (CTR)** calculation
- Aggregate statistics: total queries, total clicks, unique queries, average CTR
- Auto-refreshing dashboard (every 30 seconds)

### 🎨 Google-Inspired UI
- **Home page** — centered logo, search bar, source pills, "I'm Feeling Lucky" button
- **Results page** — sticky header, breadcrumb URLs, highlighted query terms, word count badges
- **Knowledge Panel** (right sidebar) — Wikipedia thumbnail + summary on first page
- **Pagination** — Google-style colored "MySearch" letters + numbered page buttons
- **Responsive design** with Tailwind CSS utility classes
- Custom scrollbar, shimmer loading skeletons, fade-in animations
- Visited link color change (`#681da8`)

### ☁️ Cloud-Ready
- **AWS S3** optional upload of crawled page content
- **Redis** cache layer for search results (production profile)
- **PostgreSQL** for persistent storage (local/prod profiles)
- **H2 in-memory** database for zero-setup development
- **HikariCP** connection pooling with tuned settings per environment

---

## 🖥️ Screenshots / UI Overview

| Page | Description |
|------|-------------|
| **Home** | Google-style centered layout with colorful "MySearch" logo, search bar, source selector pills (Wikipedia / Local Index / All), and action buttons |
| **Search Results** | Sticky header with search bar, source tabs (All / Local Index), result count with timing, breadcrumb URLs, highlighted keywords, Wikipedia Knowledge Panel on the right |
| **Knowledge Panel** | Wikipedia article thumbnail, title, description, expandable extract, and source attribution |
| **Analytics** | Two-column dashboard: Top Searched Queries (🔥) and Most Clicked Results (👆), plus 4 stat cards (Total Queries, Total Clicks, Unique Queries, Avg CTR) |
| **Web Crawler** | Form to enter seed URL (auto-extracts domain), domain filter field, start button with loading spinner |

---

## 🏗️ Architecture

### High-Level Architecture

```
┌──────────────────────┐         ┌──────────────────────┐        ┌─────────────────┐
│                      │  HTTP   │                      │  JPA   │                 │
│   React Frontend     │────────▶│   Spring Boot API    │───────▶│  PostgreSQL /   │
│   (Vite + Tailwind)  │  :5173  │   (REST Controllers) │  :5432 │  H2 Database    │
│                      │◀────────│                      │◀───────│                 │
└──────────────────────┘  JSON   └──────────┬───────────┘        └─────────────────┘
                                            │
                              ┌─────────────┼──────────────┐
                              │             │              │
                              ▼             ▼              ▼
                    ┌──────────────┐ ┌────────────┐ ┌──────────────┐
                    │  Redis Cache │ │  AWS S3    │ │  Wikipedia   │
                    │  (Optional)  │ │ (Optional) │ │  REST API    │
                    └──────────────┘ └────────────┘ └──────────────┘
```

### Data Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│ CRAWLING PIPELINE                                                       │
│                                                                         │
│  Seed URL ──▶ BFS Queue ──▶ Jsoup Fetch ──▶ TextProcessor              │
│                                               │                         │
│               ┌───────────────────────────────┤                         │
│               ▼               ▼               ▼              ▼          │
│          Save Document   Upload to S3   Build Inverted   Feed Trie     │
│          (PostgreSQL)    (if enabled)   Index entries    (autocomplete) │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ SEARCH PIPELINE                                                         │
│                                                                         │
│  User Query ──▶ TextProcessor ──▶ BM25Scorer ──▶ Ranked Doc IDs        │
│                (clean+tokenize)   (IDF × TF)     │                      │
│                                                   ▼                     │
│                                            Paginate ──▶ Fetch Docs      │
│                                                         ──▶ JSON        │
│                                                         ──▶ Log Query   │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ AUTOCOMPLETE PIPELINE                                                   │
│                                                                         │
│  Prefix ──▶ Trie DFS (local suggestions, max 10)                       │
│         ──▶ Wikipedia OpenSearch API (if prefix ≥ 2 chars)              │
│         ──▶ Merged response { local: [...], wiki: [...] }              │
└─────────────────────────────────────────────────────────────────────────┘
```

### Backend Module Breakdown

| Package | Responsibility |
|---------|---------------|
| `model/` | JPA entities: `Document`, `InvertedIndex`, `SearchQuery` |
| `repository/` | Spring Data JPA interfaces with custom JPQL queries |
| `config/` | CORS (`WebConfig`), Redis cache (`RedisConfig`), AWS S3 client (`AwsS3Config`) |
| `crawler/` | `WebCrawler` (BFS engine) + `CrawlerService` (page processing orchestrator) |
| `indexer/` | `TextProcessor` (clean/tokenize/stop-words) + `IndexerService` (inverted index builder) |
| `search/` | `BM25Scorer` (ranking algorithm) + `SearchService` (orchestration) + `SearchController` (REST API) |
| `autocomplete/` | `TrieNode` (data structure) + `AutocompleteService` (insert/search/load from DB) |
| `wikipedia/` | `WikipediaService` (MediaWiki + REST API client) + `WikipediaController` (REST endpoints) |
| `analytics/` | `AnalyticsService` (query/click logging) + `AnalyticsController` (REST endpoint) |

### Frontend Component Tree

```
App.jsx (state management + routing between 3 views: Home / Results / Settings)
├── SearchBar.jsx          — Input with dual autocomplete dropdown (local + Wikipedia)
├── SearchResults.jsx      — Result cards with breadcrumbs, title highlighting, snippets
├── KnowledgePanel.jsx     — Wikipedia summary sidebar with image + expandable extract
├── Pagination.jsx         — Google-style colored page navigation
├── AnalyticsDashboard.jsx — Top queries + top clicks tables + 4 stat cards (auto-refresh)
└── CrawlerPanel.jsx       — Seed URL input form with domain auto-extraction
```

---

## 🔬 How It Works — Deep Dive

### 1. Web Crawling Pipeline

The **`WebCrawler`** implements a classic **Breadth-First Search (BFS)** traversal:

```
Initialize: visited = {}, queue = [seedUrl]

While queue is not empty AND visited.size < MAX_PAGES (100):
    url = queue.poll()
    if url ∈ visited or url ∉ targetDomain → skip
    visited.add(url)
    page = Jsoup.connect(url).get()          // HTTP fetch with 5s timeout
    CrawlerService.processPage(url, page)    // Extract, tokenize, index, store
    for each <a href> link in page:
        if link ∉ visited AND link ∈ domain → queue.add(link)
    Thread.sleep(1000)                       // Polite 1-second delay
```

The **`CrawlerService`** then processes each page through 5 stages:
1. **Deduplication** — Checks `docRepo.existsByUrl(url)` to skip already-indexed pages
2. **Content extraction** — Extracts `<title>` and `<body>` text via Jsoup DOM traversal
3. **Text cleaning** — Passes body text through `TextProcessor.clean()` → `tokenize()`
4. **Persistence** — Saves a `Document` entity (url, title, rawContent, tokens, timestamp) to the database
5. **S3 upload** — Optionally uploads raw content to AWS S3 under `pages/{docId}` key (when `aws.s3.enabled=true`)
6. **Inverted index** — Calls `IndexerService.index(doc)` to build token → document + frequency mappings
7. **Autocomplete** — Feeds each individual token into the Trie via `AutocompleteService.insert()`

### 2. Text Processing & Indexing

**`TextProcessor`** applies a three-stage NLP pipeline:

| Stage | Method | What It Does |
|-------|--------|-------------|
| **Clean** | `clean(raw)` | Lowercase → remove non-alphanumeric chars → collapse whitespace → trim |
| **Tokenize** | `tokenize(cleaned)` | Split on whitespace → filter words ≤ 2 chars → remove 100+ English stop words → deduplicate |
| **To List** | `toList(tokens)` | Convert space-delimited token string to `List<String>` for BM25 |

**Stop words removed** (100+ words): *the, is, in, at, of, a, an, and, or, to, it, this, that, was, for, on, are, with, about, after, because, before, between, could, should, would, people, through, time, world, year, ...*

**`IndexerService`** builds the inverted index for each document:
1. Splits the document's token string into individual terms
2. Counts the **frequency** of each token using Java Streams (`groupingBy` + `counting`)
3. Persists each `{token, document_id, frequency}` tuple as an `InvertedIndex` entity with a database index on `token` for fast lookups

### 3. BM25 Search Ranking Algorithm

The **`BM25Scorer`** implements the [Okapi BM25](https://en.wikipedia.org/wiki/Okapi_BM25) information retrieval formula, the same algorithm powering Elasticsearch and Apache Lucene:

**Formula:**

```
score(D, Q) = Σ  IDF(t) × [ f(t,D) × (k₁ + 1) ] / [ f(t,D) + k₁ × (1 - b + b × |D| / avgdl) ]
             t∈Q
```

Where:

| Symbol | Meaning | Value |
|--------|---------|-------|
| `k₁` | Term frequency saturation parameter | `1.5` |
| `b` | Length normalization parameter | `0.75` |
| `f(t, D)` | Frequency of term `t` in document `D` | From `InvertedIndex.freq` |
| `\|D\|` | Length of document `D` (token count) | `doc.getTokens().split().length` |
| `avgdl` | Average document length across the entire corpus | Computed dynamically |
| `N` | Total number of documents | `docRepo.count()` |
| `n(t)` | Number of documents containing term `t` | `indexRepo.findByToken(t).size()` |

**IDF (Inverse Document Frequency):**

```
IDF(t) = ln( (N - n(t) + 0.5) / (n(t) + 0.5) + 1 )
```

**Search execution flow:**
1. For each query token, fetch all matching `InvertedIndex` entries (with eager-loaded `Document` via `JOIN FETCH`)
2. Calculate IDF for the token based on document frequency
3. For each document containing that token, compute the BM25 term-frequency component
4. Accumulate scores across all query tokens per document
5. Sort all documents by descending score → return ordered list of document IDs

### 4. Trie Autocomplete

The **Trie** (prefix tree) provides O(k) lookups where k = prefix length:

```
Example Trie storing: "java", "javascript", "json"

         root
        /    \
       j      ...
       |
       a ── s
       |      \
       v      o
       |       \
       a*      n*
       |
       s
       |
       c
       |
       r
       |
       i
       |
       p
       |
       t*

* = isEndOfWord
```

**Key operations:**
- **Insert** (`O(k)`): Traverse/create nodes character by character; mark leaf as `isEndOfWord`
- **Search** (`O(k + m)`): Navigate to prefix node, then DFS to collect up to **10 complete words** (m = results found)
- **Startup loading** (`@PostConstruct`): Pre-populates the Trie from:
  1. All past `SearchQuery` entries (highest priority — real user queries)
  2. All `Document` tokens (crawled content vocabulary, filtered to ≥ 3 chars)
  3. All `Document` titles (lowercased)

### 5. Wikipedia Integration

**`WikipediaService`** uses Java's built-in `HttpClient` (Java 11+) to call four Wikipedia APIs:

| API | Endpoint | Purpose |
|-----|----------|---------|
| **MediaWiki Search** | `?action=query&list=search` | Full-text search with HTML snippets, word counts, timestamps |
| **REST Summary** | `/api/rest_v1/page/summary/{title}` | Clean article extract, thumbnail, description for Knowledge Panel |
| **MediaWiki Content** | `?action=query&prop=extracts\|info\|categories\|links` | Full article text, categories, related links |
| **OpenSearch** | `?action=opensearch` | Autocomplete suggestions with descriptions and URLs |

All HTTP responses are parsed with **Jackson `ObjectMapper`**. HTML snippets from search results are cleaned by stripping tags and decoding entities. Timeouts are set to 5-15 seconds with proper error handling.

### 6. Analytics Tracking

Every user interaction is logged in the `search_queries` table:

- **`logQuery(query)`** — Finds or creates a `SearchQuery` record, increments `count`, updates `lastSearchedAt`
- **`logClick(query)`** — Finds the `SearchQuery` record, increments `clicks`
- **`getAnalytics()`** — Returns `{ topQueries: Top10ByCount, topClicked: Top10ByClicks }`

The frontend Dashboard calculates:
- **Total Queries** = sum of all query counts
- **Total Clicks** = sum of all click counts
- **Unique Queries** = number of distinct query strings
- **Average CTR** = (Total Clicks / Total Queries) × 100%

### 7. Caching Strategy

| Profile | Cache Type | TTL | Details |
|---------|-----------|-----|---------|
| `dev` / `local` | Simple (ConcurrentMap) | Unlimited | In-memory, lost on restart |
| `prod` | Redis (ElastiCache) | 10 minutes | JSON-serialized, null values excluded |

Search results are cached with the `@Cacheable` annotation using key pattern: `searchCache::{query}-{page}-{size}`. This avoids redundant BM25 scoring for repeated identical queries.

---

## 🛠️ Tech Stack

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Java | 21 (Temurin) | Programming language |
| Spring Boot | 3.4.1 | Application framework |
| Spring Data JPA | 3.4.x | ORM & repository abstraction |
| Hibernate | 6.6.4 | JPA implementation |
| Spring Cache | 3.4.x | Result caching abstraction |
| Jsoup | 1.17.2 | HTML parsing & web crawling |
| H2 Database | 2.3.x | In-memory database (dev) |
| PostgreSQL | 15+ | Persistent database (local/prod) |
| Redis | 7.x | Distributed cache (prod) |
| AWS SDK v2 | 2.25.0 | S3 object storage |
| HikariCP | 5.x | JDBC connection pooling |
| Lombok | 1.18.x | Boilerplate reduction (@Data, @NoArgsConstructor) |
| Jackson | 2.17.x | JSON parsing (Wikipedia API responses) |
| Tomcat | 10.1.34 | Embedded servlet container |

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2 | UI component library |
| Vite | 5.1 | Build tool & dev server with HMR |
| Tailwind CSS | 3.4 | Utility-first CSS framework |
| Axios | 1.6.7 | HTTP client for API calls |
| PostCSS | 8.4 | CSS processing pipeline |
| Autoprefixer | 10.4 | CSS vendor prefix automation |

### Build & Tooling

| Tool | Purpose |
|------|---------|
| Gradle 8.x (with wrapper) | Java build system, dependency management |
| npm | Frontend package management |
| Spring Profiles | Environment-specific configuration (`dev`, `local`, `prod`) |

---

## 🚀 Getting Started

### Prerequisites

| Requirement | Version | Required? | Notes |
|-------------|---------|-----------|-------|
| Java JDK | 21+ | ✅ Yes | [Download Temurin](https://adoptium.net/) |
| Node.js | 18+ | ✅ Yes | [Download](https://nodejs.org/) — includes npm |
| Git | Any | ✅ Yes | [Download](https://git-scm.com/) |
| PostgreSQL | 15+ | ❌ Optional | Only for `local` / `prod` profiles |
| Redis | 7+ | ❌ Optional | Only for `prod` profile caching |
| AWS Account | — | ❌ Optional | Only for S3 storage & production deployment |

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/sujalkamble/Search-Engine.git
   cd Search-Engine
   ```

2. **Backend — build the project** (downloads dependencies via Gradle wrapper)
   ```bash
   ./gradlew build -x test
   ```

3. **Frontend — install npm dependencies**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

### Running the Application

#### Option 1: Development Mode (Recommended — Zero External Dependencies)

Run backend and frontend in **separate terminals**:

**Terminal 1 — Spring Boot backend:**
```bash
./gradlew bootRun
```
> Starts on port **8080** with H2 in-memory database. No PostgreSQL or Redis needed.

**Terminal 2 — React frontend (Vite dev server):**
```bash
cd frontend
npm run dev
```
> Starts on port **5173** with hot-reload. API calls are proxied to `localhost:8080` via Vite config.

#### Option 2: Local PostgreSQL Profile

```bash
# 1. Create PostgreSQL database and user
psql -U postgres -f database/setup-local.sql

# 2. Apply the schema
psql -U searchuser -d searchengine -f database/schema.sql

# 3. Run with local profile
SPRING_PROFILE=local ./gradlew bootRun
```

#### Option 3: Production JAR

```bash
# Build the backend JAR
./gradlew bootJar

# Build frontend for production
cd frontend && npm run build && cd ..

# Run the production JAR
java -jar build/libs/demo-0.0.1-SNAPSHOT.jar \
  --spring.profiles.active=prod \
  --DB_HOST=your-rds-endpoint \
  --DB_USER=admin \
  --DB_PASS=secret \
  --REDIS_HOST=your-elasticache-endpoint
```

### Access Points

| Service | URL | Notes |
|---------|-----|-------|
| 🖥️ Frontend (dev) | http://localhost:5173 | Vite dev server with HMR |
| 🔌 Backend API | http://localhost:8080/api | REST endpoints |
| 🗄️ H2 Console | http://localhost:8080/h2-console | Dev profile only. JDBC URL: `jdbc:h2:mem:searchengine`, User: `sa`, Password: *(empty)* |
| ❤️ Health Check | http://localhost:8080/api/health | Returns `{"status":"UP","message":"Search Engine is running!"}` |

---

## 📚 API Documentation

### Search Endpoints

#### `GET /api/search` — Search Documents

Search across the local crawled index or Wikipedia with BM25 ranking and pagination.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `q` | string | **required** | Search query |
| `page` | int | `0` | Page number (0-indexed) |
| `size` | int | `10` | Results per page |
| `source` | string | `all` | `"local"` = crawled data only, `"wiki"` = Wikipedia only, `"all"` = both |

**Response (200 OK):**
```json
{
  "results": [
    {
      "id": 1,
      "url": "https://example.com/page",
      "title": "Example Page Title",
      "rawContent": "Cleaned page content text...",
      "tokens": "example page title content",
      "crawledAt": "2026-02-18T10:30:00"
    }
  ],
  "totalHits": 150,
  "page": 0,
  "totalPages": 15
}
```

**Example:**
```bash
curl "http://localhost:8080/api/search?q=java+programming&page=0&size=10&source=wiki"
```

---

### Autocomplete Endpoint

#### `GET /api/autocomplete` — Get Dual-Source Suggestions

Returns both local Trie matches and Wikipedia OpenSearch suggestions.

| Parameter | Type | Description |
|-----------|------|-------------|
| `prefix` | string | Prefix to search (Wikipedia suggestions require ≥ 2 chars) |

**Response (200 OK):**
```json
{
  "local": ["javascript", "java", "javafx"],
  "wiki": [
    {
      "title": "Java (programming language)",
      "description": "Object-oriented programming language",
      "url": "https://en.wikipedia.org/wiki/Java_(programming_language)"
    }
  ]
}
```

---

### Knowledge Panel Endpoint

#### `GET /api/knowledge` — Wikipedia Article Summary

Returns a rich article summary for the Knowledge Panel sidebar.

| Parameter | Type | Description |
|-----------|------|-------------|
| `q` | string | Article title to look up |

**Response (200 OK):**
```json
{
  "title": "Java (programming language)",
  "extract": "Java is a high-level, class-based, object-oriented programming language...",
  "description": "Object-oriented programming language",
  "url": "https://en.wikipedia.org/wiki/Java_(programming_language)",
  "thumbnail": "https://upload.wikimedia.org/wikipedia/en/thumb/...",
  "image": "https://upload.wikimedia.org/wikipedia/en/..."
}
```

---

### Crawler Endpoints

#### `POST /api/crawl` — Start Web Crawling

Starts a background crawl from a seed URL. Returns immediately; crawling runs asynchronously in a separate thread.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `url` | string | **required** | Starting URL to crawl |
| `domain` | string | `""` | Domain filter to restrict crawling (e.g., `example.com`) |

**Response (200 OK):**
```
"Crawling started: https://example.com"
```

**Example:**
```bash
curl -X POST "http://localhost:8080/api/crawl?url=https://example.com&domain=example.com"
```

---

### Wikipedia Endpoints

#### `GET /api/wiki/search` — Search Wikipedia Directly

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `q` | string | **required** | Search query |
| `page` | int | `0` | Page number (0-indexed) |
| `size` | int | `10` | Results per page |

**Response:** Same format as `/api/search` with `"source": "wikipedia"` field added.

#### `GET /api/wiki/summary` — Article Summary

| Parameter | Type | Description |
|-----------|------|-------------|
| `title` | string | Wikipedia article title (e.g., `Java_(programming_language)`) |

#### `GET /api/wiki/article` — Full Article Content

| Parameter | Type | Description |
|-----------|------|-------------|
| `title` | string | Wikipedia article title |

**Response includes:** full extract text, categories, related links, page ID, URL, last edited timestamp.

---

### Analytics Endpoints

#### `GET /api/analytics` — Get Analytics Dashboard Data

**Response (200 OK):**
```json
{
  "topQueries": [
    { "id": 1, "query": "java", "count": 150, "clicks": 45, "lastSearchedAt": "2026-02-18T14:20:00" }
  ],
  "topClicked": [
    { "id": 2, "query": "spring boot", "count": 80, "clicks": 62, "lastSearchedAt": "2026-02-18T14:15:00" }
  ]
}
```

#### `POST /api/click` — Log a Result Click

| Parameter | Type | Description |
|-----------|------|-------------|
| `query` | string | The search query whose result was clicked |

**Response:** `200 OK` (empty body)

---

### Utility Endpoints

#### `GET /api/health` — Health Check

**Response (200 OK):**
```json
{
  "status": "UP",
  "message": "Search Engine is running!"
}
```

---

## 📁 Project Structure

```
Search-Engine/
│
├── build.gradle                              # Gradle build config (plugins, dependencies)
├── settings.gradle                           # Root project name
├── gradlew / gradlew.bat                     # Gradle wrapper scripts (no Gradle install needed)
│
├── src/
│   ├── main/
│   │   ├── java/com/searchengine/
│   │   │   ├── SearchEngineApplication.java  # @SpringBootApplication + @EnableCaching entry point
│   │   │   │
│   │   │   ├── model/                        # ── JPA Entities ──────────────────────────
│   │   │   │   ├── Document.java             #   Crawled page (url, title, rawContent, tokens, crawledAt)
│   │   │   │   ├── InvertedIndex.java        #   Token → Document mapping with term frequency
│   │   │   │   └── SearchQuery.java          #   Search analytics (query, count, clicks, lastSearchedAt)
│   │   │   │
│   │   │   ├── repository/                   # ── Spring Data JPA Repositories ──────────
│   │   │   │   ├── DocumentRepository.java   #   existsByUrl(), findAllByIdIn()
│   │   │   │   ├── InvertedIndexRepository.java  # findByToken() with JOIN FETCH document
│   │   │   │   └── SearchQueryRepository.java    # findByQuery(), findTop10ByOrderByCountDesc()
│   │   │   │
│   │   │   ├── config/                       # ── Configuration Beans ───────────────────
│   │   │   │   ├── WebConfig.java            #   CORS mappings for /api/** endpoints
│   │   │   │   ├── RedisConfig.java          #   Redis cache config (@Profile("redis") only)
│   │   │   │   └── AwsS3Config.java          #   S3Client bean (conditional on aws.s3.enabled=true)
│   │   │   │
│   │   │   ├── crawler/                      # ── Web Crawling Module ───────────────────
│   │   │   │   ├── WebCrawler.java           #   BFS engine: queue + visited set + domain filter
│   │   │   │   └── CrawlerService.java       #   Process page: extract → clean → index → S3 → Trie
│   │   │   │
│   │   │   ├── indexer/                      # ── Text Processing & Indexing ─────────────
│   │   │   │   ├── TextProcessor.java        #   clean() + tokenize() + toList(), 100+ stop words
│   │   │   │   └── IndexerService.java       #   Build inverted index with token frequency counts
│   │   │   │
│   │   │   ├── search/                       # ── Search Engine Core ─────────────────────
│   │   │   │   ├── BM25Scorer.java           #   Okapi BM25: IDF × TF scoring with k₁=1.5, b=0.75
│   │   │   │   ├── SearchService.java        #   Orchestrate: tokenize → score → paginate → cache → log
│   │   │   │   └── SearchController.java     #   REST: /search, /autocomplete, /knowledge, /crawl, /click, /health
│   │   │   │
│   │   │   ├── autocomplete/                 # ── Autocomplete Module ────────────────────
│   │   │   │   ├── TrieNode.java             #   Node: Map<Character, TrieNode> + isEndOfWord flag
│   │   │   │   └── AutocompleteService.java  #   Insert, DFS search, @PostConstruct DB preloading
│   │   │   │
│   │   │   ├── wikipedia/                    # ── Wikipedia Integration ───────────────────
│   │   │   │   ├── WikipediaService.java     #   search(), getArticleSummary(), getArticleContent(), opensearch()
│   │   │   │   └── WikipediaController.java  #   REST: /wiki/search, /wiki/summary, /wiki/article
│   │   │   │
│   │   │   └── analytics/                    # ── Analytics Module ────────────────────────
│   │   │       ├── AnalyticsService.java     #   logQuery(), logClick(), getAnalytics()
│   │   │       └── AnalyticsController.java  #   REST: GET /analytics
│   │   │
│   │   └── resources/
│   │       ├── application.properties        # Base config: port, CORS, cache type, AWS, logging
│   │       ├── application-dev.properties    # H2 in-memory, create-drop DDL, SQL debug logging
│   │       ├── application-local.properties  # PostgreSQL localhost, HikariCP pool, update DDL
│   │       └── application-prod.properties   # AWS RDS, Redis cache, S3 enabled, batch inserts
│   │
│   └── test/java/com/searchengine/          # Unit tests (JUnit 5 + Spring Boot Test)
│       ├── autocomplete/                     # AutocompleteService tests
│       ├── indexer/                           # TextProcessor & IndexerService tests
│       └── search/                            # BM25Scorer & SearchService tests
│
├── frontend/
│   ├── package.json                          # npm dependencies: React 18, Axios, Tailwind
│   ├── vite.config.js                        # Vite config: port 5173, API proxy → :8080
│   ├── tailwind.config.js                    # Tailwind theme & content paths
│   ├── postcss.config.js                     # PostCSS: tailwindcss + autoprefixer
│   ├── index.html                            # HTML entry point
│   └── src/
│       ├── main.jsx                          # React DOM root render
│       ├── App.jsx                           # Main app: state management, 3 views (Home/Results/Settings)
│       ├── index.css                         # Tailwind imports + custom animations (shimmer, fade-in)
│       ├── api/
│       │   └── searchApi.js                  # Axios instance + all API wrapper functions
│       └── components/
│           ├── SearchBar.jsx                 # Search input + dual dropdown (local + wiki) + keyboard nav
│           ├── SearchResults.jsx             # Result cards: favicon, breadcrumb URL, highlighted snippets
│           ├── KnowledgePanel.jsx            # Wikipedia sidebar: thumbnail, extract, expandable text
│           ├── Pagination.jsx                # Google-style: colored logo + numbered buttons + prev/next
│           ├── AnalyticsDashboard.jsx        # Tables: top queries & clicks, 4 stat cards, 30s auto-refresh
│           └── CrawlerPanel.jsx              # Form: seed URL (auto-extracts domain), start button
│
├── database/
│   ├── schema.sql                            # PostgreSQL DDL: 3 tables + 8 indexes
│   ├── setup-local.sql                       # CREATE DATABASE, CREATE USER, GRANT
│   └── test-data.sql                         # Sample rows for testing
│
├── gradle/wrapper/                           # Gradle wrapper JAR + properties
├── LICENSE                                   # MIT License (Sujal Kamble, 2026)
└── README.md                                 # This file
```

---

## ⚙️ Configuration

### Environment Profiles

The application supports three Spring profiles, selected via the `SPRING_PROFILE` environment variable (defaults to `dev`):

| Profile | Database | Cache | S3 | DDL Strategy | HikariCP Pool | Use Case |
|---------|----------|-------|----|-------------|----------------|----------|
| **`dev`** (default) | H2 in-memory | Simple (ConcurrentMap) | Disabled | `create-drop` | Default | Local development, zero setup |
| **`local`** | PostgreSQL (localhost:5432) | Simple | Disabled | `update` | min=2, max=10 | Testing with persistent data |
| **`prod`** | AWS RDS PostgreSQL | Redis (ElastiCache) | Enabled | `update` | min=5, max=20, leak detection | Production deployment |

### Environment Variables

| Variable | Description | Default | Required In |
|----------|-------------|---------|-------------|
| `SPRING_PROFILE` | Active Spring profile (`dev`, `local`, `prod`) | `dev` | All |
| `DB_HOST` | PostgreSQL hostname | — | `prod` |
| `DB_PORT` | PostgreSQL port | `5432` | `prod` |
| `DB_NAME` | Database name | `searchengine` | `prod` |
| `DB_USER` | Database username | — | `prod` |
| `DB_PASS` | Database password | — | `prod` |
| `REDIS_HOST` | Redis/ElastiCache hostname | `localhost` | `prod` |
| `REDIS_PORT` | Redis port | `6379` | `prod` |
| `S3_BUCKET_NAME` | AWS S3 bucket for crawled content | `my-search-engine-data` | `prod` |
| `AWS_REGION` | AWS region | `us-east-1` | `prod` |
| `VITE_API_URL` | Backend API base URL (frontend) | `http://localhost:8080/api` | Frontend (if not using proxy) |

### Application Properties

Base configuration (`application.properties`):

```properties
server.port=8080                                       # HTTP server port
spring.application.name=Search-Engine                  # App name
allowed.origins=http://localhost:5173,...               # CORS allowed origins
spring.cache.type=simple                               # Default cache (overridden in prod → redis)
aws.s3.enabled=false                                   # S3 disabled by default
crawler.max-pages=100                                  # Max pages per crawl session
crawler.delay-ms=1000                                  # Delay between HTTP requests (ms)
crawler.user-agent=SearchEngineBot/1.0                 # Crawler User-Agent header
logging.level.com.searchengine=DEBUG                   # Application debug logging
logging.pattern.console=%d{HH:mm:ss} %-5level %logger{36} - %msg%n
```

---

## 🗄️ Database Schema

### Entity-Relationship Diagram

```
┌───────────────────────┐         ┌──────────────────────────┐
│      documents        │         │     inverted_index        │
├───────────────────────┤         ├──────────────────────────┤
│ id (PK, BIGSERIAL)    │◀───────┐│ id (PK, BIGSERIAL)       │
│ url (UNIQUE, TEXT)     │        ││ token (VARCHAR 255) [IDX] │
│ title (VARCHAR 500)    │        ││ doc_id (FK → documents)   │
│ raw_content (TEXT)     │        ││ freq (INT, DEFAULT 1)     │
│ tokens (TEXT)          │        │└──────────────────────────┘
│ crawled_at (TIMESTAMP) │        │
└───────────────────────┘        │  FK: doc_id → documents.id
         ▲                        │  ON DELETE CASCADE
         └────────────────────────┘

┌───────────────────────┐
│    search_queries      │
├───────────────────────┤
│ id (PK, BIGSERIAL)    │    (independent table — no FK)
│ query (UNIQUE, 255)   │
│ count (BIGINT, DEF 0) │
│ clicks (BIGINT, DEF 0)│
│ last_searched_at (TS)  │
└───────────────────────┘
```

### SQL Definitions

```sql
-- Table 1: Stores every crawled web page
CREATE TABLE documents (
    id            BIGSERIAL PRIMARY KEY,
    url           TEXT UNIQUE NOT NULL,
    title         VARCHAR(500),
    raw_content   TEXT,
    tokens        TEXT,
    crawled_at    TIMESTAMP DEFAULT NOW()
);

-- Table 2: Inverted index — maps each token → document with frequency
CREATE TABLE inverted_index (
    id      BIGSERIAL PRIMARY KEY,
    token   VARCHAR(255) NOT NULL,
    doc_id  BIGINT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    freq    INT DEFAULT 1
);

-- Table 3: Search analytics — tracks queries and clicks
CREATE TABLE search_queries (
    id               BIGSERIAL PRIMARY KEY,
    query            VARCHAR(255) UNIQUE NOT NULL,
    count            BIGINT DEFAULT 0,
    clicks           BIGINT DEFAULT 0,
    last_searched_at TIMESTAMP DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX idx_token       ON inverted_index(token);          -- Fast token lookups
CREATE INDEX idx_doc_id      ON inverted_index(doc_id);         -- Fast document joins
CREATE INDEX idx_token_doc   ON inverted_index(token, doc_id);  -- Composite for BM25
CREATE INDEX idx_url         ON documents(url);                  -- Duplicate URL checks
CREATE INDEX idx_crawled_at  ON documents(crawled_at);           -- Time-based queries
CREATE INDEX idx_query_count ON search_queries(count DESC);      -- Top queries sorting
CREATE INDEX idx_query_clicks ON search_queries(clicks DESC);    -- Top clicks sorting
CREATE INDEX idx_query_text  ON search_queries(query);           -- Query lookups
```

---

## 🚢 Deployment

### Docker

**Multi-stage Dockerfile:**
```dockerfile
# Stage 1: Build
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
COPY . .
RUN ./gradlew bootJar -x test

# Stage 2: Run
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

**Build & Run:**
```bash
docker build -t mysearch-engine .
docker run -p 8080:8080 \
  -e SPRING_PROFILE=prod \
  -e DB_HOST=your-rds-host \
  -e DB_USER=admin \
  -e DB_PASS=secret \
  -e REDIS_HOST=your-redis-host \
  mysearch-engine
```

**Docker Compose (full stack — PostgreSQL + Redis + App):**
```yaml
version: '3.8'
services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: searchengine
      POSTGRES_USER: searchuser
      POSTGRES_PASSWORD: search123
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./database/schema.sql:/docker-entrypoint-initdb.d/schema.sql

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  backend:
    build: .
    ports:
      - "8080:8080"
    environment:
      SPRING_PROFILE: local
      DB_HOST: db
      DB_USER: searchuser
      DB_PASS: search123
      REDIS_HOST: redis
    depends_on:
      - db
      - redis

volumes:
  pgdata:
```

### AWS Architecture

Recommended production architecture:

```
┌─────────────┐     ┌──────────────┐     ┌────────────────┐
│  Route 53   │────▶│  ALB / EC2   │────▶│  RDS           │
│  (DNS)      │     │  (Backend)   │     │  PostgreSQL 15  │
└─────────────┘     └──────┬───────┘     └────────────────┘
                           │
                 ┌─────────┼──────────┐
                 ▼                    ▼
       ┌───────────────┐    ┌───────────────┐
       │  ElastiCache  │    │  S3 Bucket    │
       │  (Redis 7)    │    │  (Page Data)  │
       └───────────────┘    └───────────────┘
```

| AWS Service | Purpose | Config |
|-------------|---------|--------|
| **EC2** / **ECS Fargate** | Run the Spring Boot JAR | t3.medium or higher |
| **RDS PostgreSQL** | Persistent document & index storage | db.t3.medium, Multi-AZ |
| **ElastiCache Redis** | Search result caching (10 min TTL) | cache.t3.micro |
| **S3** | Raw crawled page content storage | Standard storage class |
| **ALB** | Load balancing + HTTPS termination | With ACM certificate |
| **Route 53** | DNS management | A/AAAA records to ALB |

---

## 🧪 Testing

The project uses **JUnit 5** with **Spring Boot Test** for unit and integration testing.

```bash
# Run all tests
./gradlew test

# Run with verbose output
./gradlew test --info

# Run a specific test class
./gradlew test --tests "com.searchengine.search.BM25ScorerTest"

# View the HTML test report
open build/reports/tests/test/index.html
```

Test packages mirror the source structure:
- `autocomplete/` — Trie insert/search behavior
- `indexer/` — Text processing and inverted index construction
- `search/` — BM25 scoring and search orchestration

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch:
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make** your changes and ensure tests pass:
   ```bash
   ./gradlew test
   ```
4. **Commit** with a descriptive message:
   ```bash
   git commit -m "feat: add amazing feature"
   ```
5. **Push** to your fork:
   ```bash
   git push origin feature/amazing-feature
   ```
6. **Open** a Pull Request against `main`

### Development Guidelines

- Follow existing code style and package organization patterns
- Add unit tests for new functionality
- Update this README if adding new endpoints or features
- Use meaningful commit messages ([Conventional Commits](https://www.conventionalcommits.org/) preferred)
- Keep PRs focused — one feature or fix per PR

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

```
MIT License — Copyright (c) 2026 Sujal Kamble
```

---

## 🙏 Acknowledgments

- [Okapi BM25 Algorithm](https://en.wikipedia.org/wiki/Okapi_BM25) — Robertson, Walker, Jones, Hancock-Beaulieu, Gatford (1994)
- [Trie Data Structure](https://en.wikipedia.org/wiki/Trie) — Edward Fredkin (1960)
- [Jsoup](https://jsoup.org/) — HTML parsing and web scraping library for Java
- [Spring Boot](https://spring.io/projects/spring-boot) — Convention-over-configuration application framework
- [Wikipedia MediaWiki API](https://www.mediawiki.org/wiki/API:Main_page) — Search, summary, and content APIs
- [Tailwind CSS](https://tailwindcss.com/) — Utility-first CSS framework
- [Vite](https://vitejs.dev/) — Next-generation frontend build tool
- [React](https://react.dev/) — UI component library

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/sujalkamble">Sujal Kamble</a>
</p>
