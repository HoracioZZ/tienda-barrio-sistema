require("dotenv").config({ quiet: true });

const app = require("./app");
const cron = require("node-cron");
const alertaService = require("./services/alerta.service");

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});

// TIEN-29
cron.schedule("0 7 * * *", async () => {
  try {
    console.log("[JOB] Verificando stock bajo y vencimientos...");

    const resultado =
      await alertaService.ejecutarVerificacionCompleta();

    console.log("[JOB] Resultado:", resultado);
  } catch (error) {
    console.error("[JOB] Error:", error.message);
  }
});