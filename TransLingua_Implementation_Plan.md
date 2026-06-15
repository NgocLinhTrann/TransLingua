# TransLingua Implementation Plan

## Overview
This implementation plan outlines the development phases for the TransLingua personal vocabulary and spaced repetition flashcard learning platform. It replaces the enterprise TMS architecture with an active vocabulary builder and flashcard trainer.

---

### Phase 1: Project Setup and Infrastructure (Weeks 1-2)

1. **Project Initialization**  
   - Set up the project repository structure for both the backend (Node.js + Express) and client (Vite + React).

2. **Environment & Configuration**  
   - Configure environment variables (`.env`) for database credentials, JWT secret keys, and email service simulation.

3. **Database Schema Design (PostgreSQL)**  
   - Establish the primary schema mirroring the active tables in `schema.sql`:
     - **`users` Table**: Manage profile data, bcrypt password hashes, activation state, and reset tokens.
     - **`languages` Table**: Code key (`zh`, `vi`, `en`, etc.) and printable language name.
     - **`dictionary` Table**: Main vocabulary store containing translation fields, Pinyin pronunciation, Part of Speech classification, notes, and Spaced Repetition values (`box_level` and `next_review_at`).
     - **`collections` Table**: User-defined color-coded folders mapped to specific source languages.
     - **`dictionary_collections` Table**: Many-to-many lookup table linking terms to collection folders.
     - **`examples` Table**: Optional usage examples containing original and translated sentences for a term.
     - **`feedback` Table**: Usability comments submitted by users.
     - **`translation_tasks` Table**: Record histories of Excel upload tasks and vocabulary size statistics.

4. **Testing Infrastructure**  
   - Configure the backend testing suite using `Jest` and Supertest.

---

### Phase 2: Authentication and Generic Spreadsheet Importer (Weeks 3-5)

1. **Authentication API & Frontend**  
   - Build JWT-secured signup, login, email validation, and password reset endpoints.
   - Code corresponding client forms with error notifications.
   - Update Login page with subtitle "Learn with Confidence" to reflect the brand pivot.

2. **Generic Spreadsheet Upload Parser**  
   - Configure `multer` on the backend to receive incoming `.xlsx` and `.xls` files.
   - Employ SheetJS (`xlsx`) to extract data lines.
   - **Case-Insensitive Validation**: Implement header checks verifying the presence of required terms (e.g., `Term`, `Original`, `Word`) and definitions (e.g., `Translation`, `Meaning`). Return `400 Bad Request` if missing.
   - **Linguistic Extractors**: Parse optional pronunciation, category/POS, and notes columns.
   - **Transaction Imports & Collections Tagging**: Process database inserts inside a SQL transaction. Auto-register unrecognized languages in the database and link terms to selected collections.

3. **Integration Tests**  
   - Formulate tests validating headers compliance, language registration, and tagging operations during upload.

---

### Phase 3: Active Learning Dictionary & Leitner Flashcards (Weeks 6-8)

1. **Dictionary CRUD & Tagging UI**  
   - Develop manual vocabulary creation, updating, search, and deletion routes.
   - Implement folder collections creation, tagging, color updating, and bulk operations (bulk tag, bulk delete).

2. **Rich Dictionary Context**  
   - Integrate autocomplete client-side Pinyin recommendations and a Part of Speech dropdown list with optional custom overrides.
   - Code forms to add sentence examples.

3. **Spaced Repetition Flashcard Scheduler**  
   - Build Leitner 5-Box flashcard study scheduler:
     - Correct answers increment the card's `box_level` by 1 and delay its `next_review_at` time.
     - Incorrect answers reset `box_level` back to 1 and make the card due immediately.
     - Schedule reviews based on box level (e.g. Box 1: review daily; Box 5: review in 30 days).

---

### Phase 4: Feedback, Task Logs, and UI Themes (Weeks 9-10)

1. **Feedback & Task History Modules**  
   - Implement user feedback submissions and administrator logs dashboard.
   - Code the upload task log page listing historical spreadsheet names, total imported terms, and status.

2. **Light & Dark Theme Styling & Layout Refinements**  
   - Set up CSS Custom Properties (variables) in `index.css` for primary/secondary backgrounds, text colors, cards, and borders.
   - Inject a theme loader script in index.html to read `theme` from `localStorage` immediately to prevent styling flash.
   - Build a toggler button in `Navbar.jsx` with Sun/Moon icons, dynamically toggling `data-theme` attributes on the root HTML tag.
   - Ensure native dropdowns, selects (`.select-styled`), and search inputs render with dark text on white backgrounds in Light Mode, and white text on dark in Dark Mode.
   - Refactor Navbar profile badge to display username cleanly without redundant standard user role tags (omitting `(user)` text).

---

### Phase 5: Verification and Testing

1. **Automated Testing Validation**  
   - Execute all Jest backend tests to verify database constraints, JWT routes, and spreadsheet validations:
     ```bash
     npm test
     ```

2. **Frontend Build Verification**  
   - Run production compilation of client files using Vite to guarantee zero syntax or assets loading errors:
     ```bash
     npm run build
     ```

---

### Timeline Summary
- **Weeks 1-2**: Schema setup, environment configurations, base API routing, and testing library installation.
- **Weeks 3-5**: Authentication routes, JWT middleware, generic Excel parser, transactional database insertions, and import tests.
- **Weeks 6-8**: Manual dictionary management, collection tagging/folders, Leitner flashcard logic, and practice review UI.
- **Weeks 9-10**: Feedback forms, upload task logs, light/dark mode stylesheet synchronization, and end-to-end user verification.

---

### Conclusion
This implementation plan serves as a roadmap to maintain a clean codebase for TransLingua, delivering a high-quality active vocabulary platform with robust spaced repetition tools.