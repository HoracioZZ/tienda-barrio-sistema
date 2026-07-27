const express = require('express');
const router = express.Router();
const categoriaController = require('../controllers/categoria.controller');
const { verificarToken, permitirRoles } = require('../middlewares/auth.middleware');

router.use(verificarToken);

router.get('/', categoriaController.listar); //  usuario logueado
router.post('/', permitirRoles('Administrador'), categoriaController.registrar);
router.put('/:id', permitirRoles('Administrador'), categoriaController.actualizar);
router.delete('/:id', permitirRoles('Administrador'), categoriaController.eliminar);

module.exports = router;