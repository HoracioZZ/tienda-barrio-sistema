const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const ventaRoutes = require('./routes/venta.routes');
const productoRoutes = require('./routes/producto.routes');
const clienteRoutes = require('./routes/cliente.routes');
const pedidoRoutes = require('./routes/pedido.routes');
const reporteRoutes = require('./routes/reporte.routes');

const app = express();

app.use(cors());
app.use(express.json());

// Ruta de salud, util para probar que el backend levanto correctamente
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', mensaje: 'API Tienda de Barrio funcionando' });
});

// Modulos del sistema (uno por cada Epica/persona del equipo)
app.use('/api/auth', authRoutes);          // EPIC-3 - Persona 3
app.use('/api/ventas', ventaRoutes);       // EPIC-1 - Persona 1
app.use('/api/productos', productoRoutes); // EPIC-2 - Persona 2
app.use('/api/clientes', clienteRoutes);   // EPIC-4 - Persona 4
app.use('/api/pedidos', pedidoRoutes);     // EPIC-5 - Persona 5
app.use('/api/reportes', reporteRoutes);   // EPIC-6 - Persona 6

module.exports = app;
