package com.searchengine.repository;

import com.searchengine.model.InvertedIndex;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InvertedIndexRepository extends JpaRepository<InvertedIndex, Long> {
    
    @Query("SELECT i FROM InvertedIndex i JOIN FETCH i.document WHERE i.token = :token")
    List<InvertedIndex> findByToken(@Param("token") String token);
    
    @Query("SELECT i FROM InvertedIndex i JOIN FETCH i.document WHERE i.token IN :tokens")
    List<InvertedIndex> findByTokenIn(@Param("tokens") List<String> tokens);
}
