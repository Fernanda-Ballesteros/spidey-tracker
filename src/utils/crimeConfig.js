import { CRIME_TYPE_LABELS } from '@/utils/villainConfig'

export { crimeTypeLabel } from '@/utils/villainConfig'

export const SEVERITY_META = {
  baja: { label: 'Baja', color: '#3ec7df', solid: false },
  media: { label: 'Media', color: '#f2b544', solid: false },
  alta: { label: 'Alta', color: '#ff8a3d', solid: false },
  critica: { label: 'Crítica', color: '#e5484d', solid: true },
}

export function severityMeta(severity) {
  return (
    SEVERITY_META[severity] || {
      label: severity || 'Sin dato',
      color: '#8b9cb5',
      solid: false,
    }
  )
}

export const CRIME_STATUS_META = {
  reportado: { label: 'Reportado', chip: 'warning' },
  'en-proceso': { label: 'En proceso', chip: 'info' },
  resuelto: { label: 'Resuelto', chip: 'success' },
}

export function crimeStatusMeta(status) {
  return (
    CRIME_STATUS_META[status] || {
      label: status || 'Sin dato',
      chip: 'muted',
    }
  )
}

export const SIGHTING_STATUS_LABELS = {
  confirmado: 'Confirmado',
  'por-verificar': 'Por verificar',
  descartado: 'Descartado',
}

export const TYPE_OPTIONS = Object.entries(CRIME_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}))

export const SEVERITY_OPTIONS = Object.entries(SEVERITY_META).map(([value, meta]) => ({
  value,
  label: meta.label,
}))

export const CRIME_STATUS_OPTIONS = Object.entries(CRIME_STATUS_META).map(([value, meta]) => ({
  value,
  label: meta.label,
}))