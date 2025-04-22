const express = require('express');
const pool = require('../db');
const { authMiddleware } = require('../middlewares/auth');

const router = express.Router();

// Create cart
router.post('/cart', authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query('INSERT INTO carts (user_id) VALUES ($1) RETURNING cart_id', [req.user.id]);
    res.status(201).json({ message: 'Cart created', cart_id: rows[0].cart_id });
  } catch (err) {
    res.status(500).json({ message: 'Error creating cart', error: err.message });
  }
});

// Add item
router.post('/cart/items', authMiddleware, async (req, res) => {
  const { product_id, quantity, price } = req.body;
  if (!product_id || quantity===undefined || price===undefined)
    return res.status(400).json({ message: 'Missing fields' });

  try {
    await pool.query(
      `INSERT INTO cart_items (product_id, quantity, price, user_id) VALUES ($1,$2,$3,$4)`,
      [product_id, quantity, price, req.user.id]
    );
    res.status(201).json({ message: 'Item added' });
  } catch (err) {
    res.status(500).json({ message: 'Error adding item', error: err.message });
  }
});

module.exports = router;