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

export async function verificarAlertas() {
  const { data } = await api.post("/alertas/verificar");
  return data;
}