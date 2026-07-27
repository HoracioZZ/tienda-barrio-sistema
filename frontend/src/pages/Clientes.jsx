import { useState, useEffect, useRef, useMemo } from "react";
import api from "../services/api";
import SidebarClientes from "../components/SidebarClientes";
import HeaderModulo from "../components/HeaderModulo";
import { getUsuarioActual } from "../modules/auth/authService";
import Footer from "../components/Footer";
// Importar iconos de Lucide
import { Info, MousePointer, CheckCircle, XCircle } from "lucide-react";

function dedupeById(arr = []) {
  const map = new Map();
  arr.forEach((item) => {
    if (item && item.id_cliente != null) map.set(String(item.id_cliente), item);
  });
  return Array.from(map.values());
}

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [form, setForm] = useState({ nombre: "", telefono: "" });
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [loadingRegistro, setLoadingRegistro] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: "", texto: "" });

  const fetchedRef = useRef(false);
  const usuario = getUsuarioActual();
  const isAdmin = usuario?.rol === "Administrador";

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    cargarClientes();
  }, []);

  useEffect(() => {
    if (mensaje.texto) {
      const timer = setTimeout(() => setMensaje({ tipo: "", texto: "" }), 5000);
      return () => clearTimeout(timer);
    }
  }, [mensaje]);

  async function cargarClientes() {
    setLoadingClientes(true);
    try {
      const res = await api.get("/clientes");
      if (Array.isArray(res.data)) {
        const deduped = dedupeById(res.data);
        const sorted = deduped.sort((a, b) =>
          (a.nombre || "").localeCompare(b.nombre || ""),
        );
        setClientes(sorted);
      } else {
        console.error("Respuesta inesperada:", res.data);
        setClientes([]);
      }
    } catch (error) {
      console.error("Error cargando clientes:", error);
      mostrarMensaje("error", "Error al cargar los clientes");
      setClientes([]);
    } finally {
      setLoadingClientes(false);
    }
  }

  async function registrarCliente() {
    if (!form.nombre.trim() || !form.telefono.trim()) {
      mostrarMensaje("error", "Completa nombre y teléfono antes de registrar");
      return;
    }

    const existe = clientes.find(
      (c) => String(c.telefono).trim() === String(form.telefono).trim(),
    );
    if (existe) {
      mostrarMensaje(
        "error",
        `Ya existe un cliente con teléfono ${form.telefono}`,
      );
      return;
    }

    if (loadingRegistro) return;
    setLoadingRegistro(true);

    try {
      await api.post("/clientes", form);
      await cargarClientes();
      setForm({ nombre: "", telefono: "" });
      mostrarMensaje("success", " Cliente registrado exitosamente");
    } catch (error) {
      console.error("Error registrando cliente:", error);
      mostrarMensaje("error", "Error al registrar el cliente");
    } finally {
      setLoadingRegistro(false);
    }
  }

  const clientesFiltrados = useMemo(() => {
    const q = String(search || "")
      .trim()
      .toLowerCase();
    if (!q) return clientes;
    return clientes.filter((c) => {
      return (
        String(c.id_cliente).toLowerCase().includes(q) ||
        (c.nombre || "").toLowerCase().includes(q) ||
        (c.telefono || "").toLowerCase().includes(q)
      );
    });
  }, [clientes, search]);

  function seleccionarCliente(cliente) {
    setSelected(cliente ? { ...cliente } : null);
  }

  async function actualizarCliente() {
    if (!selected) return;
    if (!selected.nombre?.trim() || !selected.telefono?.trim()) {
      mostrarMensaje("error", "Nombre y teléfono son obligatorios");
      return;
    }

    if (updating) return;
    setUpdating(true);

    try {
      await api.put(`/clientes/${selected.id_cliente}`, {
        nombre: selected.nombre.trim(),
        telefono: selected.telefono.trim(),
        puntos: Number(selected.puntos || 0),
        estado: selected.estado !== false,
      });

      await cargarClientes();
      const refreshed = clientes.find(
        (c) => c.id_cliente === selected.id_cliente,
      );
      seleccionarCliente(refreshed || null);
      mostrarMensaje("success", " Cliente actualizado exitosamente");
    } catch (err) {
      console.error("Error actualizando cliente:", err);
      mostrarMensaje(
        "error",
        err.response?.data?.error || "Error al actualizar el cliente",
      );
    } finally {
      setUpdating(false);
    }
  }

  async function toggleEstadoCliente() {
    if (!selected) return;
    if (updating) return;
    setUpdating(true);

    try {
      const nuevoEstado = selected.estado !== false;
      await api.put(`/clientes/${selected.id_cliente}`, {
        estado: !nuevoEstado,
      });

      await cargarClientes();
      setSelected((prev) => (prev ? { ...prev, estado: !prev.estado } : prev));
      mostrarMensaje(
        "success",
        ` Cliente ${selected.estado !== false ? "desactivado" : "activado"} exitosamente`,
      );
    } catch (err) {
      console.error("Error cambiando estado:", err);
      mostrarMensaje("error", "Error al cambiar el estado del cliente");
    } finally {
      setUpdating(false);
    }
  }

  async function eliminarCliente() {
    if (!selected) return;
    if (!confirm(`¿Estás seguro de eliminar a "${selected.nombre}"?`)) return;

    if (deleting) return;
    setDeleting(true);

    try {
      await api.delete(`/clientes/${selected.id_cliente}`);
      await cargarClientes();
      setSelected(null);
      mostrarMensaje("success", " Cliente eliminado exitosamente");
    } catch (err) {
      console.error("Error eliminando cliente:", err);
      mostrarMensaje("error", "Error al eliminar el cliente");
    } finally {
      setDeleting(false);
    }
  }

  function mostrarMensaje(tipo, texto) {
    setMensaje({ tipo, texto });
  }

  function resaltarTexto(texto, busqueda) {
    if (!busqueda.trim() || !texto) return texto;
    const regex = new RegExp(
      `(${busqueda.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi",
    );
    const partes = texto.split(regex);
    return partes.map((parte, i) =>
      regex.test(parte) ? (
        <span key={i} className="bg-yellow-200 rounded px-0.5">
          {parte}
        </span>
      ) : (
        parte
      ),
    );
  }

  return (
    <div className="flex min-h-screen bg-cream">
      <SidebarClientes />
      <div className="flex-1">
        <HeaderModulo titulo=" Gestión de Clientes" />

        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="text-sm text-stone">
              Total: {clientes.length} clientes
            </div>
          </div>

          {mensaje.texto && (
            <div
              className={`mb-4 p-4 rounded-lg flex items-center gap-2 ${
                mensaje.tipo === "success"
                  ? "bg-success/10 text-success border border-success/20"
                  : "bg-danger/10 text-danger border border-danger/20"
              }`}
            >
              <span>{mensaje.tipo === "success" ? "" : ""}</span>
              {mensaje.texto}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Columna Izquierda */}
            <div className="lg:col-span-2 space-y-4">
              {/* Formulario de registro - Visible para todos */}
              <div className="bg-white rounded-xl shadow-sm p-5 border border-stone/20">
                <h3 className="font-semibold text-ink mb-3 flex items-center gap-2">
                  <span className="text-xl"></span> Registrar Nuevo Cliente
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    placeholder="Nombre completo"
                    value={form.nombre}
                    onChange={(e) =>
                      setForm({ ...form, nombre: e.target.value })
                    }
                    className="px-3 py-2 border border-stone/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-sans"
                  />
                  <input
                    placeholder="Teléfono"
                    value={form.telefono}
                    onChange={(e) =>
                      setForm({ ...form, telefono: e.target.value })
                    }
                    className="px-3 py-2 border border-stone/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-sans"
                  />
                </div>
                <button
                  onClick={registrarCliente}
                  disabled={loadingRegistro}
                  className="mt-3 w-full bg-primary hover:bg-primary-dark text-white font-semibold px-4 py-2 rounded-lg disabled:opacity-50 transition-colors duration-200 flex items-center justify-center gap-2 font-sans"
                >
                  {loadingRegistro ? (
                    <>
                      <span className="animate-spin"></span> Registrando...
                    </>
                  ) : (
                    "+ Registrar cliente"
                  )}
                </button>
              </div>

              {/* Buscador */}
              <div className="relative">
                <input
                  placeholder=" Buscar por código, nombre o teléfono..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-4 py-3 border border-stone/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-sans bg-white"
                />
                {search && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-stone">
                    {clientesFiltrados.length} resultados
                  </div>
                )}
              </div>

              {/* Tabla de clientes */}
              <div className="bg-white rounded-xl shadow-sm border border-stone/20 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-primary text-white">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider font-sans">
                          Código
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider font-sans">
                          Nombre
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider font-sans">
                          Teléfono
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider font-sans">
                          Puntos
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider font-sans">
                          Descuento
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider font-sans">
                          Estado
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider font-sans">
                          Acción
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone/10">
                      {loadingClientes ? (
                        <tr>
                          <td
                            colSpan="7"
                            className="text-center py-8 text-stone"
                          >
                            <div className="flex items-center justify-center gap-2">
                              <span className="animate-spin"></span> Cargando
                              clientes...
                            </div>
                          </td>
                        </tr>
                      ) : clientesFiltrados.length > 0 ? (
                        clientesFiltrados.map((c, index) => (
                          <tr
                            key={c.id_cliente}
                            className={`hover:bg-primary/5 transition-colors duration-150 ${
                              index % 2 === 0 ? "bg-white" : "bg-cream/50"
                            }`}
                          >
                            <td className="px-4 py-3 text-sm font-mono text-stone">
                              {c.id_cliente}
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-ink">
                              {resaltarTexto(c.nombre, search)}
                            </td>
                            <td className="px-4 py-3 text-sm text-stone">
                              {resaltarTexto(c.telefono, search)}
                            </td>
                            <td className="px-4 py-3 text-sm font-semibold text-primary">
                              {c.puntos ?? 0}
                            </td>
                            <td className="px-4 py-3 text-sm text-stone">
                              {c.descuento ?? 0}%
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  c.estado !== false
                                    ? "bg-success/20 text-success"
                                    : "bg-danger/20 text-danger"
                                }`}
                              >
                                {c.estado !== false ? "Activo" : "Inactivo"}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => seleccionarCliente(c)}
                                className="text-primary hover:text-primary-dark text-sm font-medium transition-colors hover:underline"
                              >
                                {isAdmin ? "Editar" : "Ver"}
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="7"
                            className="text-center py-12 text-stone"
                          >
                            <div className="text-4xl mb-2"></div>
                            {search
                              ? "No se encontraron clientes"
                              : "No hay clientes registrados"}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Columna Derecha - Panel de edición/vista */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-stone/20 p-5 sticky top-6">
                <h3 className="font-semibold text-ink mb-4 flex items-center gap-2">
                  <span className="text-xl"></span>{" "}
                  {isAdmin ? "Editar Cliente" : "Detalles del Cliente"}
                </h3>

                {selected ? (
                  <div className="space-y-3">
                    {/* Código - Solo lectura */}
                    <div>
                      <label className="block text-xs font-medium text-stone uppercase tracking-wider mb-1 font-sans">
                        Código
                      </label>
                      <div className="text-sm font-mono text-ink bg-cream/50 px-3 py-2 rounded-lg border border-stone/20">
                        {selected.id_cliente}
                      </div>
                    </div>

                    {/* Nombre */}
                    <div>
                      <label className="block text-xs font-medium text-stone uppercase tracking-wider mb-1 font-sans">
                        Nombre
                      </label>
                      {isAdmin ? (
                        <input
                          value={selected.nombre || ""}
                          onChange={(e) =>
                            setSelected({ ...selected, nombre: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-stone/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-sans"
                        />
                      ) : (
                        <div className="text-sm font-medium text-ink bg-cream/50 px-3 py-2 rounded-lg border border-stone/20">
                          {selected.nombre || ""}
                        </div>
                      )}
                    </div>

                    {/* Teléfono */}
                    <div>
                      <label className="block text-xs font-medium text-stone uppercase tracking-wider mb-1 font-sans">
                        Teléfono
                      </label>
                      {isAdmin ? (
                        <input
                          value={selected.telefono || ""}
                          onChange={(e) =>
                            setSelected({
                              ...selected,
                              telefono: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-stone/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-sans"
                        />
                      ) : (
                        <div className="text-sm text-ink bg-cream/50 px-3 py-2 rounded-lg border border-stone/20">
                          {selected.telefono || ""}
                        </div>
                      )}
                    </div>

                    {/* Puntos - Solo Admin puede editar */}
                    <div>
                      <label className="block text-xs font-medium text-stone uppercase tracking-wider mb-1 font-sans">
                        Puntos
                      </label>
                      {isAdmin ? (
                        <input
                          type="number"
                          value={selected.puntos ?? 0}
                          onChange={(e) =>
                            setSelected({
                              ...selected,
                              puntos: Number(e.target.value),
                            })
                          }
                          className="w-full px-3 py-2 border border-stone/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-sans"
                          min="0"
                        />
                      ) : (
                        <div className="text-sm font-semibold text-primary bg-cream/50 px-3 py-2 rounded-lg border border-stone/20">
                          {selected.puntos ?? 0}
                        </div>
                      )}
                    </div>

                    {/* Descuento - SOLO LECTURA */}
                    <div>
                      <label className="block text-xs font-medium text-stone uppercase tracking-wider mb-1 font-sans">
                        Descuento (%)
                      </label>
                      <div className="text-sm font-semibold text-accent bg-cream/50 px-3 py-2 rounded-lg border border-stone/20">
                        {selected.descuento ?? 0}%
                        <span className="text-xs text-stone font-normal ml-2">
                          (Calculado automáticamente según puntos)
                        </span>
                      </div>
                    </div>

                    {/* Estado */}
                    <div className="pt-3 border-t border-stone/20">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-medium text-stone uppercase tracking-wider font-sans">
                          Estado
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                            selected.estado !== false
                              ? "bg-success/20 text-success"
                              : "bg-danger/20 text-danger"
                          }`}
                        >
                          {selected.estado !== false ? (
                            <>
                              <CheckCircle className="w-3 h-3" />
                              Activo
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3" />
                              Inactivo
                            </>
                          )}
                        </span>
                      </div>

                      {/* Solo Admin ve los botones de acción */}
                      {isAdmin && (
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            onClick={toggleEstadoCliente}
                            disabled={updating}
                            className={`px-3 py-2 text-white text-sm font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 font-sans ${
                              selected.estado !== false
                                ? "bg-accent hover:bg-accent/80"
                                : "bg-success hover:bg-success/80"
                            }`}
                          >
                            {updating
                              ? ""
                              : selected.estado !== false
                                ? "Desactivar"
                                : "Activar"}
                          </button>

                          <button
                            onClick={actualizarCliente}
                            disabled={updating}
                            className="px-3 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 font-sans"
                          >
                            {updating ? "" : " Guardar"}
                          </button>

                          <button
                            onClick={eliminarCliente}
                            disabled={deleting}
                            className="px-3 py-2 bg-danger hover:bg-danger/80 text-white text-sm font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 font-sans"
                          >
                            {deleting ? "" : " Eliminar"}
                          </button>
                        </div>
                      )}

                      {/* Si es Vendedor, mostrar mensaje */}
                      {!isAdmin && (
                        <div className="text-center text-sm text-stone bg-cream/50 p-3 rounded-lg flex items-center justify-center gap-2">
                          <Info className="w-4 h-4" />
                          Solo vista - No puedes editar este cliente
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-stone">
                    <MousePointer className="w-12 h-12 mx-auto mb-4 text-stone/50" />
                    <p className="font-medium text-ink">
                      Selecciona un cliente
                    </p>
                    <p className="text-sm mt-1">
                      Haz clic en "{isAdmin ? "Editar" : "Ver"}" en la tabla
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}
