require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const app = express();
app.use(bodyParser.json());
app.use(express.json());

// Configuração do banco de dados PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});



const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  console.log("🔑 Authorization Header:", authHeader);

  let token = authHeader?.split(' ')[1];

  token = token?.replace(/"/g, '');
  console.log("📦 Token extraído (sem aspas):", token);

  if (!token) return res.status(403).json({ message: 'Token not provided' });

  console.log("🔐 JWT_SECRET usado:", process.env.JWT_SECRET);

  try {
    const decodedWithoutVerify = jwt.decode(token);
    console.log("🧐 Token decodificado (sem verificação):", decodedWithoutVerify);
  } catch (decodeError) {
    console.log("❌ Erro ao decodificar o token:", decodeError);
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log("❌ Erro na verificação do token:", err);
      return res.status(403).json({ message: 'Invalid token', error: err.message });
    }
    console.log("✅ Token decodificado com sucesso:", decoded);
    req.user = decoded;
    next();
  });
};

const adminMiddleware = (req, res, next) => {
  console.log("🔍 Verificando permissões de admin...");

  if (!req.user) {
    console.log("❌ Usuário não autenticado");
    return res.status(401).json({ message: 'User not authenticated' });
  }

  console.log("👤 Usuário autenticado:", req.user);

  if (req.user.role !== 'admin') {
    console.log(`🚫 Acesso negado para o usuário com role: ${req.user.role}`);
    return res.status(403).json({ message: 'Access denied' });
  }

  console.log("✅ Acesso de admin concedido");
  next();
};


app.post('/api/auth/register', async (req, res) => {
  const { first_name, last_name, email, identity_number, password, city, street, role } = req.body;
  try {
    const emailCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (emailCheck.rows.length > 0) return res.status(400).json({ message: 'Email already registered' });
    
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      `INSERT INTO users (first_name, last_name, email, identity_number, password, city, street, role) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [first_name, last_name, email, identity_number, hashedPassword, city, street, role || 'client']
    );
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error registering user', error });
  }
});


app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    console.log(`🔍 Tentando login para: ${email}`);

    const userQuery = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userQuery.rows.length === 0) {
      console.log("❌ Usuário não encontrado");
      return res.status(400).json({ message: 'User not found' });
    }

    const user = userQuery.rows[0];
    console.log(`✅ Usuário encontrado: ${user.email}`);
    console.log(`🔑 Senha armazenada: ${user.password}`);

    const validPassword = await bcrypt.compare(password, user.password);
    console.log(`🔎 Senha válida? ${validPassword}`);

    if (!validPassword) {
      console.log("❌ Senha incorreta");
      return res.status(400).json({ message: 'Invalid password' });
    }

    const token = jwt.sign({ id: user.user_id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log("✅ Login bem-sucedido, token gerado");

    res.json({ message: 'Login successful', token });
  } catch (error) {
    console.error("🔥 Erro no login:", error);
    res.status(500).json({ message: 'Login error', error });
  }
});


app.get('/api/products', async (req, res) => {
  try {
    const products = await pool.query('SELECT * FROM products');
    res.json(products.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching products', error });
  }
});


const validateProductData = (req, res, next) => {
  const { product_name, category_id, price } = req.body;

  if (!product_name || !category_id || price === undefined) {
    console.log("❗ Dados do produto incompletos:", req.body);
    return res.status(400).json({ message: 'Product name, category ID, and price are required' });
  }

  next();
};


app.post('/api/admin/products', authMiddleware, adminMiddleware, async (req, res) => {
  const { product_name, category_id, price, image, stock_quantity } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO products (product_name, category_id, price, image, stock_quantity) VALUES ($1, $2, $3, $4, $5) RETURNING product_id',
      [product_name, category_id, price, image, stock_quantity]
    );
    res.status(201).json({ message: 'Product created successfully', product_id: result.rows[0].product_id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating product', error });
  }
});

app.post('/api/cart', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('INSERT INTO carts (user_id) VALUES ($1) RETURNING cart_id', [req.user.id]);
    res.status(201).json({ message: 'Cart created', cart_id: result.rows[0].cart_id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating cart', error });
  }
});

app.post('/api/cart/items', authMiddleware, async (req, res) => {
  const { product_id, quantity, price_at_time, cart_id } = req.body;
  try {
    await pool.query('INSERT INTO cart_items (product_id, quantity, price_at_time, cart_id) VALUES ($1, $2, $3, $4)',
      [product_id, quantity, price_at_time, cart_id]
    );
    res.status(201).json({ message: 'Item added to cart' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error adding item to cart', error });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

