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
