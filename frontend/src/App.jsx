import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import VentasPage from "./pages/VentasPage";
import RutaProtegida from "./components/RutaProtegida";

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

        {/* Ejemplo para cuando los compañeros agreguen sus modulos: */}
        {/* Solo Administrador puede entrar a reportes */}
        {/* <Route path="/reportes" element={
          <RutaProtegida rolesPermitidos={['Administrador']}>
            <ReportesPage />
          </RutaProtegida>
        } /> */}

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
