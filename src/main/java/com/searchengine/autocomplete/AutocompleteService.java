package com.searchengine.autocomplete;

import com.searchengine.repository.DocumentRepository;
import com.searchengine.repository.SearchQueryRepository;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class AutocompleteService {

    private static final Logger log = LoggerFactory.getLogger(AutocompleteService.class);
    
    private final TrieNode root = new TrieNode();
    private int wordCount = 0;

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private SearchQueryRepository searchQueryRepository;

    /**
     * Load existing tokens from the database into the Trie on startup.
     * This ensures autocomplete works after server restarts with PostgreSQL.
     */
    @PostConstruct
    public void loadFromDatabase() {
        log.info("Loading autocomplete data from database...");

        // Load all past search queries (highest priority)
        try {
            searchQueryRepository.findAll().forEach(sq -> insert(sq.getQuery()));
            log.info("Loaded search queries into autocomplete Trie");
        } catch (Exception e) {
            log.warn("Could not load search queries: {}", e.getMessage());
        }

        // Load tokens from all indexed documents
        try {
            documentRepository.findAll().forEach(doc -> {
                if (doc.getTokens() != null && !doc.getTokens().isEmpty()) {
                    for (String token : doc.getTokens().split("\\s+")) {
                        if (token.length() >= 3) { // Skip very short tokens
                            insert(token);
                        }
                    }
                }
                // Also index document titles
                if (doc.getTitle() != null && !doc.getTitle().isEmpty()) {
                    insert(doc.getTitle().toLowerCase().trim());
                }
            });
        } catch (Exception e) {
            log.warn("Could not load document tokens: {}", e.getMessage());
        }

        log.info("Autocomplete Trie loaded with {} words", wordCount);
    }

    /**
     * Insert a word into the Trie
     */
    public void insert(String word) {
        if (word == null || word.isEmpty()) {
            return;
        }
        
        TrieNode node = root;
        for (char c : word.toLowerCase().toCharArray()) {
            node.children.putIfAbsent(c, new TrieNode());
            node = node.children.get(c);
        }
        if (!node.isEndOfWord) {
            node.isEndOfWord = true;
            wordCount++;
        }
    }

    /**
     * Get autocomplete suggestions for a given prefix
     */
    public List<String> getSuggestions(String prefix) {
        if (prefix == null || prefix.isEmpty()) {
            return List.of();
        }
        
        prefix = prefix.toLowerCase();
        TrieNode node = root;
        
        // Navigate to the node representing the prefix
        for (char c : prefix.toCharArray()) {
            if (!node.children.containsKey(c)) {
                return List.of();
            }
            node = node.children.get(c);
        }
        
        // Collect all words starting with the prefix
        List<String> results = new ArrayList<>();
        dfs(node, new StringBuilder(prefix), results);
        return results.subList(0, Math.min(10, results.size()));
    }

    /**
     * Depth-first search to collect all words from a given node
     */
    private void dfs(TrieNode node, StringBuilder curr, List<String> res) {
        if (res.size() >= 10) {
            return;
        }
        if (node.isEndOfWord) {
            res.add(curr.toString());
        }
        for (var entry : node.children.entrySet()) {
            curr.append(entry.getKey());
            dfs(entry.getValue(), curr, res);
            curr.deleteCharAt(curr.length() - 1);
        }
    }
    
    /**
     * Check if the Trie contains a word
     */
    public boolean contains(String word) {
        if (word == null || word.isEmpty()) {
            return false;
        }
        
        TrieNode node = root;
        for (char c : word.toLowerCase().toCharArray()) {
            if (!node.children.containsKey(c)) {
                return false;
            }
            node = node.children.get(c);
        }
        return node.isEndOfWord;
    }
}
