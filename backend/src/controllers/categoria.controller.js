const categoriaService = require("../services/categoria.service");

async function registrar(req, res) {
  try {
    const categoria = await categoriaService.crearCategoria(req.body);
    res.status(201).json(categoria);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function listar(req, res) {
  // Parámetro para incluir inactivas: ?incluirInactivas=true
  const incluirInactivas = req.query.incluirInactivas === "true";
  res.json(await categoriaService.listarCategorias(incluirInactivas));
}

async function actualizar(req, res) {
  try {
    const categoria = await categoriaService.actualizarCategoria(
      req.params.id,
      req.body,
    );
    res.json(categoria);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function eliminar(req, res) {
  try {
    const resultado = await categoriaService.eliminarCategoria(req.params.id);
    // Si se reasignaron productos, devolver mensaje con cantidad
    if (resultado.productosReasignados > 0) {
      res.json({
        mensaje: `Categoría eliminada. ${resultado.productosReasignados} producto(s) reasignado(s) a la categoría predeterminada.`,
      });
    } else {
      res.json({ mensaje: "Categoría eliminada correctamente." });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function reactivar(req, res) {
  try {
    const categoria = await categoriaService.reactivarCategoria(req.params.id);
    res.json(categoria);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

module.exports = { registrar, listar, actualizar, eliminar, reactivar };
