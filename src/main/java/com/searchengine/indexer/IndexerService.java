package com.searchengine.indexer;

import com.searchengine.model.Document;
import com.searchengine.model.InvertedIndex;
import com.searchengine.repository.InvertedIndexRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class IndexerService {
    
    @Autowired
    private InvertedIndexRepository indexRepo;

    /**
     * Build the inverted index for a document
     * Each token is mapped to the document with its frequency
     */
    public void index(Document doc) {
        if (doc.getTokens() == null || doc.getTokens().isEmpty()) {
            return;
        }
        
        String[] tokens = doc.getTokens().split("\\s+");

        // Count frequency of each token
        Map<String, Long> freqMap = Arrays.stream(tokens)
            .collect(Collectors.groupingBy(t -> t, Collectors.counting()));

        // Persist each token → doc mapping
        freqMap.forEach((token, freq) -> {
            InvertedIndex entry = new InvertedIndex();
            entry.setToken(token);
            entry.setDocument(doc);
            entry.setFreq(freq.intValue());
            indexRepo.save(entry);
        });
    }
}
