const jwt = require('jsonwebtoken');

// Verifica que el usuario haya iniciado sesion (RF-18)
function verificarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, usuario) => {
    if (err) {
      return res.status(403).json({ error: 'Token invalido o expirado' });
    }
    req.usuario = usuario; // { id_usuario, rol }
    next();
  });
}

// Middleware de autorizacion por rol (RNF-4: restriccion de modulos por rol)
function permitirRoles(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.usuario || !rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({ error: 'No tienes permisos para esta accion' });
    }
    next();
  };
}

module.exports = { verificarToken, permitirRoles };
