# TransLingua Product Specification

## Product Overview
TransLingua is a web-based personal vocabulary and flashcard learning companion designed to help language learners manage, practice, and memorize terms. By combining user-generated dictionary entries, generic Excel vocabulary uploads, collection-based tagging, and a built-in Spaced Repetition Leitner system, the platform facilitates highly personalized active vocabulary acquisition.

## Functional Requirements

### User Authentication
- Users must be able to register and log in using an email and password.
- Passwords must be stored securely using hashing (bcrypt).
- Users can verify their email address and reset their passwords via secure email-based tokens.
- The Login interface presents the active slogan "Learn with Confidence" to define the application's learning purpose.

### Generic Excel Importer & Parser
- Users can upload vocabulary spreadsheets (.xlsx and .xls formats) to bulk-import terms.
- **Strict Headers Verification**: System validates headers case-insensitively. The spreadsheet must contain a column for term/word (e.g. `Term`, `Original`, `Word`) and a column for translation (e.g. `Translation`, `Meaning`).
- **Optional Custom Fields**: Recognizes optional headers for pronunciation (`Pronunciation`, `Pinyin`), part of speech (`Category`, `POS`, `Part of Speech`), and usage notes (`Notes`, `Note`).
- **Language Auto-Registration**: Scans selected source/target languages and registers them dynamically if not already present.
- **Collection Linking**: Allows users to select multiple folder collections to automatically link all imported terms to those checked collections.

### Database Schema (PostgreSQL)
The backend manages data structure using the following schema tables:
- **`users` Table**: `user_id`, `email`, `password_hash`, `role`, `is_verified`, `verification_token`, `reset_token`, `reset_token_expires`
- **`languages` Table**: `code` (PK), `name` (e.g., `en`, `zh`, `vi`)
- **`dictionary` Table**: `dict_id`, `source_lang` (FK), `target_lang` (FK), `term`, `pronunciation` (Pinyin), `translation`, `part_of_speech`, `notes`, `box_level` (Leitner box 1-5), `next_review_at`, `created_by`, `verified_by`
- **`collections` Table**: `collection_id`, `name`, `color_code`, `created_by`, `source_lang`, `created_at`
- **`dictionary_collections` Table**: `dict_id` (FK), `collection_id` (FK) (supporting many-to-many tag associations)
- **`examples` Table**: `example_id`, `dict_id` (FK), `original_sentence`, `translated_sentence`, `created_at`
- **`feedback` Table**: `feedback_id`, `user_id` (FK), `content`, `created_at`
- **`translation_tasks` Table**: `task_id`, `user_id` (FK), `file_name`, `status`, `total_terms`, `created_at` (logs import tasks and stats)

### Dictionary & Active Learning System
- **CRUD Dictionary Entries**: Users can manually create, search, filter, edit, and delete vocabulary records.
- **Folders / Collections**: Organize terms into color-coded folders (Collections). Allows bulk tagging of entries to folders.
- **Rich Linguistic Context**: Includes pinyin pronunciation recommendation, standard Part of Speech dropdown categories, and usage sentence examples (original and translation).
- **Spaced Repetition Review**: Built-in flashcard review module implementing a 5-Box Leitner spaced repetition scheduling algorithm. Cards advance on correct responses, reset to Box 1 on errors, and are scheduled for next review based on Leitner guidelines.

### User Feedback System
- Users can submit feature requests and usability feedback.
- Admins can query and view feedback logs.

### Upload Task Logging
- Track history of imported files under the `translation_tasks` table, recording file names, parsing status, and total words added.

### UI Themes & Layout
- Support both premium **Dark Mode** and **Light Mode** interfaces, toggleable instantly from the header navigation. Prevent layout flashes on reload using local storage synchronization.
- **Navbar Profile Badge**: Displays user's name cleanly. Omits the redundant `(user)` role text for standard users, while retaining the role label for administrator logins (e.g. `(admin)`).

## Non-Functional Requirements
- **Performance**: High-efficiency file parsing and database transactions, enabling rapid bulk import of large spreadsheets.
- **Security**: Strict route protection via JSON Web Tokens (JWT) and secure hashing of passwords.
- **Usability**: Responsive layouts, modern typography, harmonic color themes, and smooth micro-animations.

## Technology Stack
- **Frontend**: React.js, React Router, Axios, Lucide Icons, Vanilla CSS
- **Backend**: Node.js with Express.js, Multer
- **Database**: PostgreSQL (pg pool)
- **File Processing**: SheetJS (`xlsx`) for spreadsheet parsing

---

**Product Name**: TransLingua  
**Slogan**: Your Dictionary, Your Rules – Learn with Confidence!