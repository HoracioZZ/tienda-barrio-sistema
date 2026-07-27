const categoriaRepository = require("../repositories/categoria.repository");
const productoRepository = require("../repositories/producto.repository");

const CATEGORIA_DEFAULT = "General";

// RF-3: categorias para clasificar productos
async function crearCategoria(data) {
  if (!data.nombre || !data.nombre.trim()) {
    throw new Error("El nombre de la categoria es obligatorio");
  }
  try {
    return await categoriaRepository.crear({ nombre: data.nombre.trim() });
  } catch (error) {
    if (error.code === "P2002") {
      throw new Error("Ya existe una categoria con ese nombre");
    }
    throw error;
  }
}

// Por defecto, listar solo activas
async function listarCategorias(mostrarInactivas = false) {
  return categoriaRepository.listar(mostrarInactivas);
}

async function actualizarCategoria(id, data) {
  const existente = await categoriaRepository.obtenerPorId(id);
  if (!existente) throw new Error("Categoria no encontrada");
  // No permitir cambiar el nombre de la categoría predeterminada (opcional)
  if (existente.nombre === CATEGORIA_DEFAULT) {
    throw new Error("No se puede modificar la categoría predeterminada");
  }
  return categoriaRepository.actualizar(id, { nombre: data.nombre?.trim() });
}

async function eliminarCategoria(id) {
  const existente = await categoriaRepository.obtenerPorId(id);
  if (!existente) throw new Error("Categoria no encontrada");

  // No permitir eliminar la categoría predeterminada
  if (existente.nombre === CATEGORIA_DEFAULT) {
    throw new Error("No se puede eliminar la categoría predeterminada");
  }

  // Buscar productos asociados a esta categoría
  const productos = await productoRepository.obtenerPorCategoria(id);
  let productosReasignados = 0;

  if (productos.length > 0) {
    // Obtener la categoría predeterminada
    const categoriaDefault =
      await categoriaRepository.obtenerPorNombre(CATEGORIA_DEFAULT);
    if (!categoriaDefault) {
      throw new Error(
        'No se encontró la categoría predeterminada. Asegúrate de que existe una categoría llamada "' +
          CATEGORIA_DEFAULT +
          '"',
      );
    }
    // Reasignar todos los productos a la categoría predeterminada
    await productoRepository.reasignarCategoria(
      id,
      categoriaDefault.id_categoria,
    );
    productosReasignados = productos.length;
  }

  // Desactivar la categoría
  await categoriaRepository.eliminar(id);

  return { productosReasignados };
}

async function reactivarCategoria(id) {
  const existente = await categoriaRepository.obtenerPorId(id);
  if (!existente) throw new Error("Categoria no encontrada");
  if (existente.estado) throw new Error("La categoría ya está activa");

  // Verificar que no exista otra categoría activa con el mismo nombre
  const duplicado = await categoriaRepository.obtenerPorNombre(
    existente.nombre,
  );
  if (duplicado && duplicado.id_categoria !== Number(id) && duplicado.estado) {
    throw new Error("Ya existe una categoría activa con ese nombre");
  }

  return categoriaRepository.reactivar(id);
}

module.exports = {
  crearCategoria,
  listarCategorias,
  actualizarCategoria,
  eliminarCategoria,
  reactivarCategoria,
};
