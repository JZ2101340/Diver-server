const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./database');
const app = express();
const cookieParser = require('cookie-parser');
//const PORT = 3000;
const bcrypt = require('bcrypt');
app.use(express.urlencoded({ extended: true }));  // ✅ to handle x-www-form-urlencoded POST/PUT
const sqlite3 = require('sqlite3').verbose();
app.use(express.json()); 
app.use(cors()); 
app.use(bodyParser.json()); 
app.use(cookieParser()); 



app.post('/register', (req, res) => {
    const { username, email, password } = req.body;

    
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            return res.status(500).json({ error: 'Error hashing password' });
        }

        const sql = `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`;
        db.run(sql, [username, email, hashedPassword], function (err) {
            if (err) {
                return res.status(400).json({ error: err.message });
            }
            res.json({ id: this.lastID, username, email });
        });
    });
});




app.post('/login', (req, res) => {
    const { email, password } = req.body;

    const sql = `SELECT * FROM users WHERE email = ?`;
    db.get(sql, [email], (err, row) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }

        if (row) {
            
            bcrypt.compare(password, row.password, (err, result) => {
                if (err) {
                    return res.status(500).json({ error: 'Error comparing password' });
                }

                if (result) {
                    
                    res.json({
                        id: row.id,
                        username: row.username,
                        email: row.email
                    });
                } else {
                    
                    res.status(401).json({ error: 'Invalid password' });
                }
            });
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    });
});



app.get('/user/:id', (req, res) => {
    const sql = `SELECT * FROM users WHERE id = ?`;
    db.get(sql, [req.params.id], (err, row) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json(row);
    });
});


app.put('/leaderboard-data', (req, res) => {
    const { user_id, total_score, time_taken } = req.body;
    const sql = `INSERT INTO leaderboard (user_id, total_score, time_taken)
                 VALUES (?, ?, ?)`;
    db.run(sql, [user_id, total_score, time_taken], function (err) {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ message: 'Score recorded successfully' });
    });
});


app.get('/leaderboard', (req, res) => {
    const sql = `
        SELECT users.username, leaderboard.total_score, leaderboard.time_taken
        FROM leaderboard
        JOIN users ON leaderboard.user_id = users.id
        ORDER BY leaderboard.total_score DESC, leaderboard.time_taken ASC
    `;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(400).json({ error: err.message });
        
        
        rows.forEach((row, index) => {
            row.rank = index + 1; 
        });
        
        res.json(rows);
    });
});


app.put('/update-progress', (req, res) => {
    console.log("✅ Received progress update:", req.body);

    const { user_id, current_level, checkpointsReached, oxygen_level, total_score, time_taken } = req.body;

    if (!user_id || !current_level) {
        return res.status(400).json({ error: '❌ Missing user_id or current_level!' });
    }

    const sql = `
        INSERT INTO progress (
            user_id,
            current_level,
            checkpointsReached,
            oxygen_level,
            total_score,
            time_taken
        ) VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(user_id) DO UPDATE SET
            current_level = excluded.current_level,
            checkpointsReached = excluded.checkpointsReached,
            oxygen_level = excluded.oxygen_level,
            total_score = excluded.total_score,
            time_taken = excluded.time_taken
    `;

    db.run(sql, [user_id, current_level, checkpointsReached, oxygen_level, total_score, time_taken], function (err) {
        if (err) {
            console.error("❌ Database Error:", err.message);
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json({ message: '✅ Progress updated successfully!' });
    });
});

// === GET: Fetch Progress ===
app.get('/progress/:user_id', (req, res) => {
    const sql = `SELECT * FROM progress WHERE user_id = ?`;

    db.get(sql, [req.params.user_id], (err, row) => {
        if (err) {
            console.error("❌ Database Error:", err.message);
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: "❌ Progress not found" });
        }
        res.status(200).json(row);
    });
});





app.delete('/user/:id', (req, res) => {
    const deleteUserSQL = `DELETE FROM users WHERE id = ?`;
    const deleteProgressSQL = `DELETE FROM progress WHERE user_id = ?`;
    const deleteLeaderboardSQL = `DELETE FROM leaderboard WHERE user_id = ?`;

    db.run(deleteProgressSQL, [req.params.id], (err) => {
        if (err) return res.status(400).json({ error: err.message });
    });
    db.run(deleteLeaderboardSQL, [req.params.id], (err) => {
        if (err) return res.status(400).json({ error: err.message });
    });
    db.run(deleteUserSQL, [req.params.id], function (err) {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ message: 'User and associated data deleted' });
    });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
