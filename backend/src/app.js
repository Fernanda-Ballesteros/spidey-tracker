"use strict";

require("dotenv").config();

const express = require("express");
const cors = require("cors");

const routerApi = require("./routes");
const AppError = require("./utils/appError");

const {
  notFoundHandler,
  logErrors,
  errorHandler
} = require("./middlewares/error.handler");

const app = express();

// Orígenes permitidos: vienen del .env separados por comas
// Ejemplo: FRONTEND_ORIGINS=http://localhost:5173,https://spidey-tracker.vercel.app
const allowedOrigins = (process.env.FRONTEND_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

// CORS
app.use(
  cors({
    origin(origin, callback) {
      // REST Client, Postman y curl no envían ORIGIN
      if (!origin) {
        return callback(null, true);
      }

      // Sin orígenes configurados se permite todo (solo para desarrollo)
      if (allowedOrigins.length === 0) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        new AppError("Acceso denegado por CORS: origen no permitido.", 403)
      );
    }
  })
);

// Las zonas son polígonos con muchos vértices, por eso el límite es mayor
app.use(express.json({ limit: "1mb" }));

// Registro de cada petición: método, ruta, código y duración
app.use((req, res, next) => {
  const startTime = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - startTime;
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
  });

  next();
});

app.get("/", (req, res) => {
  res.status(200).json({
    name: "Spidey Tracker API",
    version: "1.0.0",
    endpoints: {
      health: "/api/health",
      auth: "/api/auth",
      locations: "/api/locations",
      zones: "/api/zones",
      sightings: "/api/sightings",
      crimes: "/api/crimes",
      villains: "/api/villains"
    }
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString()
  });
});

routerApi(app);

app.use(notFoundHandler);
app.use(logErrors);
app.use(errorHandler);

module.exports = app;