# 🔍 MySearch Engine

A full-stack search engine built with **Java Spring Boot** and **React**, featuring web crawling, BM25 ranking, Trie-based autocomplete, and real-time analytics.

![Java](https://img.shields.io/badge/Java-21-orange?style=flat-square&logo=openjdk)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4.1-green?style=flat-square&logo=springboot)
![React](https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4-38B2AC?style=flat-square&logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

---

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Configuration](#-configuration)
- [Database Schema](#-database-schema)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🕷️ Web Crawler
- Crawls websites starting from a seed URL
- Respects domain boundaries
- Configurable crawl delay and page limits
- Extracts and processes HTML content

### 🔎 Search Engine
- **BM25 Ranking Algorithm** - Industry-standard relevance scoring
- **Inverted Index** - Fast token-to-document lookups
- **Text Processing** - Tokenization, stop word removal, normalization
- **Pagination** - Efficient result browsing

### ⌨️ Autocomplete
- **Trie Data Structure** - O(k) prefix lookups
- Real-time suggestions as you type
- Keyboard navigation support

### 📊 Analytics Dashboard
- Track top searched queries
- Monitor click-through rates (CTR)
- View search trends

### 🎨 Modern UI
- Clean, responsive design with Tailwind CSS
- Dark/light mode ready
- Mobile-friendly interface

---

## 🏗️ Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  React Frontend │────▶│  Spring Boot    │────▶│   PostgreSQL    │
│  (Vite + TW)    │     │  REST API       │     │   Database      │
│                 │     │                 │     │                 │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │                 │
                        │  Redis Cache    │
                        │  (Optional)     │
                        │                 │
                        └─────────────────┘
```

### Data Flow

```
1. Crawling:  URL → Jsoup → TextProcessor → Document → InvertedIndex
2. Searching: Query → Tokenize → BM25 Score → Rank → Results
3. Autocomplete: Prefix → Trie Lookup → Suggestions
```

---

## 🛠️ Tech Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Java | 21 | Programming Language |
| Spring Boot | 3.4.1 | Application Framework |
| Spring Data JPA | 3.4.x | ORM & Data Access |
| Hibernate | 6.6.x | JPA Implementation |
| Jsoup | 1.17.2 | HTML Parsing & Crawling |
| H2 / PostgreSQL | 2.x / 15 | Database |
| Redis | 7.x | Caching (Optional) |
| AWS SDK | 2.25.0 | S3 Integration |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2 | UI Framework |
| Vite | 5.x | Build Tool |
| Tailwind CSS | 3.4 | Styling |
| Axios | 1.6.x | HTTP Client |

---

## 🚀 Getting Started

### Prerequisites

- **Java 21** or higher ([Download](https://adoptium.net/))
- **Node.js 18+** and npm ([Download](https://nodejs.org/))
- **Git** ([Download](https://git-scm.com/))
- **PostgreSQL 15** (Optional, for production)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/Search-Engine.git
   cd Search-Engine
   ```

2. **Backend Setup**
   ```bash
   # Build the project
   ./gradlew build -x test
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   ```

### Running the Application

#### Option 1: Development Mode (Separate Terminals)

**Terminal 1 - Start Backend:**
```bash
./gradlew bootRun
```

**Terminal 2 - Start Frontend:**
```bash
cd frontend
npm run dev
```

#### Option 2: Production Build

```bash
# Build backend JAR
./gradlew bootJar

# Build frontend
cd frontend
npm run build

# Run the application
java -jar build/libs/Search-Engine-0.0.1-SNAPSHOT.jar
```

### Access the Application

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8080/api |
| H2 Console | http://localhost:8080/h2-console |
| Health Check | http://localhost:8080/api/health |

---

## 📚 API Documentation

### Search Endpoints

#### Search Documents
```http
GET /api/search?q={query}&page={page}&size={size}
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| q | string | required | Search query |
| page | int | 0 | Page number (0-indexed) |
| size | int | 10 | Results per page |

**Response:**
```json
{
  "results": [
    {
      "id": 1,
      "url": "https://example.com",
      "title": "Example Page",
      "rawContent": "Page content...",
      "crawledAt": "2024-01-15T10:30:00"
    }
  ],
  "totalHits": 150,
  "page": 0,
  "totalPages": 15
}
```

#### Autocomplete
```http
GET /api/autocomplete?prefix={prefix}
```

**Response:**
```json
["search", "searching", "searchable", "searched"]
```

### Crawler Endpoints

#### Start Crawling
```http
POST /api/crawl?url={seedUrl}&domain={domain}
```

| Parameter | Type | Description |
|-----------|------|-------------|
| url | string | Starting URL to crawl |
| domain | string | Domain to restrict crawling (optional) |

**Example:**
```bash
curl -X POST "http://localhost:8080/api/crawl?url=https://example.com&domain=example.com"
```

### Analytics Endpoints

#### Get Analytics
```http
GET /api/analytics
```

**Response:**
```json
{
  "topQueries": [
    { "query": "java", "count": 150, "clicks": 45 }
  ],
  "topClicked": [
    { "query": "spring boot", "count": 80, "clicks": 62 }
  ]
}
```

#### Log Click
```http
POST /api/click?query={query}
```

### Health Check
```http
GET /api/health
```

---

## 📁 Project Structure

```
Search-Engine/
├── 📁 src/main/java/com/searchengine/
│   ├── SearchEngineApplication.java      # Main entry point
│   ├── 📁 model/                          # JPA Entities
│   │   ├── Document.java                  # Crawled document
│   │   ├── InvertedIndex.java             # Token-document mapping
│   │   └── SearchQuery.java               # Analytics data
│   ├── 📁 repository/                     # Data Access Layer
│   │   ├── DocumentRepository.java
│   │   ├── InvertedIndexRepository.java
│   │   └── SearchQueryRepository.java
│   ├── 📁 config/                         # Configuration
│   │   ├── RedisConfig.java               # Cache configuration
│   │   ├── AwsS3Config.java               # AWS S3 client
│   │   └── WebConfig.java                 # CORS settings
│   ├── 📁 crawler/                        # Web Crawler
│   │   ├── WebCrawler.java                # Crawling logic
│   │   └── CrawlerService.java            # Page processing
│   ├── 📁 indexer/                        # Indexing
│   │   ├── TextProcessor.java             # Text cleaning/tokenization
│   │   └── IndexerService.java            # Inverted index builder
│   ├── 📁 search/                         # Search Engine
│   │   ├── BM25Scorer.java                # BM25 ranking algorithm
│   │   ├── SearchService.java             # Search orchestration
│   │   └── SearchController.java          # REST endpoints
│   ├── 📁 autocomplete/                   # Autocomplete
│   │   ├── TrieNode.java                  # Trie data structure
│   │   └── AutocompleteService.java       # Suggestion service
│   └── 📁 analytics/                      # Analytics
│       ├── AnalyticsService.java          # Tracking logic
│       └── AnalyticsController.java       # REST endpoints
├── 📁 src/main/resources/
│   └── application.properties             # Configuration
├── 📁 frontend/
│   ├── 📁 src/
│   │   ├── App.jsx                        # Main React component
│   │   ├── 📁 api/
│   │   │   └── searchApi.js               # API client
│   │   └── 📁 components/
│   │       ├── SearchBar.jsx              # Search input + autocomplete
│   │       ├── SearchResults.jsx          # Results display
│   │       ├── Pagination.jsx             # Page navigation
│   │       ├── AnalyticsDashboard.jsx     # Analytics view
│   │       └── CrawlerPanel.jsx           # Crawler interface
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── build.gradle                           # Gradle build config
└── README.md
```

---

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | Database host | localhost |
| `DB_USER` | Database username | sa |
| `DB_PASS` | Database password | (empty) |
| `REDIS_HOST` | Redis host | localhost |
| `S3_BUCKET_NAME` | AWS S3 bucket | my-search-engine-data |
| `AWS_REGION` | AWS region | us-east-1 |

### Application Properties

```properties
# Server
server.port=8080

# Database (H2 for dev)
spring.datasource.url=jdbc:h2:mem:searchengine
spring.jpa.hibernate.ddl-auto=update

# PostgreSQL (for production)
# spring.datasource.url=jdbc:postgresql://${DB_HOST}:5432/searchengine
# spring.datasource.username=${DB_USER}
# spring.datasource.password=${DB_PASS}

# CORS
allowed.origins=http://localhost:5173,http://localhost:3000
```

---

## 🗄️ Database Schema

### Documents Table
```sql
CREATE TABLE documents (
    id            BIGSERIAL PRIMARY KEY,
    url           TEXT UNIQUE NOT NULL,
    title         VARCHAR(500),
    raw_content   TEXT,
    tokens        TEXT,
    crawled_at    TIMESTAMP DEFAULT NOW()
);
```

### Inverted Index Table
```sql
CREATE TABLE inverted_index (
    id      BIGSERIAL PRIMARY KEY,
    token   VARCHAR(255) NOT NULL,
    doc_id  BIGINT REFERENCES documents(id),
    freq    INT DEFAULT 1
);
CREATE INDEX idx_token ON inverted_index(token);
```

### Search Queries Table
```sql
CREATE TABLE search_queries (
    id               BIGSERIAL PRIMARY KEY,
    query            VARCHAR(255) UNIQUE NOT NULL,
    count            BIGINT DEFAULT 0,
    clicks           BIGINT DEFAULT 0,
    last_searched_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🚢 Deployment

### Docker (Recommended)

```dockerfile
# Dockerfile
FROM eclipse-temurin:21-jdk-alpine
WORKDIR /app
COPY build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

```bash
# Build and run
docker build -t search-engine .
docker run -p 8080:8080 search-engine
```

### AWS Deployment

1. **RDS** - PostgreSQL database
2. **EC2** - Application server
3. **S3** - Static assets & crawled content
4. **ElastiCache** - Redis caching

```bash
# Deploy to EC2
scp -i key.pem build/libs/*.jar ec2-user@<IP>:/home/ec2-user/
ssh -i key.pem ec2-user@<IP>
java -jar app.jar
```

---

## 🧪 Testing

```bash
# Run all tests
./gradlew test

# Run with coverage
./gradlew test jacocoTestReport
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [BM25 Algorithm](https://en.wikipedia.org/wiki/Okapi_BM25) - Robertson & Walker
- [Jsoup](https://jsoup.org/) - HTML parsing library
- [Spring Boot](https://spring.io/projects/spring-boot) - Application framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/yourusername">Your Name</a>
</p>
