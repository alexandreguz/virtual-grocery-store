const express = require('express');
const authRoutes = require('./auth');
const productRoutes = require('./products');
const cartRoutes = require('./cart');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/', productRoutes);
router.use('/', cartRoutes);

module.exports = router;