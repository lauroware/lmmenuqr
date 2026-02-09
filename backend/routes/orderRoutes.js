const express = require('express');
const { createOrderPdf } = require('../controllers/orderController');

const router = express.Router();

// POST /api/orders  -> crea pdf y devuelve link
router.post('/', createOrderPdf);

module.exports = router;
