const express = require('express');
const router = express.Router();
const alertaController = require('../controllers/alerta.controller');
const { verificarToken, permitirRoles } = require('../middlewares/auth.middleware');

router.use(verificarToken);
router.use(permitirRoles('Administrador'));

router.get('/', alertaController.listar);
router.get('/mis-alertas', alertaController.misAlertas);
router.get('/sugerencias-pedido', alertaController.sugerenciasPedido);
router.post('/verificar', alertaController.verificarAhora);

module.exports = router;