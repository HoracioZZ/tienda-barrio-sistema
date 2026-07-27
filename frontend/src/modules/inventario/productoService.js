import api from "../../services/api";

export async function listarProductos() {
  const { data } = await api.get("/productos");
  return data;
}

export async function listarProductosPorCategoria(id_categoria) {
  const { data } = await api.get(`/productos/categoria/${id_categoria}`);
  return data;
}

export async function buscarProducto(nombre) {
  const { data } = await api.get("/productos/buscar", { params: { nombre } });
  return data;
}

export async function registrarProducto(payload) {
  const { data } = await api.post("/productos", payload);
  return data;
}

export async function actualizarProducto(id_producto, payload) {
  const { data } = await api.put(`/productos/${id_producto}`, payload);
  return data;
}

export async function eliminarProducto(id_producto) {
  const { data } = await api.delete(`/productos/${id_producto}`);
  return data;
}

export async function alertasStockBajo() {
  const { data } = await api.get("/productos/alertas/stock-bajo");
  return data;
}