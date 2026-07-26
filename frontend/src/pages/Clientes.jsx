import { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import SidebarCompras from "../components/SidebarCompras";
import HeaderModulo from "../components/HeaderModulo";

function dedupeById(arr = []) {
  const map = new Map();
  arr.forEach(item => {
    if (item && item.id_cliente != null) map.set(String(item.id_cliente), item);
  });
  return Array.from(map.values());
}

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [form, setForm] = useState({ nombre: "", telefono: "" });
  const [compra, setCompra] = useState({ id_cliente: "", monto: "" });
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [loadingRegistro, setLoadingRegistro] = useState(false);
  const [loadingCompra, setLoadingCompra] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchedRef = useRef(false);
  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    cargarClientes();
  }, []);

  async function cargarClientes() {
    setLoadingClientes(true);
    try {
      const res = await axios.get("/api/clientes");
      if (Array.isArray(res.data)) {
        setClientes(dedupeById(res.data));
      } else {
        console.error("Respuesta inesperada:", res.data);
        setClientes([]);
      }
    } catch (error) {
      console.error("Error cargando clientes:", error);
      setClientes([]);
    } finally {
      setLoadingClientes(false);
    }
  }

  async function registrarCliente() {
    if (!form.nombre.trim() || !form.telefono.trim()) {
      alert("Completa nombre y teléfono antes de registrar");
      return;
    }
    const existe = clientes.find(c => String(c.telefono).trim() === String(form.telefono).trim());
    if (existe) {
      alert(`Ya existe un cliente con teléfono ${form.telefono} (Código: ${existe.id_cliente})`);
      return;
    }
    if (loadingRegistro) return;
    setLoadingRegistro(true);
    try {
      await axios.post("/api/clientes", form);
      await cargarClientes();
      setForm({ nombre: "", telefono: "" });
    } catch (error) {
      console.error("Error registrando cliente:", error);
      alert("Error registrando cliente. Revisa la consola.");
    } finally {
      setLoadingRegistro(false);
    }
  }

  async function registrarCompra() {
    if (!compra.monto || isNaN(Number(compra.monto))) {
      alert("Ingresa un monto válido");
      return;
    }
    if (loadingCompra) return;
    setLoadingCompra(true);
    try {
      // Llamada unificada al endpoint de compras
      const payload = { total: Number(compra.monto) };
      if (compra.id_cliente) payload.id_cliente = Number(compra.id_cliente);
      await axios.post("/api/compras", payload);
      await cargarClientes();
      setCompra({ id_cliente: "", monto: "" });
    } catch (error) {
      console.error("Error registrando compra:", error);
      alert("Error registrando compra. Revisa la consola.");
    } finally {
      setLoadingCompra(false);
    }
  }

  // Filtrado memoizado por búsqueda
  const clientesFiltrados = useMemo(() => {
    const q = String(search || "").trim().toLowerCase();
    if (!q) return clientes;
    return clientes.filter(c => {
      return (
        String(c.id_cliente).toLowerCase().includes(q) ||
        (c.nombre || "").toLowerCase().includes(q) ||
        (c.telefono || "").toLowerCase().includes(q)
      );
    });
  }, [clientes, search]);

  // Seleccionar cliente para CRUD lateral
  function seleccionarCliente(cliente) {
    setSelected(cliente ? { ...cliente } : null);
  }

  // Actualizar cliente
  async function actualizarCliente() {
    if (!selected) return;
    if (!selected.nombre?.trim() || !selected.telefono?.trim()) {
      alert("Nombre y teléfono son obligatorios");
      return;
    }
    if (updating) return;
    setUpdating(true);
    try {
      await axios.put(`/api/clientes/${selected.id_cliente}`, {
        nombre: selected.nombre.trim(),
        telefono: selected.telefono.trim(),
        puntos: Number(selected.puntos || 0),
        estado: !!selected.estado,
      });
      await cargarClientes();
      // refrescar selección con datos actualizados
      const refreshed = clientes.find(c => c.id_cliente === selected.id_cliente);
      seleccionarCliente(refreshed || null);
      alert("Cliente actualizado");
    } catch (err) {
      console.error("Error actualizando cliente:", err);
      alert(err.response?.data?.error || "Error actualizando cliente");
    } finally {
      setUpdating(false);
    }
  }

  // Cambiar estado activo/inactivo
  async function toggleEstadoCliente() {
    if (!selected) return;
    if (updating) return;
    setUpdating(true);
    try {
      await axios.put(`/api/clientes/${selected.id_cliente}`, { estado: !selected.estado });
      await cargarClientes();
      // actualizar localmente
      setSelected(prev => prev ? { ...prev, estado: !prev.estado } : prev);
    } catch (err) {
      console.error("Error cambiando estado:", err);
      alert("Error cambiando estado");
    } finally {
      setUpdating(false);
    }
  }

  // Eliminar cliente
  async function eliminarCliente() {
    if (!selected) return;
    if (!confirm("Eliminar cliente seleccionado. Esta acción es irreversible")) return;
    if (deleting) return;
    setDeleting(true);
    try {
      await axios.delete(`/api/clientes/${selected.id_cliente}`);
      await cargarClientes();
      setSelected(null);
      alert("Cliente eliminado");
    } catch (err) {
      console.error("Error eliminando cliente:", err);
      alert("Error eliminando cliente");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-cream">
      <SidebarCompras />
      <div className="flex-1">
        <HeaderModulo titulo="Gestión de Clientes" />

        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Gestión de Clientes</h2>

          {/* Layout principal: formulario + lista + panel CRUD */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Columna 1 Formulario registro y búsqueda */}
            <div className="lg:col-span-2 space-y-4">
              <div className="space-y-2 mb-2">
                <input
                  placeholder="Nombre"
                  value={form.nombre}
                  onChange={e => setForm({ ...form, nombre: e.target.value })}
                  className="border px-3 py-2 rounded w-full"
                />
                <input
                  placeholder="Teléfono"
                  value={form.telefono}
                  onChange={e => setForm({ ...form, telefono: e.target.value })}
                  className="border px-3 py-2 rounded w-full"
                />
                <button
                  onClick={registrarCliente}
                  className="bg-green-600 text-white px-4 py-2 rounded"
                  disabled={loadingRegistro}
                >
                  {loadingRegistro ? "Registrando..." : "+ Registrar cliente"}
                </button>
              </div>

              {/* Barra de búsqueda */}
              <div className="mb-4">
                <input
                  placeholder="Buscar por código nombre o teléfono"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="border px-3 py-2 rounded w-full"
                />
              </div>

              {/* Formulario de compra */}
              <div className="space-y-2 mb-6">
                <select
                  value={compra.id_cliente}
                  onChange={e => setCompra({ ...compra, id_cliente: e.target.value })}
                  className="border px-3 py-2 rounded w-full"
                >
                  <option value="">Venta libre (sin cliente)</option>
                  {clientes.map(c => (
                    <option key={c.id_cliente} value={c.id_cliente}>
                      {c.nombre} — Código: {c.id_cliente}
                    </option>
                  ))}
                </select>

                <input
                  placeholder="Monto de compra"
                  value={compra.monto}
                  onChange={e => setCompra({ ...compra, monto: e.target.value })}
                  className="border px-3 py-2 rounded w-full"
                />

                <button
                  onClick={registrarCompra}
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                  disabled={loadingCompra}
                >
                  {loadingCompra ? "Registrando compra..." : "Registrar compra"}
                </button>
              </div>

              {/* Tabla de clientes filtrada */}
              <div className="overflow-x-auto">
                <table className="w-full border">
                  <thead>
                    <tr>
                      <th className="text-left px-3 py-2">Código</th>
                      <th className="text-left px-3 py-2">Nombre</th>
                      <th className="text-left px-3 py-2">Teléfono</th>
                      <th className="text-left px-3 py-2">Puntos</th>
                      <th className="text-left px-3 py-2">Descuento</th>
                      <th className="text-left px-3 py-2">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingClientes ? (
                      <tr>
                        <td colSpan="6" className="px-3 py-4">Cargando clientes...</td>
                      </tr>
                    ) : Array.isArray(clientesFiltrados) && clientesFiltrados.length > 0 ? (
                      clientesFiltrados.map(c => (
                        <tr key={c.id_cliente} className="hover:bg-gray-50">
                          <td className="px-3 py-2">{c.id_cliente}</td>
                          <td className="px-3 py-2">{c.nombre}</td>
                          <td className="px-3 py-2">{c.telefono}</td>
                          <td className="px-3 py-2">{c.puntos ?? 0}</td>
                          <td className="px-3 py-2">{c.descuento ?? 0}%</td>
                          <td className="px-3 py-2">
                            <button
                              onClick={() => seleccionarCliente(c)}
                              className="text-sm bg-gray-200 px-2 py-1 rounded"
                            >
                              Editar
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-3 py-4">No hay clientes disponibles</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Columna 2 Panel CRUD derecho */}
            <div className="bg-white border rounded p-4">
              <h3 className="font-semibold mb-3">Detalle y edición</h3>

              {selected ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium">Código</label>
                    <div className="mt-1 text-sm">{selected.id_cliente}</div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium">Nombre</label>
                    <input
                      value={selected.nombre}
                      onChange={e => setSelected({ ...selected, nombre: e.target.value })}
                      className="border px-3 py-2 rounded w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium">Teléfono</label>
                    <input
                      value={selected.telefono || ""}
                      onChange={e => setSelected({ ...selected, telefono: e.target.value })}
                      className="border px-3 py-2 rounded w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium">Puntos</label>
                    <input
                      type="number"
                      value={selected.puntos ?? 0}
                      onChange={e => setSelected({ ...selected, puntos: Number(e.target.value) })}
                      className="border px-3 py-2 rounded w-full"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-sm font-medium">Estado</label>
                      <div className="mt-1 text-sm">{selected.estado ? "Activo" : "Inactivo"}</div>
                    </div>

                    <div className="space-x-2">
                      <button
                        onClick={toggleEstadoCliente}
                        className="bg-yellow-500 text-white px-3 py-1 rounded"
                        disabled={updating}
                      >
                        {updating ? "Procesando..." : selected.estado ? "Desactivar" : "Activar"}
                      </button>

                      <button
                        onClick={actualizarCliente}
                        className="bg-green-600 text-white px-3 py-1 rounded"
                        disabled={updating}
                      >
                        {updating ? "Guardando..." : "Guardar cambios"}
                      </button>

                      <button
                        onClick={eliminarCliente}
                        className="bg-red-600 text-white px-3 py-1 rounded"
                        disabled={deleting}
                      >
                        {deleting ? "Eliminando..." : "Eliminar"}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-600">Selecciona un cliente de la lista para ver o editar sus datos</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
