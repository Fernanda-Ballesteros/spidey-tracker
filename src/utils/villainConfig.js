// Catálogos de villanos (mismos valores que acepta el backend).

// Nivel de amenaza: etiqueta y color de la insignia.
export const THREAT_META = {
  bajo: { label: 'Bajo', color: '#35c77a', solid: false },
  medio: { label: 'Medio', color: '#f2b544', solid: false },
  alto: { label: 'Alto', color: '#ff8a3d', solid: false },
  extremo: { label: 'Extremo', color: '#e5484d', solid: true },
}

export const THREAT_LEVELS = Object.keys(THREAT_META)

export function threatMeta(level) {
  return (
    THREAT_META[level] || {
      label: level || 'Sin dato',
      color: '#8b9cb5',
      solid: false,
    }
  )
}

// Estado del villano: etiqueta y variante del componente Chip.
export const VILLAIN_STATUS_META = {
  activo: { label: 'Activo', chip: 'success' },
  capturado: { label: 'Capturado', chip: 'muted' },
  desaparecido: { label: 'Desaparecido', chip: 'danger' },
  fallecido: { label: 'Fallecido', chip: 'muted' },
}

export const VILLAIN_STATUSES = Object.keys(VILLAIN_STATUS_META)

export function villainStatusMeta(status) {
  return (
    VILLAIN_STATUS_META[status] || {
      label: status || 'Sin dato',
      chip: 'muted',
    }
  )
}

// Opciones listas para los <select> de filtros y formulario.
export const THREAT_OPTIONS = THREAT_LEVELS.map((value) => ({
  value,
  label: THREAT_META[value].label,
}))

export const VILLAIN_STATUS_OPTIONS = VILLAIN_STATUSES.map((value) => ({
  value,
  label: VILLAIN_STATUS_META[value].label,
}))

// Historial de crímenes que viene dentro del detalle del villano.
export const CRIME_TYPE_LABELS = {
  asalto: 'Asalto',
  robo: 'Robo',
  balacera: 'Balacera',
  secuestro: 'Secuestro',
  vandalismo: 'Vandalismo',
  incendio: 'Incendio',
  otro: 'Otro',
}

export const CRIME_SEVERITY_META = {
  baja: { label: 'Baja', chip: 'info' },
  media: { label: 'Media', chip: 'warning' },
  alta: { label: 'Alta', chip: 'danger' },
  critica: { label: 'Crítica', chip: 'danger' },
}

export const CRIME_STATUS_LABELS = {
  reportado: 'Reportado',
  'en-proceso': 'En proceso',
  resuelto: 'Resuelto',
}

export function crimeTypeLabel(type) {
  return CRIME_TYPE_LABELS[type] || type || '—'
}

export function crimeSeverityMeta(severity) {
  return CRIME_SEVERITY_META[severity] || { label: severity || '—', chip: 'muted' }
}

export function crimeStatusLabel(status) {
  return CRIME_STATUS_LABELS[status] || status || '—'
}
