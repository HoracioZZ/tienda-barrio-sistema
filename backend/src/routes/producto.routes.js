const express = require('express');
const router = express.Router();
const productoController = require('../controllers/producto.controller');
const { verificarToken, permitirRoles } = require('../middlewares/auth.middleware');
const upload = require('../config/multer.config');
router.use(verificarToken);

router.get('/', productoController.listar);
router.get('/buscar', productoController.buscar);
router.get('/alertas/stock-bajo', productoController.alertasStockBajo);
router.get('/categoria/:id_categoria', productoController.listarPorCategoria);

// Admin
router.post('/', permitirRoles('Administrador'), productoController.registrar);
router.put('/:id', permitirRoles('Administrador'), productoController.actualizar);
router.delete('/:id', permitirRoles('Administrador'), productoController.eliminar);
router.post('/:id/imagen', permitirRoles('Administrador'), upload.single('imagen'), productoController.subirImagen);
module.exports = router;