the backend is built using Node.js. data is securely handled and stored in an SQLite database.


database.js file contains tables creation. 
- users table saves user username, email, and password hashed for security.
- progress table saves user progress in terms of current level, number of checkpoints reached, score, timer, and oxygen level.
- leaderboard table saves last progress at the end of the level completed in terms of player name, score, time taken to complete the level and player rank.

server.js 
- The server uses Express.js to handle API routes for user registration, login, saving progress, and leaderboard scores.
- Passwords are hashed using bcrypt for secure storage before saving in the SQLite database.
- endpoints handle core backend logic.

users.db
- database that contains tables created.
