const reporteService = require("../services/reporte.service");

async function generar(req, res) {
  try {
    const resultado =
      await reporteService.generarReporte({
        id_usuario: req.usuario.id_usuario,
        periodo: req.body.periodo,
        desde: req.body.desde,
        hasta: req.body.hasta,
      });

    res.status(201).json(resultado);
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
}

async function masVendidos(req, res) {
  try {
    const resultado =
      await reporteService.productosMasVendidos(
        req.query.desde,
        req.query.hasta
      );

    res.json(resultado);
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
}

async function comparar(req, res) {
  try {
    const resultado =
      await reporteService.compararPeriodos(
        req.query.desde1,
        req.query.hasta1,
        req.query.desde2,
        req.query.hasta2
      );

    res.json(resultado);
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
}

module.exports = {
  generar,
  masVendidos,
  comparar,
};