import api from "../../services/api";

// RF-14, RF-15
export async function generarReporte(payload) {
  const { data } = await api.post("/reportes", payload);
  return data;
}

// RF-9
export async function productosMasVendidos(desde, hasta) {
  const { data } = await api.get("/reportes/productos-mas-vendidos", { params: { desde, hasta } });
  return data;
}
