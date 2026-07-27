// frontend/src/modules/ventas/ventaService.js
import api from "../../services/api";

export async function registrarVenta(payload) {
  const { data } = await api.post("/ventas", payload);
  return data;
}

export async function listarVentas(filtros = {}) {
  const { data } = await api.get("/ventas", { params: filtros });
  return data;
}

// ✅ CORREGIDO
export async function buscarProductos(nombre) {
  const { data } = await api.get("/ventas/productos", { params: { q: nombre } });
  return data;
}