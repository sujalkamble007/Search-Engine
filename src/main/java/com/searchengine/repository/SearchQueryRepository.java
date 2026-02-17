package com.searchengine.repository;

import com.searchengine.model.SearchQuery;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SearchQueryRepository extends JpaRepository<SearchQuery, Long> {
    
    Optional<SearchQuery> findByQuery(String query);
    
    List<SearchQuery> findTop10ByOrderByCountDesc();
    
    List<SearchQuery> findTop10ByOrderByClicksDesc();
}
