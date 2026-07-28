import { useState, useEffect } from "react";
import { getUsuarioActual } from "../modules/auth/authService";
import { Link } from "react-router-dom";
import SidebarCompras from "../components/SidebarCompras";
import HeaderModulo from "../components/HeaderModulo";
import Footer from "../components/Footer";
import api from "../services/api";
// Iconos de Lucide
import {
  ShoppingCart,
  Users,
  Package,
  Truck,
  ShoppingBag,
  BarChart3,
  TrendingUp,
  User,
  Calendar,
  ArrowRight,
} from "lucide-react";

function formatMoney(n) {
  return `Bs ${Number(n || 0).toFixed(2)}`;
}

function esMismoDia(fechaA, fechaB) {
  return (
    fechaA.getFullYear() === fechaB.getFullYear() &&
    fechaA.getMonth() === fechaB.getMonth() &&
    fechaA.getDate() === fechaB.getDate()
  );
}

function esMismoMes(fechaA, fechaB) {
  return (
    fechaA.getFullYear() === fechaB.getFullYear() &&
    fechaA.getMonth() === fechaB.getMonth()
  );
}

export default function Dashboard() {
  const usuario = getUsuarioActual();
  const esAdmin = usuario?.rol === "Administrador";

  const [cargando, setCargando] = useState(true);
  const [ventas, setVentas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [pedidos, setPedidos] = useState([]);

  useEffect(() => {
    cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function cargarDatos() {
    setCargando(true);
    try {
      const [ventasRes, productosRes, clientesRes, pedidosRes] =
        await Promise.allSettled([
          api.get("/ventas"),
          api.get("/productos"),
          api.get("/clientes"),
          api.get("/pedidos"),
        ]);

      if (
        ventasRes.status === "fulfilled" &&
        Array.isArray(ventasRes.value.data)
      ) {
        setVentas(ventasRes.value.data);
      }
      if (
        productosRes.status === "fulfilled" &&
        Array.isArray(productosRes.value.data)
      ) {
        setProductos(productosRes.value.data);
      }
      if (
        clientesRes.status === "fulfilled" &&
        Array.isArray(clientesRes.value.data)
      ) {
        setClientes(clientesRes.value.data);
      }
      if (
        pedidosRes.status === "fulfilled" &&
        Array.isArray(pedidosRes.value.data)
      ) {
        setPedidos(pedidosRes.value.data);
      }
    } catch (error) {
      console.error("Error cargando datos del dashboard:", error);
    } finally {
      setCargando(false);
    }
  }

  const hoy = new Date();

  // ---- Metricas para Administrador ----
  const ventasDelMes = ventas.filter((v) => esMismoMes(new Date(v.fecha), hoy));
  const totalVentasMes = ventasDelMes.reduce(
    (acc, v) => acc + Number(v.total),
    0,
  );

  const pedidosActivos = pedidos.filter(
    (p) => p.estado && p.estado.toLowerCase() === "pendiente",
  );

  const stockTotal = productos.reduce(
    (acc, p) => acc + Number(p.stock || 0),
    0,
  );
  const productosStockBajo = productos.filter(
    (p) => Number(p.stock) <= Number(p.stock_minimo),
  );

  const clientesActivos = clientes.filter((c) => c.estado !== false);

  // Ventas por dia, ultimos 7 dias
  const ultimosSieteDias = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(hoy);
    d.setDate(d.getDate() - (6 - i));
    return d;
  });
  const ventasPorDia = ultimosSieteDias.map((dia) => {
    const total = ventas
      .filter((v) => esMismoDia(new Date(v.fecha), dia))
      .reduce((acc, v) => acc + Number(v.total), 0);
    return { dia, total };
  });
  const maxVentaDia = Math.max(1, ...ventasPorDia.map((d) => d.total));

  // Productos mas vendidos
  const cantidadPorProducto = {};
  ventas.forEach((v) => {
    (v.detalles || []).forEach((d) => {
      const nombre = d.producto?.nombre ?? `Producto #${d.id_producto}`;
      cantidadPorProducto[nombre] =
        (cantidadPorProducto[nombre] || 0) + d.cantidad;
    });
  });
  const productosTop = Object.entries(cantidadPorProducto)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  const maxCantidadTop = Math.max(1, ...productosTop.map(([, c]) => c));

  const ventasRecientes = [...ventas]
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    .slice(0, 5);

  // ---- Metricas para Vendedor ----
  const misVentas = ventas.filter((v) => v.id_usuario === usuario?.id_usuario);
  const misVentasHoy = misVentas.filter((v) =>
    esMismoDia(new Date(v.fecha), hoy),
  );
  const totalMisVentasHoy = misVentasHoy.reduce(
    (acc, v) => acc + Number(v.total),
    0,
  );

  const totalPorCliente = {};
  misVentas.forEach((v) => {
    if (v.cliente) {
      const nombre = v.cliente.nombre;
      totalPorCliente[nombre] =
        (totalPorCliente[nombre] || 0) + Number(v.total);
    }
  });
  const topClienteEntry = Object.entries(totalPorCliente).sort(
    (a, b) => b[1] - a[1],
  )[0];

  const misVentasRecientes = [...misVentas]
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    .slice(0, 5);

  return (
    <div className="flex min-h-screen bg-cream">
      <SidebarCompras />
      <div className="flex-1">
        <HeaderModulo
          titulo={`${esAdmin ? "Bienvenida" : "Bienvenido"}, ${usuario?.nombre || ""}`}
        />

        <div className="p-4 sm:p-6">
          {cargando ? (
            <p className="text-stone font-sans">Cargando panel...</p>
          ) : esAdmin ? (
            <>
              {/* Tarjetas de estadisticas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl shadow-sm border-l-4 border-primary p-4 sm:p-5">
                  <p className="text-stone text-sm font-sans mb-1 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    Ventas del Mes
                  </p>
                  <p className="font-mono text-xl sm:text-2xl font-bold text-ink">
                    {formatMoney(totalVentasMes)}
                  </p>
                  <p className="text-xs text-stone mt-1">
                    {ventasDelMes.length} ventas registradas
                  </p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border-l-4 border-primary p-4 sm:p-5">
                  <p className="text-stone text-sm font-sans mb-1 flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5" />
                    Pedidos Activos
                  </p>
                  <p className="font-mono text-xl sm:text-2xl font-bold text-ink">
                    {pedidosActivos.length}
                  </p>
                  <p className="text-xs text-stone mt-1">
                    pendientes de recepción
                  </p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border-l-4 border-primary p-4 sm:p-5">
                  <p className="text-stone text-sm font-sans mb-1 flex items-center gap-1">
                    <Package className="w-3.5 h-3.5" />
                    Stock Total
                  </p>
                  <p className="font-mono text-xl sm:text-2xl font-bold text-ink">
                    {stockTotal}
                  </p>
                  {productosStockBajo.length > 0 && (
                    <p className="text-xs text-danger mt-1">
                      {productosStockBajo.length} producto(s) con stock bajo
                    </p>
                  )}
                </div>

                <div className="bg-white rounded-xl shadow-sm border-l-4 border-primary p-4 sm:p-5">
                  <p className="text-stone text-sm font-sans mb-1 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    Clientes Totales
                  </p>
                  <p className="font-mono text-xl sm:text-2xl font-bold text-ink">
                    {clientesActivos.length}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                {/* Grafico de ventas */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-5">
                  <p className="font-display font-semibold text-ink mb-4 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-primary" />
                    Ventas — últimos 7 días
                  </p>

                  <div className="flex items-end gap-2 sm:gap-3 h-32 sm:h-40">
                    {ventasPorDia.map(({ dia, total }) => {
                      const alturaPx = Math.max(2, (total / maxVentaDia) * 140);
                      return (
                        <div
                          key={dia.toISOString()}
                          className="flex-1 flex flex-col items-center justify-end gap-1 h-full"
                        >
                          <div
                            className="w-full bg-primary/70 rounded-t"
                            style={{ height: `${alturaPx}px` }}
                            title={formatMoney(total)}
                          />
                          <span className="text-xs text-stone">
                            {dia.toLocaleDateString("es-BO", {
                              weekday: "short",
                            })}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Productos mas vendidos */}
                <div className="bg-white rounded-xl shadow-sm p-5">
                  <p className="font-display font-semibold text-ink mb-4 flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-primary" />
                    Productos más vendidos
                  </p>
                  {productosTop.length === 0 ? (
                    <p className="text-stone text-sm">
                      Aún no hay ventas registradas
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {productosTop.map(([nombre, cantidad]) => (
                        <div key={nombre}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-ink">{nombre}</span>
                            <span className="text-stone font-mono">
                              {cantidad}
                            </span>
                          </div>
                          <div className="w-full bg-cream rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{
                                width: `${(cantidad / maxCantidadTop) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Actividad reciente */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-3 py-2 sm:px-5 sm:py-4 border-b border-stone/10">
                  <p className="font-display font-semibold text-ink flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    Ventas recientes
                  </p>
                </div>
                <table className="w-full text-left">
                  <thead className="bg-cream/50">
                    <tr>
                      <th className="px-3 py-1 sm:px-5 sm:py-2 text-xs font-medium text-stone uppercase">
                        #Venta
                      </th>
                      <th className="px-3 py-1 sm:px-5 sm:py-2 text-xs font-medium text-stone uppercase">
                        Cliente
                      </th>
                      <th className="px-3 py-1 sm:px-5 sm:py-2 text-xs font-medium text-stone uppercase">
                        Fecha
                      </th>
                      <th className="px-3 py-1 sm:px-5 sm:py-2 text-xs font-medium text-stone uppercase">
                        Monto
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {ventasRecientes.length === 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-3 py-4 sm:px-5 sm:py-6 text-center text-stone"
                        >
                          No hay ventas registradas todavía
                        </td>
                      </tr>
                    )}
                    {ventasRecientes.map((v) => (
                      <tr key={v.id_venta} className="border-t border-stone/10">
                        <td className="px-3 py-2 sm:px-5 sm:py-3 text-sm font-mono text-ink">
                          #{v.id_venta}
                        </td>
                        <td className="px-3 py-2 sm:px-5 sm:py-3 text-sm text-ink">
                          {v.cliente ? v.cliente.nombre : "Sin cliente"}
                        </td>
                        <td className="px-3 py-2 sm:px-5 sm:py-3 text-sm text-stone">
                          {new Date(v.fecha).toLocaleString("es-BO")}
                        </td>
                        <td className="px-3 py-2 sm:px-5 sm:py-3 text-sm font-mono font-semibold text-ink">
                          {formatMoney(v.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <>
              {/* Vista para Vendedor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="bg-white rounded-xl shadow-sm border-l-4 border-primary p-4 sm:p-5">
                  <p className="text-stone text-sm font-sans mb-1 flex items-center gap-1">
                    <ShoppingCart className="w-3.5 h-3.5" />
                    Mis Ventas Hoy
                  </p>
                  <p className="font-mono text-xl sm:text-2xl font-bold text-ink">
                    {formatMoney(totalMisVentasHoy)}
                  </p>
                  <p className="text-xs text-stone mt-1">
                    {misVentasHoy.length} venta(s) hoy
                  </p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border-l-4 border-primary p-4 sm:p-5">
                  <p className="text-stone text-sm font-sans mb-1 flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    Top Cliente
                  </p>
                  {topClienteEntry ? (
                    <>
                      <p className="font-display text-lg font-bold text-ink">
                        {topClienteEntry[0]}
                      </p>
                      <p className="text-xs text-stone mt-1">
                        {formatMoney(topClienteEntry[1])} en compras contigo
                      </p>
                    </>
                  ) : (
                    <p className="text-stone text-sm">
                      Aún no tienes ventas con cliente
                    </p>
                  )}
                </div>
              </div>

              {/* Acciones rapidas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <Link
                  to="/ventas"
                  className="flex items-center justify-between bg-primary hover:bg-primary-dark text-white rounded-xl p-4 sm:p-5 transition-colors"
                >
                  <span className="font-display font-semibold flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4" />
                    Registrar Nueva Venta
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/clientes"
                  className="flex items-center justify-between bg-white hover:bg-cream text-ink rounded-xl shadow-sm p-4 sm:p-5 transition-colors"
                >
                  <span className="font-display font-semibold flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Gestionar Clientes
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Mis ventas recientes */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-3 py-2 sm:px-5 sm:py-4 border-b border-stone/10">
                  <p className="font-display font-semibold text-ink flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    Mis ventas recientes
                  </p>
                </div>
                <table className="w-full text-left">
                  <thead className="bg-cream/50">
                    <tr>
                      <th className="px-3 py-1 sm:px-5 sm:py-2 text-xs font-medium text-stone uppercase">
                        #Venta
                      </th>
                      <th className="px-3 py-1 sm:px-5 sm:py-2 text-xs font-medium text-stone uppercase">
                        Cliente
                      </th>
                      <th className="px-3 py-1 sm:px-5 sm:py-2 text-xs font-medium text-stone uppercase">
                        Fecha
                      </th>
                      <th className="px-3 py-1 sm:px-5 sm:py-2 text-xs font-medium text-stone uppercase">
                        Monto
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {misVentasRecientes.length === 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-3 py-4 sm:px-5 sm:py-6 text-center text-stone"
                        >
                          Aún no has registrado ventas
                        </td>
                      </tr>
                    )}
                    {misVentasRecientes.map((v) => (
                      <tr key={v.id_venta} className="border-t border-stone/10">
                        <td className="px-3 py-2 sm:px-5 sm:py-3 text-sm font-mono text-ink">
                          #{v.id_venta}
                        </td>
                        <td className="px-3 py-2 sm:px-5 sm:py-3 text-sm text-ink">
                          {v.cliente ? v.cliente.nombre : "Sin cliente"}
                        </td>
                        <td className="px-3 py-2 sm:px-5 sm:py-3 text-sm text-stone">
                          {new Date(v.fecha).toLocaleString("es-BO")}
                        </td>
                        <td className="px-3 py-2 sm:px-5 sm:py-3 text-sm font-mono font-semibold text-ink">
                          {formatMoney(v.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
        <Footer />
      </div>
    </div>
  );
}
