const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

const authRoutes = require('./routes/auth.routes');
const ventaRoutes = require('./routes/venta.routes');
const productoRoutes = require('./routes/producto.routes');
const clienteRoutes = require('./routes/cliente.routes');
const pedidoRoutes = require('./routes/pedido.routes');
const reporteRoutes = require('./routes/reporte.routes');
const categoriaRoutes = require('./routes/categoria.routes');
const alertaRoutes = require('./routes/alerta.routes');

const app = express();

app.use(cors());
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(express.json());

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', mensaje: 'API Tienda de Barrio funcionando' });
});

app.use('/api/auth', authRoutes);
app.use('/api/ventas', ventaRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/alertas', alertaRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/pedidos', pedidoRoutes);
app.use('/api/reportes', reporteRoutes);

module.exports = app;