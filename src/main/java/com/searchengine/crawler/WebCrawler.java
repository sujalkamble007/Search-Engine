package com.searchengine.crawler;

import com.searchengine.wikipedia.WikipediaService;
import org.jsoup.Jsoup;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Queue;
import java.util.Set;

@Service
public class WebCrawler {

    private static final Logger log = LoggerFactory.getLogger(WebCrawler.class);
    private static final int MAX_PAGES = 100;
    private static final int CRAWL_DELAY = 1000; // milliseconds
    private static final int TIMEOUT = 5000; // milliseconds

    @Autowired
    private CrawlerService crawlerService;

    @Autowired
    private WikipediaService wikipediaService;

    /**
     * Start crawling from a seed URL within a specific domain
     */
    public void startCrawl(String seedUrl, String domain) {
        Set<String> visited = new HashSet<>();
        Queue<String> queue = new LinkedList<>();
        queue.add(seedUrl);

        log.info("Starting crawl from: {} (domain: {})", seedUrl, domain);

        while (!queue.isEmpty() && visited.size() < MAX_PAGES) {
            String url = queue.poll();

            // Skip if already visited or not in the target domain
            if (visited.contains(url)) {
                continue;
            }
            if (domain != null && !domain.isEmpty() && !url.contains(domain)) {
                continue;
            }

            visited.add(url);

            try {
                org.jsoup.nodes.Document jsoupDoc = Jsoup.connect(url)
                    .userAgent("SearchEngineBot/1.0 (+https://example.com/bot)")
                    .timeout(TIMEOUT)
                    .followRedirects(true)
                    .get();

                // Process the page
                crawlerService.processPage(url, jsoupDoc);

                // Extract and queue new links
                jsoupDoc.select("a[href]").stream()
                    .map(a -> a.absUrl("href"))
                    .filter(link -> !link.isEmpty())
                    .filter(link -> !visited.contains(link))
                    .filter(link -> link.startsWith("https://") || link.startsWith("http://"))
                    .filter(link -> !link.contains("#")) // Skip anchors
                    .filter(link -> domain == null || domain.isEmpty() || link.contains(domain))
                    .forEach(queue::add);

                // Polite delay between requests
                Thread.sleep(CRAWL_DELAY);

            } catch (Exception e) {
                log.warn("Crawl failed for: {} - {}", url, e.getMessage());
            }
        }

        log.info("Crawl completed. Total pages visited: {}", visited.size());
    }

    /**
     * Crawl Wikipedia articles for a given topic.
     * Uses Wikipedia Search API to find relevant articles, then crawls
     * and indexes each one through the same pipeline as web crawling.
     */
    public void crawlWikipedia(String query, int limit) {
        log.info("Starting Wikipedia crawl for '{}' (limit: {})", query, limit);

        List<Map<String, Object>> articles = wikipediaService.search(query, limit);
        int indexed = 0;

        for (Map<String, Object> article : articles) {
            String url = (String) article.get("url");
            if (url == null) continue;

            try {
                org.jsoup.nodes.Document jsoupDoc = Jsoup.connect(url)
                    .userAgent("SearchEngineBot/1.0 (+https://example.com/bot)")
                    .timeout(TIMEOUT)
                    .followRedirects(true)
                    .get();

                crawlerService.processPage(url, jsoupDoc);
                indexed++;
                log.info("Indexed Wikipedia article: {} ({}/{})", article.get("title"), indexed, articles.size());

                Thread.sleep(CRAWL_DELAY);
            } catch (Exception e) {
                log.warn("Failed to crawl Wikipedia article: {} - {}", url, e.getMessage());
            }
        }

        log.info("Wikipedia crawl completed. Indexed {} of {} articles for '{}'", indexed, articles.size(), query);
    }
}
