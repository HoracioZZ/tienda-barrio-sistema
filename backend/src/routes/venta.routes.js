const express = require('express');
const router = express.Router();
const ventaController = require('../controllers/venta.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

router.use(verificarToken);

// RF-1: registrar venta (Administrador o Vendedor)
router.post('/', ventaController.registrar);
router.get('/', ventaController.listar);

module.exports = router;
