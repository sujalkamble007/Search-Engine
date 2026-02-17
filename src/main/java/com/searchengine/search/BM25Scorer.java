package com.searchengine.search;

import com.searchengine.model.InvertedIndex;
import com.searchengine.repository.DocumentRepository;
import com.searchengine.repository.InvertedIndexRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class BM25Scorer {
    
    // BM25 parameters
    private static final double K1 = 1.5;  // Term frequency saturation
    private static final double B = 0.75;  // Length normalization

    @Autowired
    private InvertedIndexRepository indexRepo;
    
    @Autowired
    private DocumentRepository docRepo;

    /**
     * Score documents using BM25 ranking algorithm
     * Returns a list of document IDs sorted by relevance (highest first)
     */
    public List<Long> score(List<String> queryTokens) {
        if (queryTokens == null || queryTokens.isEmpty()) {
            return List.of();
        }
        
        long totalDocs = docRepo.count();
        if (totalDocs == 0) {
            return List.of();
        }
        
        // Calculate average document length
        double avgDocLen = docRepo.findAll().stream()
            .filter(d -> d.getTokens() != null && !d.getTokens().isEmpty())
            .mapToInt(d -> d.getTokens().split("\\s+").length)
            .average()
            .orElse(1.0);

        Map<Long, Double> scores = new HashMap<>();

        for (String term : queryTokens) {
            List<InvertedIndex> entries = indexRepo.findByToken(term);
            int df = entries.size();  // Document frequency
            
            if (df == 0) {
                continue;
            }

            // Calculate IDF (Inverse Document Frequency)
            double idf = Math.log((totalDocs - df + 0.5) / (df + 0.5) + 1);

            for (InvertedIndex entry : entries) {
                if (entry.getDocument() == null) {
                    continue;
                }
                
                long docId = entry.getDocument().getId();
                int tf = entry.getFreq();  // Term frequency
                
                String tokens = entry.getDocument().getTokens();
                int dl = (tokens != null && !tokens.isEmpty()) 
                    ? tokens.split("\\s+").length 
                    : 1;
                
                // BM25 term frequency component
                double tfScore = (tf * (K1 + 1)) 
                    / (tf + K1 * (1 - B + B * (dl / avgDocLen)));
                
                // Accumulate score for this document
                scores.merge(docId, idf * tfScore, Double::sum);
            }
        }

        // Sort by score descending and return document IDs
        return scores.entrySet().stream()
            .sorted(Map.Entry.<Long, Double>comparingByValue().reversed())
            .map(Map.Entry::getKey)
            .collect(Collectors.toList());
    }
}
