import api from "../../services/api";

// RF-18: iniciar sesion
export async function login(login, contrasena) {
  const { data } = await api.post("/auth/login", { login, contrasena });
  localStorage.setItem("token", data.token);
  localStorage.setItem("usuario", JSON.stringify(data.usuario));
  return data;
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("usuario");
}

export function getUsuarioActual() {
  const raw = localStorage.getItem("usuario");
  return raw ? JSON.parse(raw) : null;
}
