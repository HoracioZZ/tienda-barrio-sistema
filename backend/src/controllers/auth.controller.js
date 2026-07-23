const authService = require('../services/auth.service');

async function login(req, res) {
  try {
    const { login, contrasena } = req.body;
    const resultado = await authService.login(login, contrasena);
    res.json(resultado);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
}

async function registrar(req, res) {
  try {
    const nuevoUsuario = await authService.registrarUsuario(req.body);
    res.status(201).json(nuevoUsuario);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

module.exports = { login, registrar };
