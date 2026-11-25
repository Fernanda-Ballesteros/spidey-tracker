// Formatos compartidos por las tablas y los popups.

export function formatDateTime(value) {
  if (!value) {
    return '—'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return '—'
  }

  return new Intl.DateTimeFormat('es', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function formatCoordinate(value) {
  const numero = Number(value)

  if (!Number.isFinite(numero)) {
    return '—'
  }

  return numero.toFixed(5)
}
