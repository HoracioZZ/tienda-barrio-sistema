import api from "../../services/api";

export async function listarCategorias(incluirInactivas = false) {
  const { data } = await api.get("/categorias", {
    params: { incluirInactivas },
  });
  return data;
}

export async function registrarCategoria(payload) {
  const { data } = await api.post("/categorias", payload);
  return data;
}

export async function actualizarCategoria(id_categoria, payload) {
  const { data } = await api.put(`/categorias/${id_categoria}`, payload);
  return data;
}

export async function eliminarCategoria(id_categoria) {
  const { data } = await api.delete(`/categorias/${id_categoria}`);
  return data;
}

export async function reactivarCategoria(id_categoria) {
  const { data } = await api.patch(`/categorias/${id_categoria}/reactivar`);
  return data;
}
