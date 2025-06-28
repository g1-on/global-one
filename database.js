const sqlite3 = require('sqlite3').verbose();
const DB_SOURCE = 'ananta_contacts.sqlite';

const db = new sqlite3.Database(DB_SOURCE, (err) => {
    if (err) {
        console.error(err.message);
        throw err;
    } else {
        console.log('Connected to the SQLite database.');
        const sql = `
        CREATE TABLE IF NOT EXISTS contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT,
            interest TEXT,
            submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`;
        db.run(sql, (err) => {
            if (err) {
                console.error("Error creating table", err);
            } else {
                console.log("Table 'contacts' is ready.");
            }
        });
    }
});

module.exports = db;