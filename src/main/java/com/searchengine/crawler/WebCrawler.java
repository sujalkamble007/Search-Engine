package com.searchengine.crawler;

import org.jsoup.Jsoup;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.LinkedList;
import java.util.Queue;
import java.util.Set;

@Service
public class WebCrawler {
    
    private static final int MAX_PAGES = 100;
    private static final int CRAWL_DELAY = 1000; // milliseconds
    private static final int TIMEOUT = 5000; // milliseconds

    @Autowired
    private CrawlerService crawlerService;

    /**
     * Start crawling from a seed URL within a specific domain
     */
    public void startCrawl(String seedUrl, String domain) {
        Set<String> visited = new HashSet<>();
        Queue<String> queue = new LinkedList<>();
        queue.add(seedUrl);

        System.out.println("Starting crawl from: " + seedUrl + " (domain: " + domain + ")");

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
                System.err.println("Crawl failed for: " + url + " - " + e.getMessage());
            }
        }

        System.out.println("Crawl completed. Total pages visited: " + visited.size());
    }
}
