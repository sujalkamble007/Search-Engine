package com.searchengine.search;

import com.searchengine.analytics.AnalyticsService;
import com.searchengine.indexer.TextProcessor;
import com.searchengine.model.Document;
import com.searchengine.repository.DocumentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class SearchService {
    
    @Autowired
    private BM25Scorer bm25Scorer;
    
    @Autowired
    private TextProcessor textProcessor;
    
    @Autowired
    private DocumentRepository docRepo;
    
    @Autowired
    private AnalyticsService analyticsService;

    /**
     * Search for documents matching the query with pagination
     */
    @Cacheable(value = "searchCache", key = "#query + '-' + #page + '-' + #size")
    public Map<String, Object> search(String query, int page, int size) {
        if (query == null || query.trim().isEmpty()) {
            return createEmptyResult(page);
        }
        
        // Process query: clean and tokenize
        String cleaned = textProcessor.clean(query);
        String tokenized = textProcessor.tokenize(cleaned);
        List<String> tokens = textProcessor.toList(tokenized);
        
        if (tokens.isEmpty()) {
            return createEmptyResult(page);
        }
        
        // Get ranked document IDs using BM25
        List<Long> allIds = bm25Scorer.score(tokens);
        int total = allIds.size();
        
        // Paginate results
        int start = page * size;
        int end = Math.min(start + size, total);
        
        List<Long> pageIds = (start < total) ? allIds.subList(start, end) : List.of();
        List<Document> results = pageIds.isEmpty() ? List.of() : docRepo.findAllByIdIn(pageIds);
        
        // Sort results to match the order from BM25
        results = sortByIdOrder(results, pageIds);

        // Log the search query for analytics
        analyticsService.logQuery(query);

        Map<String, Object> response = new HashMap<>();
        response.put("results", results);
        response.put("totalHits", total);
        response.put("page", page);
        response.put("totalPages", (int) Math.ceil((double) total / size));
        
        return response;
    }
    
    private Map<String, Object> createEmptyResult(int page) {
        Map<String, Object> response = new HashMap<>();
        response.put("results", List.of());
        response.put("totalHits", 0);
        response.put("page", page);
        response.put("totalPages", 0);
        return response;
    }
    
    private List<Document> sortByIdOrder(List<Document> docs, List<Long> orderedIds) {
        Map<Long, Document> docMap = new HashMap<>();
        for (Document doc : docs) {
            docMap.put(doc.getId(), doc);
        }
        return orderedIds.stream()
            .map(docMap::get)
            .filter(d -> d != null)
            .toList();
    }
}
