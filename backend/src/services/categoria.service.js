const categoriaRepository = require('../repositories/categoria.repository');

// RF-3: categorias para clasificar productos
async function crearCategoria(data) {
  if (!data.nombre || !data.nombre.trim()) {
    throw new Error('El nombre de la categoria es obligatorio');
  }
  return categoriaRepository.crear({ nombre: data.nombre.trim() });
}

async function listarCategorias() {
  return categoriaRepository.listar();
}

async function actualizarCategoria(id, data) {
  const existente = await categoriaRepository.obtenerPorId(id);
  if (!existente) throw new Error('Categoria no encontrada');
  return categoriaRepository.actualizar(id, { nombre: data.nombre?.trim() });
}

async function eliminarCategoria(id) {
  const existente = await categoriaRepository.obtenerPorId(id);
  if (!existente) throw new Error('Categoria no encontrada');
  return categoriaRepository.eliminar(id);
}

module.exports = { crearCategoria, listarCategorias, actualizarCategoria, eliminarCategoria };