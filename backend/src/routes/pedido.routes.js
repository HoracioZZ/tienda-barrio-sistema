const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedido.controller');
const { verificarToken, permitirRoles } = require('../middlewares/auth.middleware');

router.use(verificarToken, permitirRoles('Administrador'));

router.get('/', pedidoController.listar);
router.get('/sugerencias', pedidoController.sugerencias);
router.post('/', pedidoController.registrar);

module.exports = router;
