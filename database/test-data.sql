-- ══════════════════════════════════════════════════════════════════════════════
-- TEST DATA FOR SEARCH ENGINE
-- Run this to insert sample data for testing
-- ══════════════════════════════════════════════════════════════════════════════

-- Insert test documents
INSERT INTO documents (url, title, raw_content, tokens, crawled_at) VALUES
    ('https://en.wikipedia.org/wiki/Java', 
     'Java (programming language)', 
     'Java is a high-level, class-based, object-oriented programming language that is designed to have as few implementation dependencies as possible.',
     'java high level class based object oriented programming language designed implementation dependencies',
     NOW()),
    ('https://en.wikipedia.org/wiki/Python', 
     'Python (programming language)', 
     'Python is a high-level, general-purpose programming language. Its design philosophy emphasizes code readability with the use of significant indentation.',
     'python high level general purpose programming language design philosophy code readability indentation',
     NOW()),
    ('https://en.wikipedia.org/wiki/Spring_Framework', 
     'Spring Framework', 
     'The Spring Framework is an application framework and inversion of control container for the Java platform.',
     'spring framework application inversion control container java platform',
     NOW())
ON CONFLICT (url) DO NOTHING;

-- Insert inverted index entries for "java"
INSERT INTO inverted_index (token, doc_id, freq) VALUES
    ('java', 1, 3),
    ('programming', 1, 2),
    ('language', 1, 1),
    ('high', 1, 1),
    ('level', 1, 1),
    ('object', 1, 1),
    ('oriented', 1, 1)
ON CONFLICT DO NOTHING;

-- Insert inverted index entries for "python"
INSERT INTO inverted_index (token, doc_id, freq) VALUES
    ('python', 2, 3),
    ('programming', 2, 2),
    ('language', 2, 1),
    ('high', 2, 1),
    ('level', 2, 1),
    ('code', 2, 1),
    ('readability', 2, 1)
ON CONFLICT DO NOTHING;

-- Insert inverted index entries for "spring"
INSERT INTO inverted_index (token, doc_id, freq) VALUES
    ('spring', 3, 2),
    ('framework', 3, 2),
    ('java', 3, 1),
    ('application', 3, 1),
    ('container', 3, 1)
ON CONFLICT DO NOTHING;

-- Insert sample search queries
INSERT INTO search_queries (query, count, clicks, last_searched_at) VALUES
    ('java programming', 15, 8, NOW()),
    ('python tutorial', 12, 5, NOW()),
    ('spring boot', 10, 4, NOW()),
    ('web development', 8, 3, NOW())
ON CONFLICT (query) DO UPDATE SET 
    count = search_queries.count + 1,
    last_searched_at = NOW();

-- Verify data
SELECT '=== Documents ===' AS info;
SELECT id, title, url FROM documents;

SELECT '=== Inverted Index (sample) ===' AS info;
SELECT token, COUNT(*) as doc_count, SUM(freq) as total_freq
FROM inverted_index
GROUP BY token
ORDER BY doc_count DESC
LIMIT 10;

SELECT '=== Search Analytics ===' AS info;
SELECT query, count, clicks FROM search_queries ORDER BY count DESC;
