const alertaService = require('../services/alerta.service');

async function listar(req, res) {
  res.json(await alertaService.listarAlertas());
}

// alertas del administrador logueado
async function misAlertas(req, res) {
  const id_usuario = req.usuario.id_usuario; // ⚠️ ajusta esta linea si tu middleware guarda el usuario con otro nombre (ej. req.user)
  res.json(await alertaService.listarPorUsuario(id_usuario));
}

// TIEN-27
async function sugerenciasPedido(req, res) {
  res.json(await alertaService.generarSugerenciasPedido());
}

// disparo manual (para probar en Thunder Client sin esperar al cron)
async function verificarAhora(req, res) {
  const resultado = await alertaService.ejecutarVerificacionCompleta();
  res.json({ mensaje: 'Verificacion ejecutada', ...resultado });
}

module.exports = { listar, misAlertas, sugerenciasPedido, verificarAhora };