import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import VentasPage from "./pages/VentasPage";
import RutaProtegida from "./components/RutaProtegida";
import Pedidos from "./pages/Pedidos";
import Productos from "./pages/Productos";
import Clientes from "./pages/Clientes";

function App() {
  return (
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
        
        {/* ✅ AHORA Vendedor también puede acceder */}
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

        {/* Ejemplo para cuando los compañeros agreguen sus modulos: */}
        {/* Solo Administrador puede entrar a reportes */}
        {/* <Route path="/reportes" element={
          <RutaProtegida rolesPermitidos={['Administrador']}>
            <ReportesPage />
          </RutaProtegida>
        } /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;