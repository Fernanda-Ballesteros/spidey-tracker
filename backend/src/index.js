"use strict";

const app = require("./app");

const {
  connectDatabase,
  disconnectDatabase
} = require("./config/database");

const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  try {
    // 1. Conectar a la base de datos
    await connectDatabase();

    // 2. Iniciar el servidor
    const server = app.listen(PORT, () => {
      console.log("");
      console.log("===============================================================");
      console.log("SPIDEY TRACKER API");
      console.log("===============================================================");
      console.log(`Servidor: http://localhost:${PORT}`);
      console.log(`Health:   http://localhost:${PORT}/api/health`);
      console.log(`Auth:     http://localhost:${PORT}/api/auth`);
      console.log("===============================================================");
      console.log("");
    });

    // Cierre controlado
    function shutdown(signal) {
      console.log(`\nSe recibió la señal de cierre: ${signal}. Cerrando servidor`);

      server.close(async () => {
        await disconnectDatabase();
        console.log("Servidor cerrado.");
        process.exit(0);
      });
    }

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (error) {
    console.error("Error al iniciar el servidor:", error.message);
    process.exit(1);
  }
}

startServer();