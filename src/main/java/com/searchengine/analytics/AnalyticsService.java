package com.searchengine.analytics;

import com.searchengine.model.SearchQuery;
import com.searchengine.repository.DocumentRepository;
import com.searchengine.repository.InvertedIndexRepository;
import com.searchengine.repository.SearchQueryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {
    
    @Autowired
    private SearchQueryRepository queryRepo;

    @Autowired
    private DocumentRepository docRepo;

    @Autowired
    private InvertedIndexRepository indexRepo;

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
     * Get comprehensive analytics data for the dashboard
     */
    public Map<String, Object> getAnalytics() {
        Map<String, Object> analytics = new HashMap<>();

        // Top lists (existing)
        analytics.put("topQueries", queryRepo.findTop10ByOrderByCountDesc());
        analytics.put("topClicked", queryRepo.findTop10ByOrderByClicksDesc());

        // Aggregate stats
        long totalSearches = queryRepo.sumAllCounts();
        long totalClicks = queryRepo.sumAllClicks();
        long uniqueQueries = queryRepo.count();
        long totalDocuments = docRepo.count();
        long totalIndexEntries = indexRepo.count();

        analytics.put("totalSearches", totalSearches);
        analytics.put("totalClicks", totalClicks);
        analytics.put("uniqueQueries", uniqueQueries);
        analytics.put("totalDocuments", totalDocuments);
        analytics.put("totalIndexEntries", totalIndexEntries);
        analytics.put("ctr", totalSearches > 0 
            ? Math.round((double) totalClicks / totalSearches * 1000.0) / 10.0 
            : 0.0);

        // Search activity by day (last 30 days) — for the activity timeline chart
        List<SearchQuery> allQueries = queryRepo.findAllByOrderByLastSearchedAtDesc();
        LocalDate today = LocalDate.now();
        Map<String, Long> activityMap = new LinkedHashMap<>();
        for (int i = 29; i >= 0; i--) {
            activityMap.put(today.minusDays(i).toString(), 0L);
        }
        for (SearchQuery sq : allQueries) {
            if (sq.getLastSearchedAt() != null) {
                String day = sq.getLastSearchedAt().toLocalDate().toString();
                activityMap.computeIfPresent(day, (k, v) -> v + sq.getCount());
            }
        }
        List<Map<String, Object>> activityTimeline = new ArrayList<>();
        activityMap.forEach((date, count) -> {
            Map<String, Object> point = new LinkedHashMap<>();
            point.put("date", date);
            point.put("searches", count);
            activityTimeline.add(point);
        });
        analytics.put("activityTimeline", activityTimeline);

        // Searches vs Clicks comparison for top queries (bar chart data)
        List<SearchQuery> top10 = queryRepo.findTop10ByOrderByCountDesc();
        List<Map<String, Object>> comparison = top10.stream().map(q -> {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("query", q.getQuery().length() > 15 
                ? q.getQuery().substring(0, 15) + "…" 
                : q.getQuery());
            row.put("searches", q.getCount());
            row.put("clicks", q.getClicks());
            return row;
        }).collect(Collectors.toList());
        analytics.put("searchVsClicks", comparison);

        return analytics;
    }
}
