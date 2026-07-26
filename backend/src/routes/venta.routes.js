const express = require('express');
const router = express.Router();
const ventaController = require('../controllers/venta.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

router.use(verificarToken);

// RF-1: registrar venta (Administrador o Vendedor)
router.post('/', ventaController.registrar);
router.get('/', ventaController.listar);

// RF-4: buscar productos por nombre (Administrador o Vendedor pueden buscar)
router.get('/productos', ventaController.buscarProductos);

module.exports = router;
