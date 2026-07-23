const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verificarToken, permitirRoles } = require('../middlewares/auth.middleware');

// RF-18: Iniciar sesion
router.post('/login', authController.login);

// RF-17: Crear usuario (solo Administrador)
router.post('/registrar', verificarToken, permitirRoles('Administrador'), authController.registrar);

module.exports = router;
