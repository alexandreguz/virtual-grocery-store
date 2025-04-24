const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  const { first_name, last_name, email, identity_number, password, city, street, role } = req.body;
  try {
    console.log('Tentando registrar usuário:', { email, role });
    
    // Verificar se o email já existe
    const { rows } = await pool.query('SELECT 1 FROM users WHERE email=$1', [email]);
    if (rows.length) {
      console.log('Email já registrado:', email);
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash da senha
    const hashed = await bcrypt.hash(password, 10);
    console.log('Senha hasheada com sucesso');

    // Inserir usuário
    const insert = await pool.query(
      `INSERT INTO users (first_name, last_name, email, identity_number, password, city, street, role)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING user_id, role`,
      [first_name, last_name, email, identity_number, hashed, city, street, role || 'client']
    );
    
    const user = insert.rows[0];
    console.log('Usuário inserido com sucesso:', user);

    // Gerar token
    const token = jwt.sign({ id: user.user_id, role: user.role }, process.env.JWT_SECRET || 'test-secret', { expiresIn: '1h' });
    console.log('Token gerado com sucesso');

    res.status(201).json({ 
      message: 'User registered successfully', 
      token,
      user: {
        id: user.user_id,
        email: email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Erro no registro:', err);
    res.status(500).json({ 
      message: 'Error registering user', 
      error: err.message,
      details: err
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    console.log('Tentando login para:', email);
    
    const { rows } = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
    if (!rows.length) {
      console.log('Usuário não encontrado:', email);
      return res.status(400).json({ message: 'User not found' });
    }

    const user = rows[0];
    console.log('Usuário encontrado:', user.email);

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      console.log('Senha inválida para:', email);
      return res.status(400).json({ message: 'Invalid password' });
    }

    const token = jwt.sign({ id: user.user_id, role: user.role }, process.env.JWT_SECRET || 'test-secret', { expiresIn: '1h' });
    console.log('Login bem sucedido, token gerado');

    res.json({ 
      message: 'Login successful', 
      token, 
      user: { 
        id: user.user_id, 
        email: user.email, 
        role: user.role 
      } 
    });
  } catch (err) {
    console.error('Erro no login:', err);
    res.status(500).json({ 
      message: 'Login error', 
      error: err.message,
      details: err
    });
  }
});

// Get user info
const { authMiddleware } = require('../middlewares/auth');
router.get('/user', authMiddleware, (req, res) => {
  res.json({ id: req.user.id, role: req.user.role });
});

module.exports = router;
