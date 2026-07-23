import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        {/* Cada integrante agrega aqui la ruta de su modulo, ej: */}
        {/* <Route path="/ventas" element={<VentasPage />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
