const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/cliente.controller');
const { verificarToken, permitirRoles } = require('../middlewares/auth.middleware');

// Cualquier usuario logueado (Administrador o Vendedor) puede acceder a este modulo
router.use(verificarToken);

// Ver clientes: Administrador y Vendedor (para reconocer clientes frecuentes al atender)
router.get('/', clienteController.listar);

// Registrar cliente y asignar puntos: solo Administrador
router.post('/', permitirRoles('Administrador'), clienteController.registrar);
router.patch('/:id/puntos', permitirRoles('Administrador'), clienteController.asignarPuntos);

module.exports = router;