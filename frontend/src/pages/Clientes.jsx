import { useState, useEffect } from "react";
import axios from "axios";

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [form, setForm] = useState({ nombre: "", telefono: "" });
  const [compra, setCompra] = useState({ id_cliente: "", monto: "" });

  useEffect(() => {
    cargarClientes();
  }, []);

  async function cargarClientes() {
    const res = await axios.get("/api/clientes");
    setClientes(res.data);
  }

  async function registrarCliente() {
    await axios.post("/api/clientes", form);
    await cargarClientes();
    setForm({ nombre: "", telefono: "" });
  }

  async function registrarCompra() {
    await axios.patch(`/api/clientes/${compra.id_cliente}/compras`, { monto: compra.monto });
    await cargarClientes();
    setCompra({ id_cliente: "", monto: "" });
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Gestión de Clientes</h2>

      {/* Formulario de registro */}
      <div className="space-y-2 mb-6">
        <input placeholder="Nombre" value={form.nombre}
          onChange={e => setForm({ ...form, nombre: e.target.value })} />
        <input placeholder="Teléfono" value={form.telefono}
          onChange={e => setForm({ ...form, telefono: e.target.value })} />
        <button onClick={registrarCliente} className="bg-green-600 text-white px-4 py-2 rounded">
          + Registrar cliente
        </button>
      </div>

      {/* Formulario de compra */}
      <div className="space-y-2 mb-6">
        <select value={compra.id_cliente}
          onChange={e => setCompra({ ...compra, id_cliente: e.target.value })}>
          <option value="">Selecciona cliente</option>
          {clientes.map(c => (
            <option key={c.id_cliente} value={c.id_cliente}>{c.nombre}</option>
          ))}
        </select>
        <input placeholder="Monto de compra" value={compra.monto}
          onChange={e => setCompra({ ...compra, monto: e.target.value })} />
        <button onClick={registrarCompra} className="bg-blue-600 text-white px-4 py-2 rounded">
          Registrar compra
        </button>
      </div>

      {/* Tabla de clientes */}
      <table className="w-full border">
        <thead>
          <tr>
            <th>Nombre</th><th>Teléfono</th><th>Puntos</th><th>Descuento</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map(c => (
            <tr key={c.id_cliente}>
              <td>{c.nombre}</td>
              <td>{c.telefono}</td>
              <td>{c.puntos}</td>
              <td>{c.descuento}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
