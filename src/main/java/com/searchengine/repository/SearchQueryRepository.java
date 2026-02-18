package com.searchengine.repository;

import com.searchengine.model.SearchQuery;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SearchQueryRepository extends JpaRepository<SearchQuery, Long> {
    
    Optional<SearchQuery> findByQuery(String query);
    
    List<SearchQuery> findTop10ByOrderByCountDesc();
    
    List<SearchQuery> findTop10ByOrderByClicksDesc();

    /** All queries ordered by most recent first (for timeline chart) */
    List<SearchQuery> findAllByOrderByLastSearchedAtDesc();

    /** Total sum of all search counts */
    @Query("SELECT COALESCE(SUM(q.count), 0) FROM SearchQuery q")
    Long sumAllCounts();

    /** Total sum of all clicks */
    @Query("SELECT COALESCE(SUM(q.clicks), 0) FROM SearchQuery q")
    Long sumAllClicks();
}
