const express = require('express');
const router = express.Router();
const reporteController = require('../controllers/reporte.controller');
const { verificarToken, permitirRoles } = require('../middlewares/auth.middleware');

router.use(verificarToken, permitirRoles('Administrador'));

router.post('/', reporteController.generar);
router.get('/productos-mas-vendidos', reporteController.masVendidos);

module.exports = router;
