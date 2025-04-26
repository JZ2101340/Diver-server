const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./users.db', (err) => {
    if (err) {
        console.error("Error opening database:", err.message);
    } else {
        console.log("Connected to SQLite database");
        // users table
        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL
            )
        `);

        // progress table
        db.run(`
            CREATE TABLE IF NOT EXISTS progress (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER UNIQUE,
                current_level TEXT DEFAULT 'Easy',
                checkpointsReached INTEGER DEFAULT 0,
                oxygen_level INTEGER DEFAULT 100,
                total_score INTEGER DEFAULT 0,
                time_taken INTEGER DEFAULT 0,
                FOREIGN KEY(user_id) REFERENCES users(id)
            )
        `);
// leaderboard table

        db.run(`
            CREATE TABLE IF NOT EXISTS leaderboard (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            total_score INTEGER NOT NULL,
            time_taken INTEGER NOT NULL,
            level_name TEXT NOT NULL,
            recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id),
            UNIQUE(user_id, level_name) 
        );

        `);
        
        
    }
});

module.exports = db;
