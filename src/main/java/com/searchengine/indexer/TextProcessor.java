package com.searchengine.indexer;

import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class TextProcessor {
    
    private static final Set<String> STOP_WORDS = Set.of(
        "the", "is", "in", "at", "of", "a", "an", "and", "or", "to", "it",
        "this", "that", "was", "for", "on", "are", "with", "as", "be",
        "by", "from", "but", "not", "have", "he", "she", "they", "we", "you",
        "will", "can", "been", "has", "had", "do", "does", "did", "would",
        "could", "should", "may", "might", "must", "shall", "being", "were",
        "about", "after", "all", "also", "any", "back", "because", "before",
        "between", "both", "come", "day", "each", "even", "find", "first",
        "get", "give", "go", "good", "great", "hand", "here", "him", "his",
        "how", "into", "its", "just", "know", "last", "leave", "life", "like",
        "little", "long", "look", "made", "make", "man", "many", "me", "men",
        "more", "most", "much", "my", "need", "never", "new", "no", "now",
        "off", "old", "one", "only", "other", "our", "out", "over", "own",
        "part", "people", "place", "put", "right", "same", "say", "see",
        "some", "still", "such", "take", "tell", "than", "their", "them",
        "then", "there", "these", "thing", "think", "those", "through",
        "time", "two", "under", "up", "us", "use", "very", "want", "way",
        "well", "what", "when", "where", "which", "while", "who", "why",
        "work", "world", "year", "your"
    );

    /**
     * Clean the raw text by converting to lowercase and removing special characters
     */
    public String clean(String raw) {
        if (raw == null || raw.isEmpty()) {
            return "";
        }
        return raw.toLowerCase()
                  .replaceAll("[^a-z0-9\\s]", " ")
                  .replaceAll("\\s+", " ")
                  .trim();
    }

    /**
     * Tokenize the cleaned text by filtering out stop words and short words
     */
    public String tokenize(String cleaned) {
        if (cleaned == null || cleaned.isEmpty()) {
            return "";
        }
        return Arrays.stream(cleaned.split("\\s+"))
            .filter(w -> w.length() > 2)
            .filter(w -> !STOP_WORDS.contains(w))
            .distinct()
            .collect(Collectors.joining(" "));
    }

    /**
     * Convert tokenized string to a list of tokens
     */
    public List<String> toList(String tokens) {
        if (tokens == null || tokens.isEmpty()) {
            return List.of();
        }
        return Arrays.asList(tokens.split("\\s+"));
    }
}
