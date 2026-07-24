const express = require("express");
const router = express.Router();
const clienteController = require("../controllers/cliente.controller");
const { verificarToken, permitirRoles } = require("../middlewares/auth.middleware");

router.use(verificarToken);

// Vendedor y Administrador pueden listar clientes
router.get("/", permitirRoles("Administrador", "Vendedor"), clienteController.listar);

// Solo Administrador puede registrar clientes
router.post("/", permitirRoles("Administrador"), clienteController.registrar);

// Solo Administrador puede asignar puntos
router.patch("/:id/puntos", permitirRoles("Administrador"), clienteController.asignarPuntos);

module.exports = router;