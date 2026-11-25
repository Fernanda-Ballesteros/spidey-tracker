// Configuración compartida por todos los mapas de la aplicación.

// Centro por defecto: Manhattan, zona principal de los datos de prueba.
export const DEFAULT_CENTER = [40.758, -73.9855]
export const DEFAULT_ZOOM = 11

export const MAP_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'

export const MAP_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>'

// Categorías de ubicación con su etiqueta, color de marcador y variante de chip.
export const LOCATION_CATEGORY_META = {
  avistamiento: {
    label: 'Avistamiento',
    color: '#3ec7df',
    chip: 'info',
  },
  crimen: {
    label: 'Crimen',
    color: '#ff5a5f',
    chip: 'danger',
  },
  guarida: {
    label: 'Guarida',
    color: '#f2b544',
    chip: 'warning',
  },
  'punto-de-interes': {
    label: 'Punto de interés',
    color: '#35c77a',
    chip: 'success',
  },
}

export const LOCATION_CATEGORIES = Object.keys(LOCATION_CATEGORY_META)

export function categoryMeta(category) {
  return (
    LOCATION_CATEGORY_META[category] || {
      label: category,
      color: '#8b9cb5',
      chip: 'muted',
    }
  )
}

export function categoryColor(category) {
  return categoryMeta(category).color
}

// Niveles de riesgo de una zona.
export const RISK_META = {
  bajo: {
    label: 'Riesgo bajo',
    color: '#35c77a',
    chip: 'success',
  },
  medio: {
    label: 'Riesgo medio',
    color: '#f2b544',
    chip: 'warning',
  },
  alto: {
    label: 'Riesgo alto',
    color: '#ff5a5f',
    chip: 'danger',
  },
}

export const RISK_LEVELS = Object.keys(RISK_META)

export function riskMeta(riskLevel) {
  return (
    RISK_META[riskLevel] || {
      label: riskLevel || 'Sin riesgo',
      color: '#8b9cb5',
      chip: 'muted',
    }
  )
}

export function riskColor(riskLevel) {
  return riskMeta(riskLevel).color
}
