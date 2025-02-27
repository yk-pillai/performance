CREATE TABLE articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT,
    summary TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE article_types (
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    type_id UUID REFERENCES types(id) ON DELETE CASCADE,
    PRIMARY KEY (article_id, type_id)
);

CREATE TABLE images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    image_type VARCHAR(50),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE views (
    id BIGSERIAL PRIMARY KEY,
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    client_uuid UUID,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX unique_view_per_user_or_client_uuid
ON views (article_id, COALESCE(user_id, client_uuid));

CREATE TABLE likes (
    id SERIAL PRIMARY KEY,
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (article_id, user_id)
);

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