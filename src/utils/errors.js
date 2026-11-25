// Traduce el error del backend a un mensaje y una lista de detalles.
export function getErrorMessage(err) {
  if (!err?.response) {
    return {
      message: 'No se pudo conectar con el servidor',
      details: [],
    }
  }

  const errorBackend = err.response.data?.error

  if (!errorBackend) {
    return {
      message: 'Ocurrió un error inesperado',
      details: [],
    }
  }

  return {
    message: errorBackend.message || 'Ocurrió un error inesperado',
    details: Array.isArray(errorBackend.details) ? errorBackend.details : [],
  }
}
