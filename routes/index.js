const express = require('express');
const router = express.Router();
const openpayRoutes = require('./openpay');

// Si deseas, monta más rutas para tu app aquí
router.use('/openpay', openpayRoutes);

module.exports = router;