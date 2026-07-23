const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authRepository = require('../repositories/auth.repository');

async function login(login, contrasena) {
  const usuario = await authRepository.buscarPorLogin(login);
  if (!usuario) throw new Error('Credenciales invalidas');

  const passwordOk = await bcrypt.compare(contrasena, usuario.contrasena);
  if (!passwordOk) throw new Error('Credenciales invalidas');

  const token = jwt.sign(
    { id_usuario: usuario.id_usuario, rol: usuario.rol },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );

  return { token, usuario: { id_usuario: usuario.id_usuario, nombre: usuario.nombre, rol: usuario.rol } };
}

async function registrarUsuario({ nombre, login, contrasena, rol }) {
  const hash = await bcrypt.hash(contrasena, 10);
  return authRepository.crearUsuario({ nombre, login, contrasena: hash, rol });
}

module.exports = { login, registrarUsuario };
