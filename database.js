const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./zhstom.db", (err) => {
  if (err) {
    console.error("Database error:", err.message);
  } else {
    console.log("SQLite database connected");
  }
});

db.run(`
  CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    service TEXT,
    message TEXT,
    status TEXT DEFAULT 'new',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

module.exports = db;