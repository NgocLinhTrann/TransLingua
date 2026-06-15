# TransLingua 🚀

> **Your Dictionary, Your Rules – Learn with Confidence!**

TransLingua is a personal vocabulary builder and active learning companion. It is designed to act as a single, centralized database for language learners to store, organize, and practice terminology from multiple languages simultaneously-replacing scattered notes across paper notebooks, Word documents, and loose spreadsheets.

Watch the TransLingua Product Walkthrough on this link: https://www.youtube.com/watch?si=pzZwqXosbKvJvn8E&v=_l_CYvD0Rrg&feature=youtu.be

---

## ✨ Features

*   **📦 Generic Excel Importer & Parser**: Migrates existing spreadsheets (.xlsx, .xls) dynamically. It utilizes case-insensitive column header mapping (for required Term and Translation columns) while parsing optional pronunciation, category/POS, and notes, automatically registering new languages.
*   **📂 Folder Collections & Tagging**: Organizes vocabulary into custom color-coded folders (Collections) supporting bulk categorization and filtering.
*   **🧠 Spaced Repetition (Leitner 5-Box System)**: Reviews and memorizes terms using a structured flashcard study trainer. Correct recalls advance the card's level, extending the review date, while incorrect recalls reset it to Box 1 for immediate review.
*   **💡 Context-Rich Vocabulary Cards**: Add Pinyin recommendations, standard/custom Parts of Speech (POS), learning notes, and custom usage example sentences (original and translated) to entries.
*   **📋 Real-time Learning Tasks**: Stay organized with built-in to-do task tracking for daily learning objectives.
*   **💬 User Feedback System**: An integrated channel for submitting feature requests and viewing logs (for Admins).
*   **☀️ Premium Dual Theme support**: Smooth toggling between Dark Mode and Light Mode, with settings synchronized in local storage to prevent background flashing.

---

## 🛠️ Technology Stack

*   **Frontend**: React.js, React Router, Axios, Lucide Icons, Vanilla CSS (leveraging HSL color variables and glassmorphism)
*   **Backend**: Node.js, Express.js, Multer
*   **Database**: PostgreSQL
*   **File Processing**: SheetJS (`xlsx`)
*   **Testing**: Jest, Supertest

---

## 📁 Database Schema

The platform structures data using PostgreSQL with the following active schema tables:
*   `users`: Authentication credentials, reset tokens, and verification status.
*   `languages`: Dynamically registered source/target languages.
*   `dictionary`: Main vocabulary cards containing Leitner level statistics and review intervals.
*   `collections`: Color-coded folders created by users to group terms.
*   `dictionary_collections`: Many-to-many relationship tracking tags.
*   `examples`: Sentence examples matching dictionary vocabulary.
*   `feedback`: User-submitted comments and suggestions.
*   `translation_tasks`: Execution histories and stats of imported spreadsheets.

---

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18+)
*   PostgreSQL database

### 1. Database Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Configure your database connection in a `.env` file:
   ```env
   PORT=5000
   DATABASE_URL=postgres://username:password@localhost:5432/translingua
   JWT_SECRET=your_secret_key_here
   ```
3. Run the initialization script to drop, recreate, and seed tables/languages/test users:
   ```bash
   node init_db.js
   ```
   *Note: This creates a pre-verified test user account:*
   * **Email**: `debug@example.com`
   * **Password**: `password123`

### 2. Run the Backend Server
1. From the `backend` directory, install packages and start the server:
   ```bash
   npm install
   npm start
   ```
   The backend server will run on `http://localhost:5000`.

### 3. Run the Frontend Client
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install packages and start the Vite development server:
   ```bash
   npm install
   npm run dev
   ```
   The client will open on `http://localhost:5173`.

---

## 🧪 Running Tests & Build Checks

### Backend Tests (Jest)
To run the 26 integration tests covering authentication, upload schema checks, and feedback scopes:
```bash
cd backend
npm test
```

### Frontend Build Checks
Verify client build assets compilation:
```bash
cd frontend
npm run build
```

---

## 🎞️ Demo Upload File
For testing spreadsheet uploads, use the pre-configured spreadsheet at the root of the project:
👉 **`sample_vocabulary.xlsx`**
