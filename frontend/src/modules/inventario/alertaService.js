import api from "../../services/api";

export async function misAlertas() {
  const { data } = await api.get("/alertas/mis-alertas");
  return data;
}

// RF-10
export async function sugerenciasPedido() {
  const { data } = await api.get("/alertas/sugerencias-pedido");
  return data;
}