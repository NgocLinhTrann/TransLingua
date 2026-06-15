# TransLingua Product Analysis

## Overview
TransLingua has evolved from an enterprise Translation Management System (TMS) into a personal vocabulary builder and flashcard study platform. The platform is optimized for active language learning, helping users catalog new terminology dynamically, import existing vocabulary spreadsheets, organize terms into folder collections, and review them using a Spaced Repetition Leitner scheduling algorithm.

## Key Features

1. **User Authentication**  
   - Traditional email registration, JWT-based login, and account verification.
   - User password resetting via secure verification tokens sent to their email.
   - Updated login interface features "Learn with Confidence" brand subtitle to clarify vocabulary learning scope.

2. **Generic Excel Importer & Parser**  
   - Flexible column parser supporting Excel files (.xlsx and .xls formats).
   - Strict validation demanding at least one column for the word/term (e.g., `Word`, `Term`, `Original`) and one for the definition/meaning (e.g., `Translation`, `Meaning`).
   - Dynamic scanning of optional columns (`Pronunciation`, `Category`/`POS`, `Notes`) and automatic registration of select languages in the system.
   - Links the entire spreadsheet import batch to selected collection folders in a single bulk operation.

3. **Active Learning Dictionary System**  
   - CRUD capabilities for manual vocabulary additions and updates.
   - Nested collections and color-coded tag folders. Supports bulk tagging operations to categorize vocabulary.
   - Rich fields: Pinyin transliteration recommendations, Part of Speech categories, and optional usage examples.

4. **Spaced Repetition Review Mode**  
   - Flashcard queue utilizing a Leitner 5-Box Spaced Repetition scheduling mechanism.
   - Correctly answered terms advance to the next box (up to Box 5), while incorrect answers reset back to Box 1, scheduling reviews at increasing time intervals.

5. **User Feedback System**  
   - Integrated interface for users to submit feature feedback and usability suggestions.
   - Secure dashboard for administrators to review user submissions.

6. **Spreadsheet Upload Task Logs**  
   - Keeps track of all uploaded spreadsheets, showing filename, status, total vocabulary terms parsed, and creation timestamp.

7. **Theme Toggler & Layout**  
   - Smooth toggling between Light and Dark visual modes, storing preferences in local storage to prevent layout flash on reload.
   - Header profile badge displays user's username cleanly by removing redundant role markers for regular accounts, keeping them only for administrative users.

## User Roles
- **Admin**  
   - Monitor the system, review user feedback logs, and oversee user roles.
  
- **User**  
   - Upload spreadsheets, manage vocabulary dictionaries, study Leitner flashcard queues, track task history logs, and provide usability feedback.

## Technical Stack
- **Frontend**: React.js, React Router, Axios, Lucide Icons, Vanilla CSS (with CSS Custom Variables for dynamic theming)
- **Backend**: Node.js with Express.js, Multer
- **Database**: PostgreSQL (pg pool)
- **File Processing**: SheetJS (`xlsx`) for spreadsheet parsing

## Development Timeline
1. **Phase 1: Project Setup and Infrastructure**  
   - Initialize Git repository, configure environment, build PostgreSQL database schema, and integrate Jest test framework.
2. **Phase 2: User Authentication & File Upload core**  
   - Implement user sign-up/login, JWT guards, file upload parser logic, validation of required/optional headers, and backend import transactions.
3. **Phase 3: Active Learning Features**  
   - Implement manual dictionary CRUD, color-coded folders/collections, sentence examples, and the Leitner Leitner Box spaced repetition scheduler.
4. **Phase 4: Feedback, Task Logs & Themes**  
   - Add the feedback routes, task execution log routes, Light Mode stylesheets, and the client theme toggler.
5. **Phase 5: Verification & Testing**  
   - Perform end-to-end user flows verification, fix styling, and validate Jest test suites to ensure clean production builds.

## Conclusion
TransLingua provides an active learning system that helps language learners organize their learning materials. By shifting from standard document translation management to customized Leitner-based vocabulary acquisition, it empowers users to build their dictionaries and learn with confidence.

---

**Product Name**: TransLingua  
**Slogan**: Your Dictionary, Your Rules – Learn with Confidence!