"use strict"

const AppError = require("../utils/appError")

// Ruta no encontrada
function notFoundHandler(req, res, next) {
  next(
    new AppError(
      `No existe la ruta ${req.method} ${req.originalUrl}.`,
      404
    )
  )
}

// Registrar en la consola (4 parámetros: así Express lo reconoce como manejador de errores)
function logErrors(err, req, res, next) {
  console.error("---------- ERROR ----------")
  console.error("Fecha:", new Date().toISOString())
  console.error("Metodo:", req.method)
  console.error("Ruta:", req.originalUrl)
  console.error("Mensaje:", err.message)

  if (err.stack) {
    console.error(err.stack)
  }

  console.error("----------------------------\n")

  next(err)
}

// Convierte errores de Mongoose y de JSON en errores 400 entendibles
function normalizeError(err) {
  if (err.name === "CastError") {
    return new AppError("El identificador enviado no es válido.", 400)
  }

  if (err.name === "ValidationError" && err.errors) {
    const details = Object.values(err.errors).map((e) => e.message)
    return new AppError("Los datos enviados no son válidos.", 400, details)
  }

  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return new AppError("El cuerpo del JSON tiene un error de sintaxis.", 400)
  }

  return err
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err)
  }

  const error = normalizeError(err)

  const statusCode = error.status || error.statusCode || 500
  const message =
    statusCode === 500
      ? "Ocurrió un error interno en el servidor."
      : error.message

  res.status(statusCode).json({
    error: {
      status: statusCode,
      message,
      details: error.details || null,
      path: req.originalUrl,
      timestamp: new Date().toISOString()
    }
  })
}

module.exports = { notFoundHandler, logErrors, errorHandler }