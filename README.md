<div align="center">

# seek.

### *a search engine, built from scratch.*

> *Ever wondered what happens in the 0.3 seconds between pressing Enter and seeing search results?*
> *I built an entire search engine to find out.*

<br>

![Java](https://img.shields.io/badge/Java_21-E34F26?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot_3.4-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![React](https://img.shields.io/badge/React_18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![License](https://img.shields.io/badge/MIT-yellow?style=for-the-badge)

<br>

**[The Story](#-the-story)** · **[How It Works](#-how-it-works)** · **[Features](#-features)** · **[Quick Start](#-quick-start)** · **[What I Learned](#-what-i-learned)** · **[API](#-api-reference)** · **[Architecture](#-architecture)**

</div>

---

<br>

## 📖 The Story

We use search engines every day — Google, Bing, DuckDuckGo. We type a few words, hit Enter, and results appear in milliseconds. It feels like magic.

**But it's not magic. It's computer science.**

I wanted to understand *every single step* of that process. Not by reading about it — by building it myself, from the ground up. No Elasticsearch. No Solr. No libraries doing the hard work for me.

**seek.** is the result — a fully functional search engine that:
- 🕷️ **Crawls** the internet (and Wikipedia) to discover pages
- 📝 **Processes** raw HTML into clean, searchable text
- 🗂️ **Indexes** every word so it can be found in milliseconds
- 🧮 **Ranks** results using the same math that powers Elasticsearch
- ⌨️ **Autocompletes** your queries as you type
- 📊 **Tracks** what people search for and click on
- 🎨 **Displays** everything in a beautiful, hand-crafted UI

Every piece — from the crawler that visits web pages, to the ranking algorithm that decides which result comes first, to the autocomplete that guesses what you're typing — is written by hand.

<br>

---

<br>

## 🧠 How It Works

*Let's walk through what happens when you search for "machine learning" on seek.*

<br>

### Step 1: You Type → Autocomplete Kicks In

The moment you start typing `"mac..."`, seek. doesn't wait. It runs your partial text through a **Trie** — a tree-shaped data structure where every branch is a letter.

```
Think of it like a dictionary that instantly flips to the right page.

You type "m" → jump to the M section
You type "ma" → narrow to MA words
You type "mac" → suggestions appear: "machine", "machine learning", "macos"
```

This lookup takes **O(k)** time — where k is just the number of characters you've typed. Whether the dictionary has 100 words or 10 million, it's equally fast.

<br>

### Step 2: You Press Enter → Text Processing

Your query `"machine learning"` goes through a cleaning pipeline:

```
"Machine  LEARNING!!!" 
    → lowercase         → "machine  learning!!!"
    → remove symbols    → "machine  learning"
    → remove stop words → "machine learning"  (no stop words here)
    → deduplicate       → ["machine", "learning"]
```

Stop words are common words like *"the", "is", "in", "a", "and"* — they appear in almost every document, so they're useless for ranking. We filter out **100+ of them**.

<br>

### Step 3: Finding Matching Pages → The Inverted Index

Now we need to find every page that contains "machine" or "learning". Scanning through thousands of full documents would be painfully slow. Instead, we use an **Inverted Index**.

```
Think of it like the index at the back of a textbook:

  "machine"  → Page 12 (5 times), Page 47 (2 times), Page 103 (8 times)
  "learning" → Page 12 (3 times), Page 47 (7 times), Page 89 (1 time)
```

Instead of reading every page to find a word, you look up the word and instantly know every page it appears on — and *how often*. This is how real search engines handle billions of pages.

<br>

### Step 4: Ranking Results → BM25 Algorithm

Finding pages is easy. The hard part is **deciding which page should come first**.

seek. uses **BM25 (Best Match 25)** — the same algorithm that powers Elasticsearch and Apache Lucene (which powers most search engines you've used).

The core idea is beautifully simple:

> **A word that appears frequently in a document but rarely in other documents is a strong signal that the document is relevant.**

The formula balances three things:

| Factor | What It Means | Example |
|--------|--------------|---------|
| **TF** (Term Frequency) | How often does the word appear in *this* document? | "machine" appears 8 times → strong signal |
| **IDF** (Inverse Document Frequency) | How rare is this word across *all* documents? | "machine" appears in 3/1000 docs → very relevant |
| **Document Length** | Is this document unusually long? | A 10,000-word doc with 8 mentions ≠ a 100-word doc with 8 mentions |

```
BM25 Score = Σ  IDF(word) × [ freq × (k₁ + 1) ] / [ freq + k₁ × (1 - b + b × docLen/avgLen) ]
```

Don't worry about the math — what matters is:
- **Rare words matter more** than common ones (IDF)
- **Repeated mentions matter**, but with diminishing returns (TF saturation)
- **Shorter documents** that mention a word are ranked higher than long ones (length normalization)

<br>

### Step 5: Page 1 of Results → The Response

The top-scoring documents are:
1. **Paginated** — 10 per page
2. **Enriched** — a Wikipedia Knowledge Panel appears alongside results
3. **Cached** — so the same search is instant next time
4. **Logged** — for analytics (what do people search for most?)

Total time: typically **under 300ms**.

<br>

---

<br>

## ✨ Features

### 🕷️ Web Crawler
*Goes to websites, reads them, and brings back the content — like a librarian visiting every library in town.*

- **Breadth-First Search** traversal from any starting URL
- Stays within the target website (won't wander off to unrelated sites)
- Polite crawling — waits 1 second between requests, identifies itself with a custom User-Agent
- Automatically discovers and follows links on each page
- Skips pages it's already visited (no duplicates)
- Runs in the background — you don't have to wait

### 🌐 Wikipedia Integration
*Search any topic and instantly index dozens of Wikipedia articles into your local search engine.*

- Type "quantum physics" and index 20+ Wikipedia articles in seconds
- Wikipedia articles are treated exactly like regular web pages — same indexing pipeline, same BM25 ranking
- **Knowledge Panel** — when you search, a rich Wikipedia summary with image appears alongside results
- Two Wikipedia APIs working together: one for discovering articles, one for rich summaries

### 🔎 Search Engine
*The brain — takes your words, finds matching pages, and ranks them by relevance.*

- **BM25 ranking** — the industry-standard algorithm
- **Inverted index** — O(1) word lookups across the entire database
- **Text processing** — cleans, normalizes, removes stop words, deduplicates
- **Pagination** — browse through hundreds of results
- **Caching** — repeated searches are instant (in-memory or Redis)

### ⌨️ Autocomplete
*Predicts what you're about to type — before you finish typing it.*

- **Trie data structure** — millisecond prefix lookups
- Built from all crawled content + past search queries
- Keyboard navigation (↑ ↓ Enter Escape)
- Debounced API calls — doesn't spam the server

### 📊 Analytics Dashboard
*See what people are searching for and what they're clicking on.*

- Top 10 most searched queries
- Top 10 most clicked results
- Click-through rate (CTR) calculation
- Auto-refreshes every 30 seconds
- Aggregate stats: total queries, total clicks, unique queries

### 🎨 Minimalist UI
*Hand-crafted design with dark and light themes.*

- **"seek."** — custom branding with serif typography
- **Dark/Light mode** — auto-detects your OS preference, toggle anytime
- **Warm, earthy palette** — terracotta accents, cream backgrounds
- Typography: Instrument Serif (headings) + Inter (body) + JetBrains Mono (code)
- Smooth page transitions, hover effects, and animations
- Fully responsive — works on all screen sizes

<br>

---

<br>

## 🚀 Quick Start

### What You Need

| Tool | Version | Why |
|------|---------|-----|
| **Java JDK** | 21+ | Backend is written in Java |
| **Node.js** | 18+ | Frontend needs npm |
| **Git** | Any | To clone the repo |

That's it. No database setup, no Redis, no Docker. The dev mode uses an in-memory database — it works out of the box.

### 3 Steps to Run

```bash
# 1. Clone it
git clone https://github.com/sujalkamble007/Search-Engine.git
cd Search-Engine

# 2. Start the backend (opens on port 8080)
./gradlew bootRun

# 3. In a new terminal — start the frontend (opens on port 5173)
cd frontend && npm install && npm run dev
```

**Open [http://localhost:5173](http://localhost:5173)** — you're running a search engine.

### First Things to Try

1. Click **"index"** → Enter a Wikipedia topic like `"artificial intelligence"` → Hit **Index Articles**
2. Go back to the home page → Search for `"artificial intelligence"`
3. Watch the autocomplete, results, and Knowledge Panel come to life
4. Click **"analytics"** to see your search history

<br>

---

<br>

## 🎓 What I Learned

Building a search engine from scratch taught me more than any tutorial ever could. Here are the biggest takeaways:

<br>

### 1. The Inverted Index Is Everything
> *The single most important data structure in information retrieval.*

Before building this, I thought searching meant "loop through every document and check if the word is there." That's O(n × m) — and it's impossibly slow at scale. The inverted index flips the problem: instead of "for each document, find the words," it's "for each word, here are the documents." This one idea is the foundation of every search engine ever built — from Google to Elasticsearch.

### 2. BM25 Is Elegant
> *The math is simple, but the intuition is deep.*

The IDF component captures something deeply intuitive: if a word appears in almost every document, it's not useful for distinguishing between them. The word "the" appears everywhere — it tells you nothing. But "quantum" appears in 3 out of 10,000 documents? That's a strong signal. BM25 encodes this intuition into a formula that "just works."

### 3. Data Structures Are Not Abstract
> *A Trie isn't just a textbook concept — it's why autocomplete feels instant.*

Before this project, data structures felt academic. After implementing a Trie that powers real-time autocomplete with thousands of entries and sub-millisecond lookups, I'll never look at them the same way. The right data structure doesn't just improve performance — it *enables* features that would otherwise be impossible.

### 4. Crawling Is a Social Contract
> *The internet works because crawlers follow rules.*

Polite crawling isn't optional — it's fundamental. Rate limiting (1 request/second), domain boundaries, duplicate detection, custom User-Agent headers — these aren't nice-to-haves, they're what separates a good crawler from a DDoS attack. Building a crawler taught me more about internet etiquette than any networking class.

### 5. Caching Changes Everything
> *The fastest query is the one you don't execute.*

The first search for "java programming" takes 280ms. The second takes 2ms. That's not a small optimization — it's a 140× speedup from a single `@Cacheable` annotation. Understanding when and what to cache (and when to invalidate) is one of the most impactful skills in backend engineering.

### 6. Full-Stack Means Full Responsibility
> *Every decision in the backend affects the frontend, and vice versa.*

The shape of the API response dictates the React component structure. The database schema determines query performance. The text processing pipeline affects search quality. Building end-to-end forced me to think about the *system*, not just the *code*.

### 7. Simple Beats Complex
> *The "seek." UI started as a Google clone. It ended as something more honest.*

The final design uses three fonts, two colors, and zero gradients. It's more memorable than any flashy UI because it has a *point of view*. The same lesson applies to code: the BM25 implementation is ~60 lines. The entire crawler is ~120 lines. Simplicity is not the absence of complexity — it's the result of understanding it deeply enough to remove the unnecessary parts.

<br>

---

<br>

## 🛠️ Tech Stack

### Backend — *The Engine*

| Technology | What It Does |
|------------|-------------|
| **Java 21** | The language — modern, fast, strongly typed |
| **Spring Boot 3.4** | Framework — handles HTTP, database, caching, configuration |
| **Spring Data JPA** | Database access — write Java, get SQL for free |
| **Hibernate 6** | ORM — maps Java objects to database tables |
| **Jsoup 1.17** | HTML parser — the crawler uses this to read web pages |
| **PostgreSQL 15** | Production database — reliable, battle-tested |
| **H2 Database** | Dev database — runs in memory, zero setup |
| **Redis 7** | Cache layer — makes repeated searches instant |
| **AWS S3** | Optional cloud storage for crawled page content |

### Frontend — *The Face*

| Technology | What It Does |
|------------|-------------|
| **React 18** | UI library — components, state, reactivity |
| **Vite 5** | Build tool — sub-second hot reload during development |
| **Tailwind CSS 3.4** | Styling — utility classes instead of writing CSS files |
| **Axios** | HTTP client — talks to the backend API |

### Build & Deploy

| Tool | Purpose |
|------|---------|
| **Gradle 8** | Java build system (included via wrapper — no install needed) |
| **npm** | Frontend package manager |
| **Spring Profiles** | `dev` → H2 in-memory · `local` → PostgreSQL · `prod` → AWS RDS + Redis |

<br>

---

<br>

## 📡 API Reference

All endpoints live under `http://localhost:8080/api`.

### Search

```
GET /api/search?q=machine+learning&page=0&size=10
```

Searches the unified index (all crawled pages + Wikipedia articles) using BM25 ranking.

<details>
<summary><b>Response</b></summary>

```json
{
  "results": [
    {
      "id": 1,
      "url": "https://en.wikipedia.org/wiki/Machine_learning",
      "title": "Machine learning - Wikipedia",
      "rawContent": "Machine learning is a subset of artificial intelligence...",
      "tokens": "machine learning subset artificial intelligence",
      "crawledAt": "2026-02-18T10:30:00"
    }
  ],
  "totalHits": 47,
  "page": 0,
  "totalPages": 5
}
```
</details>

### Autocomplete

```
GET /api/autocomplete?prefix=mac
```

Returns up to 10 suggestions from the Trie.

<details>
<summary><b>Response</b></summary>

```json
["machine", "machine learning", "macos", "macro"]
```
</details>

### Knowledge Panel

```
GET /api/knowledge?q=machine+learning
```

Returns a Wikipedia summary with image for the sidebar panel.

<details>
<summary><b>Response</b></summary>

```json
{
  "title": "Machine learning",
  "extract": "Machine learning is a subset of artificial intelligence...",
  "description": "Scientific study of algorithms and statistical models",
  "url": "https://en.wikipedia.org/wiki/Machine_learning",
  "thumbnail": "https://upload.wikimedia.org/...",
  "image": "https://upload.wikimedia.org/..."
}
```
</details>

### Crawl a Website

```
POST /api/crawl?url=https://example.com&domain=example.com
```

Starts a background BFS crawl from the given URL. Returns immediately.

### Index Wikipedia Articles

```
POST /api/crawl/wikipedia?q=quantum+physics&limit=25
```

Discovers and indexes up to 25 Wikipedia articles on the topic.

### Analytics

```
GET  /api/analytics       → Dashboard data (top queries, top clicks)
POST /api/click?query=... → Log a result click
```

### Health Check

```
GET /api/health → {"status": "UP", "message": "Search Engine is running!"}
```

<br>

---

<br>

## 🏗️ Architecture

### The Big Picture

```
                           ┌─────────────────────┐
                           │     YOU (Browser)    │
                           └──────────┬──────────┘
                                      │
                           ┌──────────▼──────────┐
                           │   React Frontend    │
                           │   (Vite + Tailwind) │
                           │   localhost:5173     │
                           └──────────┬──────────┘
                                      │ HTTP (JSON)
                           ┌──────────▼──────────┐
                           │  Spring Boot API    │
                           │  localhost:8080      │
                           │                     │
                           │  ┌───────────────┐  │
                           │  │ Search Engine │  │
                           │  │ BM25 + Index  │  │
                           │  └───────────────┘  │
                           │  ┌───────────────┐  │
                           │  │  Web Crawler  │  │
                           │  │  BFS Engine   │  │
                           │  └───────────────┘  │
                           │  ┌───────────────┐  │
                           │  │ Autocomplete  │  │
                           │  │ Trie Engine   │  │
                           │  └───────────────┘  │
                           └──┬──────┬───────┬──┘
                              │      │       │
                     ┌────────▼┐  ┌──▼───┐  ┌▼────────┐
                     │PostgreSQL│  │Redis │  │Wikipedia│
                     │  / H2   │  │Cache │  │  API    │
                     └─────────┘  └──────┘  └─────────┘
```

### What Each Module Does

| Module | Responsibility | Key Insight |
|--------|---------------|-------------|
| **`crawler/`** | Visits web pages via BFS, fetches HTML | A crawler is just a *very polite* automated browser |
| **`indexer/`** | Cleans text, builds inverted index | Tokenization + stop word removal = 10× better search quality |
| **`search/`** | BM25 scoring, pagination, caching | 60 lines of math that rank results better than naive keyword matching |
| **`autocomplete/`** | Trie data structure, prefix search | O(k) lookup — speed doesn't depend on how many words exist |
| **`wikipedia/`** | Article discovery + Knowledge Panel | Two APIs: one for crawl discovery, one for rich display |
| **`analytics/`** | Query/click logging, dashboard data | Simple counters that reveal powerful user behavior patterns |
| **`model/`** | JPA entities: Document, InvertedIndex, SearchQuery | The shape of your data determines the shape of everything else |
| **`config/`** | CORS, Redis, AWS S3 | Configuration is boring until it breaks in production |

### Data Flow: Crawl → Index → Search

```
CRAWLING (building the library)
═══════════════════════════════════════════════════════════

  URL → Jsoup fetches HTML → Extract title + body text
                                     │
                    ┌────────────────┼────────────────┐
                    ▼                ▼                ▼
              Save Document    Build Inverted     Feed Trie
              to Database      Index entries      (autocomplete)
              (url, title,     (word → docId      (word → prefix
               content)         + frequency)        tree)


SEARCHING (finding the right book)
═══════════════════════════════════════════════════════════

  Query → Clean & Tokenize → Look up Inverted Index
                                     │
                                     ▼
                              BM25 Scoring
                              (IDF × TF for each doc)
                                     │
                                     ▼
                            Sort by score (desc)
                                     │
                           ┌─────────┼──────────┐
                           ▼         ▼          ▼
                      Paginate   Cache it    Log query
                      (10/page)  (next time   (analytics)
                                  = instant)
```

### Database Schema

Three tables. That's all you need for a search engine:

```
┌───────────────────┐       ┌────────────────────────┐
│    documents      │       │    inverted_index       │
├───────────────────┤       ├────────────────────────┤
│ id (PK)           │◄──────│ doc_id (FK)             │
│ url (unique)      │       │ token (indexed)         │
│ title             │       │ freq (term frequency)   │
│ raw_content       │       └────────────────────────┘
│ tokens            │
│ crawled_at        │       ┌────────────────────────┐
└───────────────────┘       │    search_queries      │
                            ├────────────────────────┤
                            │ query (unique)          │
                            │ count (search count)    │
                            │ clicks (click count)    │
                            │ last_searched_at        │
                            └────────────────────────┘
```

<br>

---

<br>

## 📁 Project Structure

```
seek./
│
├── src/main/java/com/searchengine/
│   ├── SearchEngineApplication.java  ← Entry point
│   ├── model/                        ← Database entities
│   ├── repository/                   ← Database queries
│   ├── config/                       ← CORS, Redis, S3 setup
│   ├── crawler/                      ← BFS web crawler + Wikipedia crawler
│   ├── indexer/                      ← Text processing + inverted index builder
│   ├── search/                       ← BM25 scorer + search orchestration + REST API
│   ├── autocomplete/                 ← Trie data structure + prefix search
│   ├── wikipedia/                    ← Wikipedia API integration
│   └── analytics/                    ← Query/click tracking
│
├── frontend/src/
│   ├── App.jsx                       ← Main app (Home / Results / Settings views)
│   ├── components/
│   │   ├── SearchBar.jsx             ← Input + autocomplete dropdown
│   │   ├── SearchResults.jsx         ← Result cards with highlighting
│   │   ├── KnowledgePanel.jsx        ← Wikipedia sidebar
│   │   ├── Pagination.jsx            ← Page navigation
│   │   ├── AnalyticsDashboard.jsx    ← Stats + tables
│   │   └── CrawlerPanel.jsx          ← Wikipedia indexer + website crawler
│   └── api/searchApi.js              ← API client (Axios)
│
├── database/                         ← SQL schema + setup scripts
├── build.gradle                      ← Java dependencies
└── frontend/package.json             ← JS dependencies
```

<br>

---

<br>

## ⚙️ Configuration

### Three Environments

| Profile | Database | Cache | Setup Required |
|---------|----------|-------|----------------|
| **`dev`** *(default)* | H2 (in-memory) | In-memory | **Nothing** — just run it |
| **`local`** | PostgreSQL | In-memory | Install PostgreSQL, run `database/setup-local.sql` |
| **`prod`** | AWS RDS | Redis | Full cloud setup (RDS + ElastiCache + S3) |

### Environment Variables (Production)

| Variable | What It's For |
|----------|--------------|
| `DB_HOST`, `DB_USER`, `DB_PASS` | PostgreSQL connection |
| `REDIS_HOST`, `REDIS_PORT` | Redis cache |
| `S3_BUCKET_NAME`, `AWS_REGION` | AWS S3 storage |
| `SPRING_PROFILE` | Which config to use (`dev` / `local` / `prod`) |

<br>

---

<br>

## 🧪 Testing

```bash
# Run all tests
./gradlew test

# Run a specific test
./gradlew test --tests "com.searchengine.search.BM25ScorerTest"

# View test report
open build/reports/tests/test/index.html
```

Tests cover:
- ✅ BM25 scoring accuracy
- ✅ Text processing (tokenization, stop words, cleaning)
- ✅ Trie insert/search behavior
- ✅ Inverted index construction
- ✅ Search result ordering

<br>

---

<br>

## 🚢 Running with Docker

```bash
# Build the image
docker build -t seek-engine .

# Run with default (dev) profile
docker run -p 8080:8080 seek-engine

# Run with PostgreSQL + Redis (production)
docker run -p 8080:8080 \
  -e SPRING_PROFILE=prod \
  -e DB_HOST=your-db-host \
  -e DB_USER=admin \
  -e DB_PASS=secret \
  -e REDIS_HOST=your-redis-host \
  seek-engine
```

<br>

---

<br>

## 🤝 Contributing

Contributions are welcome! Fork the repo, create a feature branch, and open a PR.

```bash
git checkout -b feature/your-idea
# make changes
./gradlew test                    # make sure tests pass
git commit -m "feat: your idea"
git push origin feature/your-idea
# open a Pull Request
```

<br>

---

<br>

## 📄 License

MIT License — Copyright © 2026 [Sujal Kamble](https://github.com/sujalkamble007)

Free to use, modify, and distribute. See [LICENSE](LICENSE) for details.

<br>

---

<br>

<div align="center">

### *"The best way to understand something is to build it."*

<br>

built with care by **[Sujal Kamble](https://github.com/sujalkamble007)**

*seek. — find what matters.*

</div>
