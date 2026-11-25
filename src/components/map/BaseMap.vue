<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css'
import '@/assets/styles/map.css'
import { categoryColor, DEFAULT_CENTER, DEFAULT_ZOOM, MAP_ATTRIBUTION, MAP_TILE_URL, riskMeta } from '@/utils/mapConfig'
import { polygonToLeaflet } from '@/utils/coordinates'

const props = defineProps({
  // Cada marcador: { id, latlng: [lat, lng], category, color, data }
  markers: {
    type: Array,
    default: () => [],
  },
  // FeatureCollection de zonas o arreglo de features GeoJSON.
  zones: {
    type: [Array, Object],
    default: () => [],
  },
  fitToMarkers: {
    type: Boolean,
    default: true,
  },
  selectedId: {
    type: [String, Number],
    default: null,
  },
})

const emit = defineEmits([
  'map-click',
  'marker-click',
  'zone-drawn',
  'zone-draw-cancelled',
])

const container = ref(null)

// Destino del Teleport: es el div que Leaflet inserta dentro del popup abierto.
// Así el contenido del popup sigue siendo un componente Vue normal de la vista.
const popupHost = shallowRef(null)
const popupMarker = shallowRef(null)

let map = null
let markersLayer = null
let zonesLayer = null
let draftZone = null
let resizeObserver = null
let drawingZone = false
let popupAbiertoAlHacerClic = false
let zoneJustCreated = false
let lastMarkerSignature = ''

const markerLayers = new Map()

// Icono cuadrado propio: evita los iconos por defecto de Leaflet y sus rutas en Vite.
function buildIcon(marker) {
  const color = marker.color || categoryColor(marker.category)
  const letter = (marker.category || '?').charAt(0).toUpperCase()

  return L.divIcon({
    className: 'spyder-marker',
    html: `<span class="spyder-marker__pin" style="--marker-color:${color}">${letter}</span>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -14],
  })
}

function handleMapClick(event) {
  if (drawingZone) {
    return
  }
  const target = event.originalEvent?.target
  if (!target || !target.isConnected || target.closest?.('.leaflet-popup')) {
    return
  }
  if (popupAbiertoAlHacerClic) {
    popupAbiertoAlHacerClic = false
    return
  }
  emit('map-click', {
    latitude: event.latlng.lat,
    longitude: event.latlng.lng,
  })
}

function fitMarkers() {
  if (!map) {
    return
  }

  const points = props.markers.map((marker) => marker.latlng).filter(Boolean)

  if (points.length === 0) {
    map.setView(DEFAULT_CENTER, DEFAULT_ZOOM)
    return
  }

  const bounds = L.latLngBounds(points)
  map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 })
}

function renderMarkers() {
  if (!map || !markersLayer) {
    return
  }

  const signature = props.markers.map((marker) => marker.id).join('|')
  const idsChanged = signature !== lastMarkerSignature
  lastMarkerSignature = signature

  // Al reconstruir los marcadores se destruyen los popups anteriores.
  popupHost.value = null
  popupMarker.value = null
  markersLayer.clearLayers()
  markerLayers.clear()

  props.markers.forEach((marker) => {
    if (!marker?.latlng) {
      return
    }

    // Este div será el destino del Teleport del popup.
    const host = document.createElement('div')
    host.className = 'marker-popup-host'
    host.addEventListener('click', (event) => event.stopPropagation())

    const layer = L.marker(marker.latlng, {
      icon: buildIcon(marker),
      title: marker.data?.name || '',
      keyboard: true,
    })

    layer.bindPopup(host, {
      className: 'spyder-popup',
      minWidth: 270,
      maxWidth: 330,
      closeButton: true,
      autoClose: true,
      autoPanPaddingTopLeft: [24, 24],
      autoPanPaddingBottomRight: [24, 24],
    })

    layer.on('click', () => emit('marker-click', marker))

    layer.on('popupopen', () => {
      popupMarker.value = marker
      popupHost.value = host

      // El contenido llega después de abrir el popup; hay que recalcular su tamaño.
      nextTick(() => {
        const popup = layer.getPopup()
        if (popup && map) {
          popup.update()
        }
      })
    })

    layer.on('popupclose', () => {
      if (popupHost.value === host) {
        popupHost.value = null
        popupMarker.value = null
      }
    })

    layer.addTo(markersLayer)
    markerLayers.set(String(marker.id), layer)
  })

  if (props.fitToMarkers && idsChanged) {
    fitMarkers()
  }

  // Tras editar o crear, la lista se vuelve a pedir. Si había un marcador
  // seleccionado, se abre de nuevo su popup con los datos actualizados.
  if (props.selectedId != null) {
    const selected = markerLayers.get(String(props.selectedId))
    if (selected) {
      selected.openPopup()
    }
  }
}

function renderZones() {
  if (!map || !zonesLayer) {
    return
  }

  zonesLayer.clearLayers()

  const features = Array.isArray(props.zones)
    ? props.zones
    : props.zones?.features || []

  features.forEach((feature) => {
    if (!feature?.geometry) {
      return
    }

    const rings = polygonToLeaflet(feature.geometry)
    if (rings.length === 0) {
      return
    }

    const riskLevel = feature.properties?.riskLevel || 'medio'
    const meta = riskMeta(riskLevel)

    const polygon = L.polygon(rings, {
      color: meta.color,
      weight: 1.6,
      opacity: 0.95,
      fillColor: meta.color,
      fillOpacity: 0.13,
      dashArray: '6 4',
      // Las zonas no deben bloquear el clic sobre el mapa.
      interactive: false,
    })

    if (feature.properties?.name) {
      polygon.bindTooltip(feature.properties.name, {
        permanent: true,
        direction: 'center',
        className: 'zone-label',
      })
    }

    polygon.addTo(zonesLayer)
  })
}

function focusMarker(id) {
  if (!map) {
    return
  }

  const layer = markerLayers.get(String(id))
  if (!layer) {
    return
  }

  // Sin animación: openPopup necesita ajustar el mapa para que el popup no
  // quede recortado por el borde superior del contenedor.
  map.setView(layer.getLatLng(), Math.max(map.getZoom(), 14))
  layer.openPopup()
}

function getCenter() {
  if (!map) {
    return { latitude: DEFAULT_CENTER[0], longitude: DEFAULT_CENTER[1] }
  }

  const center = map.getCenter()
  return { latitude: center.lat, longitude: center.lng }
}

// Activa el dibujo de polígonos de leaflet-geoman.
function enableZoneDrawing() {
  if (!map || !map.pm) {
    return
  }

  clearDraft()

  map.pm.enableDraw('Polygon', {
    snappable: true,
    snapDistance: 20,
    allowSelfIntersection: false,
    pathOptions: {
      color: '#3ec7df',
      weight: 2,
      fillColor: '#3ec7df',
      fillOpacity: 0.12,
      dashArray: '6 4',
    },
  })
}

// Quita el polígono de borrador cuando se guarda o se cancela el modal.
function clearDraft() {
  if (!map) {
    return
  }

  if (map.pm) {
    map.pm.disableDraw()
  }

  if (draftZone) {
    map.removeLayer(draftZone)
    draftZone = null
  }
}

function onZoneCreated(event) {
  zoneJustCreated = true
  drawingZone = false

  if (map?.pm) {
    map.pm.disableDraw()
  }

  draftZone = event.layer
  draftZone.setStyle({
    color: '#3ec7df',
    weight: 2,
    fillColor: '#3ec7df',
    fillOpacity: 0.12,
    dashArray: '6 4',
  })

  // layer.toGeoJSON() ya devuelve [lng, lat] y cierra el anillo.
  emit('zone-drawn', draftZone.toGeoJSON().geometry)
}

async function crearMapa() {
  // leaflet-geoman es un plugin que busca la variable global L.
  window.L = L

  try {
    await import('@geoman-io/leaflet-geoman-free')
  } catch (error) {
    // El mapa funciona aunque falle el plugin de dibujo.
    console.error('No se pudo cargar leaflet-geoman:', error)
  }

  if (!container.value) {
    return
  }

  map = L.map(container.value, {
    center: DEFAULT_CENTER,
    zoom: DEFAULT_ZOOM,
    zoomControl: true,
  })

  L.tileLayer(MAP_TILE_URL, {
    attribution: MAP_ATTRIBUTION,
    maxZoom: 19,
  }).addTo(map)

  markersLayer = L.layerGroup().addTo(map)
  zonesLayer = L.layerGroup().addTo(map)
  
  
  map.on('preclick', () => {
    popupAbiertoAlHacerClic = Boolean(popupMarker.value)
  })

  map.on('click', handleMapClick)

  if (map.pm) {
    map.pm.setLang('es')

    map.on('pm:drawstart', () => {
      drawingZone = true
      zoneJustCreated = false
    })

    map.on('pm:create', onZoneCreated)

    map.on('pm:drawend', () => {
      drawingZone = false

      // Si no se creó ninguna figura, el usuario canceló el dibujo.
      if (!zoneJustCreated) {
        emit('zone-draw-cancelled')
      }

      zoneJustCreated = false
    })
  }

  renderZones()
  renderMarkers()

  // El contenedor puede tardar un instante en tener su tamaño definitivo.
  requestAnimationFrame(() => {
    map?.invalidateSize()
  })

  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => {
      map?.invalidateSize()
    })
    resizeObserver.observe(container.value)
  }
}

watch(
  () => props.markers,
  () => renderMarkers(),
)

watch(
  () => props.zones,
  () => renderZones(),
)

watch(
  () => props.selectedId,
  (id) => {
    if (!map) {
      return
    }

    if (id === null || id === undefined) {
      map.closePopup()
      return
    }

    focusMarker(id)
  },
)

onMounted(crearMapa)

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  resizeObserver = null

  popupHost.value = null
  popupMarker.value = null

  if (map) {
    map.off()
    map.remove()
    map = null
  }
})

defineExpose({
  clearDraft,
  enableZoneDrawing,
  focusMarker,
  getCenter,
})
</script>

<template>
  <div class="base-map">
    <div ref="container" class="base-map__canvas"></div>

    <Teleport v-if="popupHost" :to="popupHost">
      <slot name="popup" :marker="popupMarker"></slot>
    </Teleport>
  </div>
</template>

<style scoped>
.base-map {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 360px;
}

.base-map__canvas {
  width: 100%;
  height: 100%;
  min-height: 360px;
}
</style>
