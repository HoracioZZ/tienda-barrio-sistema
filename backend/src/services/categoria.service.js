const categoriaRepository = require('../repositories/categoria.repository');

// RF-3: categorias para clasificar productos
async function crearCategoria(data) {
  if (!data.nombre || !data.nombre.trim()) {
    throw new Error('El nombre de la categoria es obligatorio');
  }
  try {
    return await categoriaRepository.crear({ nombre: data.nombre.trim() });
  } catch (error) {
    if (error.code === 'P2002') {
      throw new Error('Ya existe una categoria con ese nombre');
    }
    throw error;
  }
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