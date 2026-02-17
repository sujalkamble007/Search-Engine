package com.searchengine.wikipedia;

import com.searchengine.analytics.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/wiki")
@CrossOrigin(origins = "${allowed.origins}")
public class WikipediaController {

    @Autowired
    private WikipediaService wikipediaService;

    @Autowired
    private AnalyticsService analyticsService;

    /**
     * GET /api/wiki/search?q=java&page=0&size=10
     * Search Wikipedia with pagination (same response format as /api/search)
     */
    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> search(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        analyticsService.logQuery(q);
        Map<String, Object> results = wikipediaService.searchWithPagination(q, page, size);
        return ResponseEntity.ok(results);
    }

    /**
     * GET /api/wiki/summary?title=Java_(programming_language)
     * Get article summary with thumbnail
     */
    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> summary(@RequestParam String title) {
        return ResponseEntity.ok(wikipediaService.getArticleSummary(title));
    }

    /**
     * GET /api/wiki/article?title=Java_(programming_language)
     * Get full article content with categories and links
     */
    @GetMapping("/article")
    public ResponseEntity<Map<String, Object>> article(@RequestParam String title) {
        return ResponseEntity.ok(wikipediaService.getArticleContent(title));
    }
}
