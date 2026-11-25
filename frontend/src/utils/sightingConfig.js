// Catálogos de avistamientos (mismos valores que acepta el backend).

// Estado: etiqueta, color del marcador y variante del componente Chip.
export const SIGHTING_STATUS_META = {
  confirmado: { label: 'Confirmado', color: '#35c77a', chip: 'success' },
  'por-verificar': { label: 'Por verificar', color: '#f2b544', chip: 'warning' },
  descartado: { label: 'Descartado', color: '#8b9cb5', chip: 'muted' },
}

export function sightingStatusMeta(status) {
  return (
    SIGHTING_STATUS_META[status] || {
      label: status || 'Sin dato',
      color: '#8b9cb5',
      chip: 'muted',
    }
  )
}

// Opciones listas para los <select> de filtros y formulario.
export const SIGHTING_STATUS_OPTIONS = Object.entries(SIGHTING_STATUS_META).map(
  ([value, meta]) => ({
    value,
    label: meta.label,
  }),
)