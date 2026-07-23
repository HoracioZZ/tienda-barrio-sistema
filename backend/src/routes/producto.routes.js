const express = require('express');
const router = express.Router();
const productoController = require('../controllers/producto.controller');
const { verificarToken, permitirRoles } = require('../middlewares/auth.middleware');

router.use(verificarToken);

router.get('/', productoController.listar);
router.get('/buscar', productoController.buscar);
router.get('/alertas/stock-bajo', productoController.alertasStockBajo);

// Solo Administrador puede crear productos (gestion de catalogo)
router.post('/', permitirRoles('Administrador'), productoController.registrar);

module.exports = router;
