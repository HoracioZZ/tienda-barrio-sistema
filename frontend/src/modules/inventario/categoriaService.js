import api from "../../services/api";

export async function listarCategorias() {
  const { data } = await api.get("/categorias");
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