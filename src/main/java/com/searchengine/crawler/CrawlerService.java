package com.searchengine.crawler;

import com.searchengine.autocomplete.AutocompleteService;
import com.searchengine.indexer.IndexerService;
import com.searchengine.indexer.TextProcessor;
import com.searchengine.model.Document;
import com.searchengine.repository.DocumentRepository;
import org.jsoup.nodes.Element;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.time.LocalDateTime;
import java.util.Arrays;

@Service
public class CrawlerService {
    
    @Autowired
    private DocumentRepository docRepo;
    
    @Autowired
    private TextProcessor textProcessor;
    
    @Autowired
    private IndexerService indexerService;
    
    @Autowired
    private AutocompleteService autocompleteService;
    
    @Autowired(required = false)
    private S3Client s3Client;
    
    @Value("${aws.s3.bucket:my-search-engine-data}")
    private String bucket;
    
    @Value("${aws.s3.enabled:false}")
    private boolean s3Enabled;

    /**
     * Process a crawled page: extract content, tokenize, index, and store
     */
    public void processPage(String url, org.jsoup.nodes.Document jsoupDoc) {
        if (docRepo.existsByUrl(url)) {
            return;
        }

        String title = jsoupDoc.title();
        Element body = jsoupDoc.body();
        String bodyText = body != null ? body.text() : "";
        String cleaned = textProcessor.clean(bodyText);
        String tokens = textProcessor.tokenize(cleaned);

        // 1. Save document to database
        Document doc = new Document();
        doc.setUrl(url);
        doc.setTitle(title);
        doc.setRawContent(cleaned);
        doc.setTokens(tokens);
        doc.setCrawledAt(LocalDateTime.now());
        docRepo.save(doc);

        // 2. Upload raw content to S3 (if enabled)
        if (s3Enabled && s3Client != null) {
            try {
                s3Client.putObject(
                    PutObjectRequest.builder()
                        .bucket(bucket)
                        .key("pages/" + doc.getId())
                        .build(),
                    RequestBody.fromString(cleaned)
                );
            } catch (Exception e) {
                System.err.println("Failed to upload to S3: " + e.getMessage());
            }
        }

        // 3. Build inverted index
        indexerService.index(doc);

        // 4. Load tokens into Trie for autocomplete
        if (tokens != null && !tokens.isEmpty()) {
            Arrays.stream(tokens.split("\\s+"))
                  .forEach(autocompleteService::insert);
        }
        
        System.out.println("Processed page: " + url + " (ID: " + doc.getId() + ")");
    }
}
