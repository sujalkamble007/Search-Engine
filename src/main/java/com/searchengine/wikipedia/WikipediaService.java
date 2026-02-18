package com.searchengine.wikipedia;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.*;

@Service
public class WikipediaService {

    private static final Logger log = LoggerFactory.getLogger(WikipediaService.class);
    private static final String WIKI_API = "https://en.wikipedia.org/w/api.php";
    private static final String WIKI_REST = "https://en.wikipedia.org/api/rest_v1";

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public WikipediaService() {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .followRedirects(HttpClient.Redirect.NORMAL)
                .build();
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Search Wikipedia for articles matching the query.
     * Returns a list of search results with title, snippet, URL, and page ID.
     * Used by WebCrawler to discover articles for local indexing.
     */
    public List<Map<String, Object>> search(String query, int limit) {
        try {
            String encoded = URLEncoder.encode(query, StandardCharsets.UTF_8);
            String url = WIKI_API + "?action=query&list=search"
                    + "&srsearch=" + encoded
                    + "&srlimit=" + limit
                    + "&srprop=" + URLEncoder.encode("snippet|titlesnippet|size|wordcount|timestamp", StandardCharsets.UTF_8)
                    + "&format=json&origin=*";

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("User-Agent", "SearchEngine/1.0")
                    .timeout(Duration.ofSeconds(10))
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            JsonNode root = objectMapper.readTree(response.body());
            JsonNode searchResults = root.path("query").path("search");

            List<Map<String, Object>> results = new ArrayList<>();
            for (JsonNode item : searchResults) {
                Map<String, Object> result = new LinkedHashMap<>();
                String title = item.path("title").asText();
                result.put("pageId", item.path("pageid").asLong());
                result.put("title", title);
                result.put("snippet", cleanHtml(item.path("snippet").asText()));
                result.put("url", "https://en.wikipedia.org/wiki/" + URLEncoder.encode(title.replace(" ", "_"), StandardCharsets.UTF_8));
                result.put("wordCount", item.path("wordcount").asInt());
                result.put("size", item.path("size").asInt());
                result.put("timestamp", item.path("timestamp").asText());
                results.add(result);
            }

            int totalHits = root.path("query").path("searchinfo").path("totalhits").asInt();
            log.info("Wikipedia search for '{}': {} total hits, returning {}", query, totalHits, results.size());

            return results;
        } catch (Exception e) {
            log.error("Wikipedia search failed for '{}': {}", query, e.getMessage());
            return List.of();
        }
    }

    /**
     * Get the full summary of a Wikipedia article by title.
     * Uses the REST API for clean, formatted summaries.
     * Used by the knowledge panel for sidebar enrichment.
     */
    public Map<String, Object> getArticleSummary(String title) {
        try {
            String encoded = URLEncoder.encode(title.replace(" ", "_"), StandardCharsets.UTF_8);
            String url = WIKI_REST + "/page/summary/" + encoded;

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("User-Agent", "SearchEngine/1.0")
                    .timeout(Duration.ofSeconds(10))
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            JsonNode root = objectMapper.readTree(response.body());

            Map<String, Object> article = new LinkedHashMap<>();
            article.put("title", root.path("title").asText());
            article.put("extract", root.path("extract").asText());
            article.put("description", root.path("description").asText(""));
            article.put("url", root.path("content_urls").path("desktop").path("page").asText());

            // Thumbnail
            if (root.has("thumbnail")) {
                article.put("thumbnail", root.path("thumbnail").path("source").asText());
            }

            // Original image
            if (root.has("originalimage")) {
                article.put("image", root.path("originalimage").path("source").asText());
            }

            return article;
        } catch (Exception e) {
            log.error("Failed to get Wikipedia summary for '{}': {}", title, e.getMessage());
            return Map.of("error", "Article not found");
        }
    }

    /**
     * Strip HTML tags from Wikipedia snippets.
     */
    private String cleanHtml(String html) {
        if (html == null) return "";
        return html.replaceAll("<[^>]*>", "").replaceAll("&quot;", "\"")
                .replaceAll("&amp;", "&").replaceAll("&lt;", "<")
                .replaceAll("&gt;", ">").replaceAll("&nbsp;", " ").trim();
    }
}
