const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  const { first_name, last_name, email, identity_number, password, city, street, role } = req.body;
  try {
    const { rows } = await pool.query('SELECT 1 FROM users WHERE email=$1', [email]);
    if (rows.length) return res.status(400).json({ message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const insert = await pool.query(
      `INSERT INTO users (first_name, last_name, email, identity_number, password, city, street, role)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING user_id, role`,
      [first_name, last_name, email, identity_number, hashed, city, street, role || 'client']
    );
    const user = insert.rows[0];
    const token = jwt.sign({ id: user.user_id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ message: 'User registered successfully', token });
  } catch (err) {
    res.status(500).json({ message: 'Error registering user', error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
    if (!rows.length) return res.status(400).json({ message: 'User not found' });

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: 'Invalid password' });

    const token = jwt.sign({ id: user.user_id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ message: 'Login successful', token, user: { id: user.user_id, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'Login error', error: err.message });
  }
});

// Get user info
const { authMiddleware } = require('../middlewares/auth');
router.get('/user', authMiddleware, (req, res) => {
  res.json({ id: req.user.id, role: req.user.role });
});

module.exports = router;