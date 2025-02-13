-- Creating articles table
CREATE TABLE articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT,
    summary TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Creating types table (defines the different article types)
CREATE TABLE types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL -- Unique type names (e.g., blog, news, tutorial)
);

-- Creating article_types table (many-to-many relationship between articles and types)
CREATE TABLE article_types (
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    type_id UUID REFERENCES types(id) ON DELETE CASCADE,
    PRIMARY KEY (article_id, type_id) -- Prevent duplicate type associations for an article
);

-- Creating images table (articles can have multiple images)
CREATE TABLE images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    image_type VARCHAR(50),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Creating views table (tracks views for anonymous users via session_id)
CREATE TABLE views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    session_id UUID NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (article_id, session_id) -- Prevent multiple views from the same session on the same article
);

-- Creating likes table (tracks likes for anonymous users via session_id)
CREATE TABLE likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    session_id UUID NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (article_id, session_id) -- Prevent multiple likes from the same session on the same article
);

-- Creating session table to store session details (anonymous users)
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- -- Inserting articles
-- INSERT INTO articles (title, content) 
-- VALUES 
--     ('Article 1', 'This is the content of the first article.'),
--     ('Article 2', 'This is the content of the second article.'),
--     ('Article 3', 'This is the content of the third article.');

-- -- Inserting images for articles (assuming images for Article 1 and Article 2)
-- INSERT INTO images (article_id, image_url, image_type)
-- VALUES
--     ((SELECT id FROM articles WHERE title = 'Article 1'), '/images/image1.jpg', 'hero'),
--     ((SELECT id FROM articles WHERE title = 'Article 2'), '/images/image2.jpg', 'hero'),
--     ((SELECT id FROM articles WHERE title = 'Article 3'), '/images/image3.jpg', 'hero');

-- -- Inserting dummy session data
-- INSERT INTO sessions (id) 
-- VALUES 
--     (gen_random_uuid()),
--     (gen_random_uuid()),
--     (gen_random_uuid());

-- -- Inserting views for articles (random sessions, articles)
-- INSERT INTO views (article_id, session_id) 
-- VALUES
--     ((SELECT id FROM articles WHERE title = 'Article 1'), (SELECT id FROM sessions LIMIT 1)),
--     ((SELECT id FROM articles WHERE title = 'Article 2'), (SELECT id FROM sessions LIMIT 1 OFFSET 1)),
--     ((SELECT id FROM articles WHERE title = 'Article 3'), (SELECT id FROM sessions LIMIT 1 OFFSET 1));

-- -- Inserting likes for articles (random sessions, articles)
-- INSERT INTO likes (article_id, session_id) 
-- VALUES
--     ((SELECT id FROM articles WHERE title = 'Article 2'), (SELECT id FROM sessions LIMIT 1)),
--     ((SELECT id FROM articles WHERE title = 'Article 3'), (SELECT id FROM sessions LIMIT 1));


INSERT INTO types (name) VALUES 
('Technology'),
('Food'),
('Finance'),
('History'),
('Current affairs'),
('News'),
('Luxury'),
('Clothes'),
('Cars'),
('Bikes'),
('Space'),
('Business'),
('Cinema'),
('Government'),
('Health'),
('Mental Health'),
('Blog'),
('Tutorial');