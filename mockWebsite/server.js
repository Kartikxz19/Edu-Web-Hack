// server.js
const express = require('express');
const sqlite3 = require('sqlite3');
const app = express();
const db = new sqlite3.Database(':memory:');

// Set up database with more realistic sample data
db.serialize(() => {
  // Users table with sensitive information
  db.run(`CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    username TEXT,
    password TEXT,
    email TEXT,
    credit_card TEXT,
    api_key TEXT
  )`);

  // Insert sample user data
  const users = [
    ['admin', 'admin123!@#', 'admin@company.com', '4532-1234-5678-9012', 'sk_live_123456789abcdef'],
    ['john_doe', 'password123', 'john@email.com', '4532-8765-4321-9012', 'sk_live_987654321abcdef'],
    ['mary_smith', 'mary2024!', 'mary@email.com', '4532-9999-8888-7777', 'sk_live_abcdef123456789']
  ];

  const insertUser = db.prepare('INSERT INTO users (username, password, email, credit_card, api_key) VALUES (?, ?, ?, ?, ?)');
  users.forEach(user => insertUser.run(user));
  insertUser.finalize();

  // Customer data table
  db.run(`CREATE TABLE customer_data (
    id INTEGER PRIMARY KEY,
    name TEXT,
    address TEXT,
    phone TEXT,
    ssn TEXT
  )`);

  // Insert sample customer data
  const customers = [
    ['Alice Johnson', '123 Main St, City, 12345', '555-0123', '123-45-6789'],
    ['Bob Wilson', '456 Oak Ave, Town, 67890', '555-4567', '987-65-4321'],
    ['Carol Brown', '789 Pine Rd, Village, 11223', '555-8901', '456-78-9012']
  ];

  const insertCustomer = db.prepare('INSERT INTO customer_data (name, address, phone, ssn) VALUES (?, ?, ?, ?)');
  customers.forEach(customer => insertCustomer.run(customer));
  insertCustomer.finalize();
});

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Vulnerable endpoint - SQL Injection
app.get('/api/user', (req, res) => {
  const username = req.query.username;
  // Intentionally vulnerable SQL query
  const query = `SELECT * FROM users WHERE username = '${username}'`;

  db.all(query, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// Additional vulnerable endpoint - Customer Search
app.get('/api/customer', (req, res) => {
  const name = req.query.name;
  const query = `SELECT * FROM customer_data WHERE name LIKE '%${name}%'`;

  db.all(query, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// Vulnerable endpoint - XSS
app.post('/api/comments', (req, res) => {
  const comment = req.body.comment;
  // Store comment without sanitization
  comments.push(comment);
  res.json({ success: true, comment });
});

// Vulnerable endpoint - Information Disclosure
app.get('/api/debug', (req, res) => {
  res.json({
    environment: process.env,
    serverInfo: {
      version: "Express 4.17.1",
      database: "SQLite 3.32.3",
      secretKey: "super_secret_key_123"
    }
  });
});

app.listen(3000, () => {
  console.log('Vulnerable demo server running on http://localhost:3000');
});