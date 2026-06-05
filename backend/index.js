const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRouter = require('./routes/auth');
const uploadRouter = require('./routes/upload');
const translationsRouter = require('./routes/translations');
const glossaryRouter = require('./routes/glossary');
const dictionaryRouter = require('./routes/dictionary');
const feedbackRouter = require('./routes/feedback');
const tasksRouter = require('./routes/tasks');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/files', uploadRouter);
app.use('/api/translations', translationsRouter);
app.use('/api/glossary', glossaryRouter);
app.use('/api/dictionary', dictionaryRouter);
app.use('/api/feedback', feedbackRouter);
app.use('/api/tasks', tasksRouter);

app.get('/', (req, res) => {
    res.send('Welcome to TransLingua!');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
