// backend/src/routes/cliente.routes.js
const express = require("express");
const router = express.Router();
const clienteController = require("../controllers/cliente.controller");
const { verificarToken, permitirRoles } = require("../middlewares/auth.middleware");

router.use(verificarToken);

// Vendedor y Admin
router.get("/", permitirRoles("Administrador", "Vendedor"), clienteController.listar);
router.get("/buscar", permitirRoles("Administrador", "Vendedor"), clienteController.buscar);
router.get("/:id", permitirRoles("Administrador", "Vendedor"), clienteController.obtener);
router.post("/", permitirRoles("Administrador", "Vendedor"), clienteController.registrar);

// Solo Admin
router.put("/:id", permitirRoles("Administrador"), clienteController.actualizar);
router.patch("/:id/estado", permitirRoles("Administrador"), clienteController.cambiarEstado);
router.patch("/:id/sumar-punto", permitirRoles("Administrador"), clienteController.sumarPuntoPorCompra);
router.delete("/:id", permitirRoles("Administrador"), clienteController.eliminar);

module.exports = router;