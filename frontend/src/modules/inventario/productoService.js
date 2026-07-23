import api from "../../services/api";

export async function listarProductos() {
  const { data } = await api.get("/productos");
  return data;
}

// RF-4: busqueda de producto por nombre
export async function buscarProducto(nombre) {
  const { data } = await api.get("/productos/buscar", { params: { nombre } });
  return data;
}

// RF-2: registrar producto
export async function registrarProducto(payload) {
  const { data } = await api.post("/productos", payload);
  return data;
}

// RF-6: alertas de stock bajo
export async function alertasStockBajo() {
  const { data } = await api.get("/productos/alertas/stock-bajo");
  return data;
}
