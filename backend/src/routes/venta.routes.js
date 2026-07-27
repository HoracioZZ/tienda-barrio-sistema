// backend/src/routes/venta.routes.js
const express = require("express");
const router = express.Router();
const ventaController = require("../controllers/venta.controller");
const { verificarToken, permitirRoles } = require("../middlewares/auth.middleware");

router.use(verificarToken);

// Vendedor y Admin pueden registrar y listar ventas
router.post("/", permitirRoles("Administrador", "Vendedor"), ventaController.registrar);
router.get("/", permitirRoles("Administrador", "Vendedor"), ventaController.listar);

// Buscar productos por nombre
router.get("/productos", permitirRoles("Administrador", "Vendedor"), ventaController.buscarProductos);

module.exports = router;