import api from "../../services/api";

// RF-1: registrar venta
export async function registrarVenta(payload) {
  const { data } = await api.post("/ventas", payload);
  return data;
}

export async function listarVentas() {
  const { data } = await api.get("/ventas");
  return data;
}

// RF-4: buscar productos por nombre
export async function buscarProductos(nombre) {
  const { data } = await api.get("/ventas/productos", { params: { nombre } });
  return data;
}