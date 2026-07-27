const categoriaService = require('../services/categoria.service');

async function registrar(req, res) {
  try {
    const categoria = await categoriaService.crearCategoria(req.body);
    res.status(201).json(categoria);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function listar(req, res) {
  res.json(await categoriaService.listarCategorias());
}

async function actualizar(req, res) {
  try {
    const categoria = await categoriaService.actualizarCategoria(req.params.id, req.body);
    res.json(categoria);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function eliminar(req, res) {
  try {
    await categoriaService.eliminarCategoria(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

module.exports = { registrar, listar, actualizar, eliminar };