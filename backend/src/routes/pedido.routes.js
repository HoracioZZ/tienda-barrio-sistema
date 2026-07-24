const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedido.controller');
const { verificarToken, permitirRoles } = require('../middlewares/auth.middleware');

router.use(verificarToken, permitirRoles('Administrador'));

router.get('/', pedidoController.listar);
router.get('/sugerencias', pedidoController.sugerencias);
router.get('/proveedores', pedidoController.proveedores);
router.post('/proveedores', pedidoController.crearProveedor);
router.get('/productos', pedidoController.productos);
router.get('/:id', pedidoController.obtener);
router.post('/', pedidoController.registrar);
router.patch('/:id/estado', pedidoController.cambiarEstado);

module.exports = router;