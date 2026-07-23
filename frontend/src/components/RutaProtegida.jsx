import { Navigate } from "react-router-dom";
import { getUsuarioActual } from "../modules/auth/authService";

export default function RutaProtegida({ rolesPermitidos, children }) {
  const usuario = getUsuarioActual();

  // No ha iniciado sesion -> lo mandamos al login
  if (!usuario) {
    return <Navigate to="/" replace />;
  }

  // Esta logueado pero su rol no esta en la lista permitida para esta pantalla
  if (rolesPermitidos && !rolesPermitidos.includes(usuario.rol)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
