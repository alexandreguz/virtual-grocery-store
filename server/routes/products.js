const express = require('express');
const pool = require('../db');
const { authMiddleware, adminMiddleware } = require('../middlewares/auth');

const router = express.Router();

const categoryNameToId = {
  Fruits: 1,
  Vegetables: 2,
  Dairy: 3,
  'Meat, Fish & Eggs': 4,
  Beverages: 5,
};

// List all products
router.get('/products', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT p.product_id, p.product_name, p.price, p.image, c.category_name
       FROM products p JOIN categories c ON p.category_id=c.category_id`
    );
    res.json(rows.map(p => ({ id: p.product_id, name: p.product_name, price: p.price, image: p.image, category: p.category_name })));
  } catch (err) {
    res.status(500).json({ message: 'Error fetching products', error: err.message });
  }
});

// List by category
router.get('/products/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { rows } = await pool.query(
      `SELECT p.product_id, p.product_name, p.price, p.image, c.category_name
       FROM products p JOIN categories c ON p.category_id=c.category_id WHERE c.category_name=$1`,
      [category]
    );
    res.json(rows.map(p => ({ id: p.product_id, name: p.product_name, price: p.price, image: p.image, category: p.category_name })));
  } catch (err) {
    res.status(500).json({ message: 'Error fetching by category', error: err.message });
  }
});

// Create product (admin only)
const validateProduct = (req, res, next) => {
  const { name, price, image, category, quantity } = req.body;
  if (!name || price===undefined || !image || !category || quantity===undefined) {
    return res.status(400).json({ message: 'Missing fields' });
  }
  next();
};

router.post('/products', authMiddleware, adminMiddleware, validateProduct, async (req, res) => {
  try {
    const { name, price, image, category, quantity } = req.body;
    const categoryId = categoryNameToId[category];
    if (!categoryId) return res.status(400).json({ message: 'Invalid category' });

    const { rows } = await pool.query(
      'INSERT INTO products (product_name, price, image, category_id, stock_quantity) VALUES ($1,$2,$3,$4,$5) RETURNING product_id',
      [name, price, image, categoryId, quantity]
    );
    res.status(201).json({ message: 'Product created', product: { id: rows[0].product_id, name, price, image, category, quantity } });
  } catch (err) {
    res.status(500).json({ message: 'Error creating product', error: err.message });
  }
});

module.exports = router;
