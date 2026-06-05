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

CREATE TABLE translations (
    id SERIAL PRIMARY KEY,
    original_text TEXT NOT NULL,
    translated_text TEXT NOT NULL,
    created_by INTEGER REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE glossary (
    term_id SERIAL PRIMARY KEY,
    term VARCHAR(255) NOT NULL,
    translation TEXT NOT NULL,
    created_by INTEGER REFERENCES users(user_id)
);

CREATE TABLE dictionary (
    dict_id SERIAL PRIMARY KEY,
    term VARCHAR(255) NOT NULL,
    translation TEXT NOT NULL,
    created_by INTEGER REFERENCES users(user_id),
    verified_by INTEGER REFERENCES users(user_id)
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
