const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/cliente.controller');
const { verificarToken, permitirRoles } = require('../middlewares/auth.middleware');

router.use(verificarToken, permitirRoles('Administrador'));

router.get('/', clienteController.listar);
router.post('/', clienteController.registrar);
router.patch('/:id/puntos', clienteController.asignarPuntos);

module.exports = router;
