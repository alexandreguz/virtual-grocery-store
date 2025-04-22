// require('dotenv').config();
// const express = require('express');
// const bodyParser = require('body-parser');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const { Pool } = require('pg');
// const cors = require('cors');

// const app = express();
// app.use(bodyParser.json());
// app.use(express.json());
// app.use(cors());

// const pool = new Pool({
//   user: process.env.DB_USER || 'postgres',
//   host: process.env.DB_HOST || 'localhost',
//   database: process.env.DB_NAME || 'grocery_store',
//   password: process.env.DB_PASSWORD || 'postgres',
//   port: process.env.DB_PORT || 5432,
// });

// // Test the database connection
// pool.connect((err, client, done) => {
//   if (err) {
//     console.error('❌ Database connection error:', err);
//   } else {
//     console.log('✅ Database connected successfully');
//     done();
//   }
// });

// // Category name to ID mapping
// const categoryNameToId = {
//   'Fruits': 1,
//   'Vegetables': 2,
//   'Dairy': 3,
//   'Meat, Fish & Eggs': 4,
//   'Beverages': 5,
// };

// const authMiddleware = (req, res, next) => {
//   const authHeader = req.headers['authorization'];
//   console.log("🔑 Authorization Header:", authHeader);

//   let token = authHeader ? authHeader.split(' ')[1] : null;

//   token = token ? token.replace(/"/g, '') : null;
//   console.log("📦 Token extraído (sem aspas):", token);

//   if (!token) return res.status(403).json({ message: 'Token not provided' });

//   console.log("🔐 JWT_SECRET usado:", process.env.JWT_SECRET);

//   try {
//     const decodedWithoutVerify = jwt.decode(token);
//     console.log("🧐 Token decodificado (sem verificação):", decodedWithoutVerify);
//   } catch (decodeError) {
//     console.log("❌ Erro ao decodificar o token:", decodeError);
//   }

//   jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
//     if (err) {
//       console.log("❌ Erro na verificação do token:", err);
//       return res.status(403).json({ message: 'Invalid token', error: err.message });
//     }
//     console.log("✅ Token decodificado com sucesso:", decoded);
//     req.user = decoded;
//     next();
//   });
// };

// const adminMiddleware = (req, res, next) => {
//   console.log("🔍 Verificando permissões de admin...");

//   if (!req.user) {
//     console.log("❌ Usuário não autenticado");
//     return res.status(401).json({ message: 'User not authenticated' });
//   }

//   console.log("👤 Usuário autenticado:", req.user);

//   if (req.user.role !== 'admin') {
//     console.log(`🚫 Acesso negado para o usuário com role: ${req.user.role}`);
//     return res.status(403).json({ message: 'Access denied' });
//   }

//   console.log("✅ Acesso de admin concedido");
//   next();
// };

// app.post('/api/auth/register', async (req, res) => {
//   const { first_name, last_name, email, identity_number, password, city, street, role } = req.body;
//   try {
//     const emailCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
//     if (emailCheck.rows.length > 0) return res.status(400).json({ message: 'Email already registered' });

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const newUser = await pool.query(
//       `INSERT INTO users (first_name, last_name, email, identity_number, password, city, street, role) 
//        VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING user_id, role`,
//       [first_name, last_name, email, identity_number, hashedPassword, city, street, role || 'client']
//     );

//     const user = newUser.rows[0];

//     const token = jwt.sign({ id: user.user_id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

//     res.status(201).json({ message: 'User registered successfully', token });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Error registering user', error });
//   }
// });

// app.get('/api/auth/user', authMiddleware, (req, res) => {
//   try {
//     res.json({
//       id: req.user.id,
//       role: req.user.role
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Error fetching user info', error });
//   }
// });

// app.post('/api/auth/login', async (req, res) => {
//   const { email, password } = req.body;
//   try {
//     console.log(`🔍 Tentando login para: ${email}`);

//     const userQuery = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
//     if (userQuery.rows.length === 0) {
//       console.log("❌ Usuário não encontrado");
//       return res.status(400).json({ message: 'User not found' });
//     }

//     const user = userQuery.rows[0];
//     console.log(`✅ Usuário encontrado: ${user.email}`);
//     console.log(`🔑 Senha armazenada: ${user.password}`);
//     console.log(password)

//     const validPassword = await bcrypt.compare(password, user.password);
//     console.log(`🔎 Senha válida? ${validPassword}`);

//     if (!validPassword) {
//       console.log("❌ Senha incorreta");
//       return res.status(400).json({ message: 'Invalid password' });
//     }

//     const token = jwt.sign({ id: user.user_id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
//     console.log("✅ Login bem-sucedido, token gerado");

//     res.json({ 
//       message: 'Login successful', 
//       token,
//       user: {
//         id: user.user_id,
//         email: user.email,
//         role: user.role,
//         first_name: user.first_name,
//         last_name: user.last_name
//       }
//     });
//   } catch (error) {
//     console.error("🔥 Erro no login:", error);
//     res.status(500).json({ message: 'Login error', error });
//   }
// });

// app.get('/api/products', async (req, res) => {
//   try {
//     const products = await pool.query(
//     `
//       SELECT 
//         p.product_id, 
//         p.product_name, 
//         p.price, 
//         p.image, 
//         c.category_name 
//       FROM products p
//       JOIN categories c ON p.category_id = c.category_id
//       `
//     );
//     console.log('Produtos do banco de dados:', products.rows);
    
//     const formattedProducts = products.rows.map(p => ({
//       id: p.product_id,
//       name: p.product_name,
//       price: p.price,
//       image: p.image,
//       category: p.category_name
//     }));
    
//     console.log('Produtos formatados para o frontend:', formattedProducts);
    
//     res.json(formattedProducts);
//   } catch (error) {
//     console.error('Erro ao buscar produtos:', error);
//     res.status(500).json({ message: 'Erro ao buscar produtos', error });

//   }
// });

// app.get('/api/products/category/:category', async (req, res) => {
//   try {
//     const category = req.params.category;
//     const products = await pool.query(
//     `
//       SELECT 
//         p.product_id, 
//         p.product_name, 
//         p.price, 
//         p.image, 
//         c.category_name 
//       FROM products p
//       JOIN categories c ON p.category_id = c.category_id
//       WHERE c.category_name = $1`, [category]);
//     res.json(products.rows.map(p => ({
//       id: p.product_id,
//       name: p.product_name,
//       price: p.price,
//       image: p.image,
//       category: p.category_name
//     })));
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Error fetching products by category', error });
//   }
// });

// const validateProductData = (req, res, next) => {
//   const { name, price, category, image, quantity } = req.body;

//   if (!name || !category || price === undefined || !image || quantity === undefined) {
//     console.log("❗ Dados do produto incompletos:", req.body);
//     return res.status(400).json({ message: 'Product name, category, price, and image are required' });
//   }
//   if (typeof category !== 'string') {
//     return res.status(400).json({ message: 'Category must be a string' });
//   }
//     if (typeof quantity !== 'number') {
//     return res.status(400).json({ message: 'Quantity must be a number' });
//   }
//   next();
// };

// app.post('/api/products', validateProductData, async (req, res) => {
//   console.log("PRODUCT ADDED: ", req.body);
//   const { name, price, image, category, quantity } = req.body;
//   try {
//     // Convert category name to ID
//     const categoryId = categoryNameToId[category];
//     if (!categoryId) {
//       return res.status(400).json({ message: 'Invalid category name' });
//     }

//     const result = await pool.query(
//       'INSERT INTO products (product_name, price, image, category_id, stock_quantity) VALUES ($1, $2, $3, $4, $5) RETURNING product_id',
//       [name, price, image, categoryId, quantity]
//     );

//     const newProduct = {
//       id: result.rows[0].product_id,
//       name,
//       price,
//       image,
//       category,
//       quantity
//     };

//     res.status(201).json({ message: 'Product created successfully', product: newProduct });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Error creating product', error });
//   }
// });

// app.post('/api/cart', authMiddleware, async (req, res) => {
//   try {
//     const result = await pool.query('INSERT INTO carts (user_id) VALUES ($1) RETURNING cart_id', [req.user.id]);
//     res.status(201).json({ message: 'Cart created', cart_id: result.rows[0].cart_id });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Error creating cart', error });
//   }
// });

// app.post('/api/cart/items', authMiddleware, async (req, res) => {
//   const { product_id, quantity, price } = req.body;
//   const user_id = req.user.id;
  
//   console.log('Received cart item:', { product_id, quantity, price, user_id });
  
//   // Validate required fields
//   if (!product_id || !quantity || !price) {
//     return res.status(400).json({ message: 'Missing required fields. product_id, quantity, and price are required.' });
//   }
  
//   try {
//     await pool.query('INSERT INTO cart_items (product_id, quantity, price, user_id) VALUES ($1, $2, $3, $4)',
//       [product_id, quantity, price, user_id]
//     );
//     res.status(201).json({ message: 'Item added to cart' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Error adding item to cart', error });
//   }
// });

// const PORT = process.env.PORT || 3000;

// // Graceful shutdown handler
// process.on('SIGINT', () => {
//   console.log('🛑 Server shutting down gracefully...');
//   // Close database pool before exiting
//   pool.end().then(() => {
//     console.log('📊 Database connections closed');
//     process.exit(0);
//   }).catch(err => {
//     console.error('❌ Error closing database connections:', err);
//     process.exit(1);
//   });
// });

// // Ensure JWT_SECRET is defined
// if (!process.env.JWT_SECRET && process.env.NODE_ENV == 'test') {
//   console.warn('⚠️ JWT_SECRET environment variable not set! Using a default value for development.');
//   process.env.JWT_SECRET = 'default-jwt-secret-for-development-only';
// }

// app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
// });


require('dotenv').config();
const app = require('./app');
const pool = require('./db');

const PORT = process.env.PORT || 3000;

// Test DB connection on startup
pool.connect((err, client, done) => {
  if (err) console.error('❌ DB connection error:', err);
  else {
    console.log('✅ DB connected');
    done();
  }
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));