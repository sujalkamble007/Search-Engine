package com.searchengine.repository;

import com.searchengine.model.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    
    boolean existsByUrl(String url);
    
    List<Document> findAllByIdIn(List<Long> ids);
}
