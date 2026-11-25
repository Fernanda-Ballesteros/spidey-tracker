/**
 * Regla del proyecto:
 * - El backend y GeoJSON usan [longitud, latitud].
 * - Leaflet usa [latitud, longitud].
 */

// Convierte un Point de GeoJSON al formato de Leaflet.
export function toLeaflet(point) {
  if (!point || !Array.isArray(point.coordinates)) {
    return null
  }

  const [longitude, latitude] = point.coordinates
  return [latitude, longitude]
}

// Convierte un LatLng de Leaflet a los campos que espera el backend.
export function toPayload(latlng) {
  const latitude = Array.isArray(latlng) ? latlng[0] : latlng.lat
  const longitude = Array.isArray(latlng) ? latlng[1] : latlng.lng

  return { latitude, longitude }
}

// Convierte un anillo GeoJSON [lng, lat] a una lista de LatLng de Leaflet.
export function ringToLeaflet(ring) {
  if (!Array.isArray(ring)) {
    return []
  }

  return ring.map(([longitude, latitude]) => [latitude, longitude])
}

// Convierte las coordenadas de un Polygon GeoJSON al formato de Leaflet.
export function polygonToLeaflet(polygon) {
  if (!polygon || !Array.isArray(polygon.coordinates)) {
    return []
  }

  return polygon.coordinates.map(ringToLeaflet)
}
