import api from "../../services/api";

// RF-11
export async function registrarPedido(payload) {
  const { data } = await api.post("/pedidos", payload);
  return data;
}

export async function listarPedidos() {
  const { data } = await api.get("/pedidos");
  return data;
}

// RF-10
export async function sugerenciasDePedido() {
  const { data } = await api.get("/pedidos/sugerencias");
  return data;
}
