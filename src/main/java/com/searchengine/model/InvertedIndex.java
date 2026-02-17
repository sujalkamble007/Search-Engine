package com.searchengine.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "inverted_index", indexes = {
    @Index(name = "idx_token", columnList = "token")
})
@Data
@NoArgsConstructor
public class InvertedIndex {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 255)
    private String token;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doc_id")
    private Document document;
    
    @Column(columnDefinition = "INT DEFAULT 1")
    private int freq = 1;
}
