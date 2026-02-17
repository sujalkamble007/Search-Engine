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
     * GET /api/search?q=java&page=0&size=10&source=all
     * Search with BM25 ranking and pagination
     * source: "local" = crawled data only, "wiki" = Wikipedia only, "all" = both (default)
     */
    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> search(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "all") String source) {
        
        if ("wiki".equalsIgnoreCase(source)) {
            return ResponseEntity.ok(wikipediaService.searchWithPagination(q, page, size));
        }
        
        return ResponseEntity.ok(searchService.search(q, page, size));
    }

    /**
     * GET /api/autocomplete?prefix=jav
     * Trie-based autocomplete suggestions
     */
    @GetMapping("/autocomplete")
    public ResponseEntity<List<String>> autocomplete(@RequestParam String prefix) {
        return ResponseEntity.ok(autocompleteService.getSuggestions(prefix));
    }

    /**
     * POST /api/crawl?url=https://example.com&domain=example.com
     * Start background crawl from a seed URL
     */
    @PostMapping("/crawl")
    public ResponseEntity<String> crawl(
            @RequestParam String url,
            @RequestParam(defaultValue = "") String domain) {
        // Start crawling in a separate thread
        new Thread(() -> webCrawler.startCrawl(url, domain)).start();
        return ResponseEntity.ok("Crawling started: " + url);
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
