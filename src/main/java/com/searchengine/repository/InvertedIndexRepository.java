package com.searchengine.repository;

import com.searchengine.model.InvertedIndex;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InvertedIndexRepository extends JpaRepository<InvertedIndex, Long> {
    
    List<InvertedIndex> findByToken(String token);
    
    List<InvertedIndex> findByTokenIn(List<String> tokens);
}
