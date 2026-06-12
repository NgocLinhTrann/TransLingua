CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role VARCHAR(50) NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    reset_token VARCHAR(255),
    reset_token_expires TIMESTAMP
);

CREATE TABLE languages (
    code VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE dictionary (
    dict_id SERIAL PRIMARY KEY,
    source_lang VARCHAR(10) REFERENCES languages(code) DEFAULT 'zh',
    target_lang VARCHAR(10) REFERENCES languages(code) DEFAULT 'vi',
    term VARCHAR(255) NOT NULL,
    pronunciation VARCHAR(255),
    translation TEXT NOT NULL,
    part_of_speech VARCHAR(50),
    notes TEXT,
    box_level INTEGER DEFAULT 1,
    next_review_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(user_id),
    verified_by INTEGER REFERENCES users(user_id)
);

CREATE TABLE collections (
    collection_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    color_code VARCHAR(50) DEFAULT '#6366f1',
    created_by INTEGER REFERENCES users(user_id),
    source_lang VARCHAR(10) REFERENCES languages(code) DEFAULT 'zh',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (created_by, source_lang, name)
);

CREATE TABLE dictionary_collections (
    dict_id INTEGER REFERENCES dictionary(dict_id) ON DELETE CASCADE,
    collection_id INTEGER REFERENCES collections(collection_id) ON DELETE CASCADE,
    PRIMARY KEY (dict_id, collection_id)
);

CREATE TABLE examples (
    example_id SERIAL PRIMARY KEY,
    dict_id INTEGER REFERENCES dictionary(dict_id) ON DELETE CASCADE,
    original_sentence TEXT NOT NULL,
    translated_sentence TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE feedback (
    feedback_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE translation_tasks (
    task_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    file_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'completed',
    total_terms INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
