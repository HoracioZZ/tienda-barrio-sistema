import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import VentasPage from "./pages/VentasPage";
import RutaProtegida from "./components/RutaProtegida";
import Pedidos from "./pages/Pedidos";

import Clientes from "./pages/Clientes";
import Reportes from "./pages/Reportes";

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
        <Route path="/clientes" element={
          <RutaProtegida rolesPermitidos={['Administrador']}>           
              <Clientes />
          </RutaProtegida>
        } />


        <Route
          path="/reportes"
          element={
            <RutaProtegida rolesPermitidos={["Administrador"]}>
              <Reportes />
            </RutaProtegida>
        }/>

        {/* Administrador y Vendedor pueden entrar a ventas */}
        <Route
          path="/ventas"
          element={
            <RutaProtegida rolesPermitidos={["Administrador", "Vendedor"]}>
              <VentasPage />
            </RutaProtegida>
          }
        />
        {/* <Route path="/ventas" element={
          <RutaProtegida rolesPermitidos={['Administrador', 'Vendedor']}>
            <VentasPage />
          </RutaProtegida>
        } /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
