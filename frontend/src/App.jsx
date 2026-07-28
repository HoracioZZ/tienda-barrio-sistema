import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import VentasPage from "./pages/VentasPage";
import RutaProtegida from "./components/RutaProtegida";
import Pedidos from "./pages/Pedidos";
import Productos from "./pages/Productos";
import Clientes from "./pages/Clientes";
import Reportes from "./pages/Reportes";
import { SidebarProvider } from "./context/SidebarContext";

function App() {
  return (
    <SidebarProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />

          <Route
            path="/dashboard"
            element={
              <RutaProtegida>
                <Dashboard />
              </RutaProtegida>
            }
          />

          <Route
            path="/pedidos"
            element={
              <RutaProtegida rolesPermitidos={["Administrador"]}>
                <Pedidos />
              </RutaProtegida>
            }
          />

          <Route
            path="/productos"
            element={
              <RutaProtegida rolesPermitidos={["Administrador"]}>
                <Productos />
              </RutaProtegida>
            }
          />

          <Route
            path="/clientes"
            element={
              <RutaProtegida rolesPermitidos={["Administrador", "Vendedor"]}>
                <Clientes />
              </RutaProtegida>
            }
          />

          <Route
            path="/ventas"
            element={
              <RutaProtegida rolesPermitidos={["Administrador", "Vendedor"]}>
                <VentasPage />
              </RutaProtegida>
            }
          />

          <Route
            path="/reportes"
            element={
              <RutaProtegida rolesPermitidos={["Administrador"]}>
                <Reportes />
              </RutaProtegida>
            }
          />
        </Routes>
      </BrowserRouter>
    </SidebarProvider>
  );
}

export default App;
