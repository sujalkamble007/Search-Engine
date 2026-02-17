package com.searchengine.autocomplete;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class AutocompleteService {
    
    private final TrieNode root = new TrieNode();

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
        node.isEndOfWord = true;
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
