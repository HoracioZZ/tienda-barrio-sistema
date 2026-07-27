const alertaRepository = require('../repositories/alerta.repository');
const productoRepository = require('../repositories/producto.repository');

// RF-6 / TIEN-25
async function generarAlertasStockBajo() {
  const productos = await productoRepository.stockBajo();
  const admins = await alertaRepository.administradoresActivos();
  const generadas = [];

  for (const p of productos) {
    const yaExiste = await alertaRepository.existeAlertaReciente(p.id_producto, 'StockBajo');
    if (yaExiste) continue;

    for (const admin of admins) {
      const alerta = await alertaRepository.crear({
        tipo: 'StockBajo',
        mensaje: `${p.nombre} por debajo del minimo (${p.stock}/${p.stock_minimo})`,
        id_producto: p.id_producto,
        id_usuario: admin.id_usuario,
      });
      generadas.push(alerta);
    }
  }
  return generadas;
}

// RF-8 / TIEN-26
async function generarAlertasVencimiento(diasAnticipacion = 7) {
  const productos = await productoRepository.productosPorVencer(diasAnticipacion);
  const admins = await alertaRepository.administradoresActivos();
  const generadas = [];

  for (const p of productos) {
    const yaExiste = await alertaRepository.existeAlertaReciente(p.id_producto, 'Vencimiento');
    if (yaExiste) continue;

    const fecha = new Date(p.fecha_vencimiento).toLocaleDateString('es-BO');
    for (const admin of admins) {
      const alerta = await alertaRepository.crear({
        tipo: 'Vencimiento',
        mensaje: `${p.nombre} vence el ${fecha}`,
        id_producto: p.id_producto,
        id_usuario: admin.id_usuario,
      });
      generadas.push(alerta);
    }
  }
  return generadas;
}

// RF-10 / TIEN-27
async function generarSugerenciasPedido() {
  const productos = await productoRepository.stockBajo();
  return productos.map((p) => ({
    id_producto: p.id_producto,
    nombre: p.nombre,
    stock_actual: p.stock,
    stock_minimo: p.stock_minimo,
    cantidad_sugerida: Math.max(p.stock_minimo * 2 - p.stock, p.stock_minimo),
  }));
}

// TIEN-29
async function ejecutarVerificacionCompleta() {
  const stockBajo = await generarAlertasStockBajo();
  const vencimiento = await generarAlertasVencimiento();
  return { stockBajo: stockBajo.length, vencimiento: vencimiento.length };
}

async function listarAlertas() {
  return alertaRepository.listar();
}

async function listarPorUsuario(id_usuario) {
  return alertaRepository.listarPorUsuario(id_usuario);
}

module.exports = {
  generarAlertasStockBajo, generarAlertasVencimiento, generarSugerenciasPedido,
  ejecutarVerificacionCompleta, listarAlertas, listarPorUsuario,
};