package com.searchengine.analytics;

import com.searchengine.model.SearchQuery;
import com.searchengine.repository.SearchQueryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class AnalyticsService {
    
    @Autowired
    private SearchQueryRepository queryRepo;

    /**
     * Log a search query (increment count)
     */
    public void logQuery(String query) {
        if (query == null || query.trim().isEmpty()) {
            return;
        }
        
        SearchQuery q = queryRepo.findByQuery(query)
            .orElse(new SearchQuery(null, query, 0L, 0L, LocalDateTime.now()));
        
        q.setCount(q.getCount() + 1);
        q.setLastSearchedAt(LocalDateTime.now());
        queryRepo.save(q);
    }

    /**
     * Log a result click (increment clicks)
     */
    public void logClick(String query) {
        if (query == null || query.trim().isEmpty()) {
            return;
        }
        
        queryRepo.findByQuery(query).ifPresent(q -> {
            q.setClicks(q.getClicks() + 1);
            queryRepo.save(q);
        });
    }

    /**
     * Get analytics data: top queries and top clicked
     */
    public Map<String, Object> getAnalytics() {
        Map<String, Object> analytics = new HashMap<>();
        analytics.put("topQueries", queryRepo.findTop10ByOrderByCountDesc());
        analytics.put("topClicked", queryRepo.findTop10ByOrderByClicksDesc());
        return analytics;
    }
}
