require('dotenv').config();
const pool = require('../models/db');
pool.query('DROP TABLE IF EXISTS glossary, translations CASCADE')
    .then(() => {
        console.log('Successfully dropped glossary and translations tables.');
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
