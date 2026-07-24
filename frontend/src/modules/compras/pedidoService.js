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

export async function listarProveedores() {
  const { data } = await api.get("/pedidos/proveedores");
  return data;
}

export async function registrarProveedor(payload) {
  const { data } = await api.post("/pedidos/proveedores", payload);
  return data;
}

export async function listarProductos() {
  const { data } = await api.get("/pedidos/productos");
  return data;
}

export async function cambiarEstadoPedido(id_pedido, estado) {
  const { data } = await api.patch(`/pedidos/${id_pedido}/estado`, { estado });
  return data;
}

// RF-10
export async function sugerenciasDePedido() {
  const { data } = await api.get("/pedidos/sugerencias");
  return data;
}