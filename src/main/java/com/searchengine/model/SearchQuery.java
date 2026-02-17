package com.searchengine.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "search_queries")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SearchQuery {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, length = 255)
    private String query;
    
    @Column(columnDefinition = "BIGINT DEFAULT 0")
    private Long count = 0L;
    
    @Column(columnDefinition = "BIGINT DEFAULT 0")
    private Long clicks = 0L;
    
    private LocalDateTime lastSearchedAt;
}
