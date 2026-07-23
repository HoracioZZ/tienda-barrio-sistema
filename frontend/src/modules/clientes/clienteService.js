import api from "../../services/api";

export async function listarClientes() {
  const { data } = await api.get("/clientes");
  return data;
}

// RF-12
export async function registrarCliente(payload) {
  const { data } = await api.post("/clientes", payload);
  return data;
}

// RF-13
export async function asignarPuntos(idCliente, puntos) {
  const { data } = await api.patch(`/clientes/${idCliente}/puntos`, { puntos });
  return data;
}
