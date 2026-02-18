package com.searchengine.search;

import com.searchengine.analytics.AnalyticsService;
import com.searchengine.autocomplete.AutocompleteService;
import com.searchengine.crawler.WebCrawler;
import com.searchengine.wikipedia.WikipediaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "${allowed.origins}")
public class SearchController {

    @Autowired
    private SearchService searchService;

    @Autowired
    private AutocompleteService autocompleteService;

    @Autowired
    private WebCrawler webCrawler;

    @Autowired
    private AnalyticsService analyticsService;

    @Autowired
    private WikipediaService wikipediaService;

    /**
     * GET /api/search?q=java&page=0&size=10
     * Unified search with BM25 ranking and pagination.
     * Searches the local inverted index (all crawled pages — websites + Wikipedia).
     */
    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> search(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(searchService.search(q, page, size));
    }

    /**
     * GET /api/autocomplete?prefix=jav
     * Returns autocomplete suggestions from the local Trie
     */
    @GetMapping("/autocomplete")
    public ResponseEntity<List<String>> autocomplete(@RequestParam String prefix) {
        List<String> suggestions = autocompleteService.getSuggestions(prefix);
        return ResponseEntity.ok(suggestions);
    }

    /**
     * GET /api/knowledge?q=java
     * Returns Wikipedia article summary for knowledge panel sidebar enrichment
     */
    @GetMapping("/knowledge")
    public ResponseEntity<Map<String, Object>> knowledgePanel(@RequestParam String q) {
        Map<String, Object> summary = wikipediaService.getArticleSummary(q);
        return ResponseEntity.ok(summary);
    }

    /**
     * POST /api/crawl?url=https://example.com&domain=example.com
     * Start background crawl from a seed URL
     */
    @PostMapping("/crawl")
    public ResponseEntity<String> crawl(
            @RequestParam String url,
            @RequestParam(defaultValue = "") String domain) {
        new Thread(() -> webCrawler.startCrawl(url, domain)).start();
        return ResponseEntity.ok("Crawling started: " + url);
    }

    /**
     * POST /api/crawl/wikipedia?q=java+programming&limit=20
     * Fetch and index Wikipedia articles for a given topic.
     * Articles are crawled and indexed into the same local database
     * as web-crawled pages, searchable via the unified /search endpoint.
     */
    @PostMapping("/crawl/wikipedia")
    public ResponseEntity<Map<String, Object>> crawlWikipedia(
            @RequestParam String q,
            @RequestParam(defaultValue = "20") int limit) {
        new Thread(() -> webCrawler.crawlWikipedia(q, limit)).start();
        return ResponseEntity.ok(Map.of(
            "message", "Started indexing Wikipedia articles for: " + q,
            "articlesRequested", limit
        ));
    }

    /**
     * POST /api/click?query=java
     * Log a result click for analytics (CTR tracking)
     */
    @PostMapping("/click")
    public ResponseEntity<Void> click(@RequestParam String query) {
        analyticsService.logClick(query);
        return ResponseEntity.ok().build();
    }

    /**
     * GET /api/health
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of(
            "status", "UP",
            "message", "Search Engine is running!"
        ));
    }
}
