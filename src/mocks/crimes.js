// DATOS DE EJEMPLO — solo para maquetar la vista de Crímenes.
// Tienen la misma forma que responde el backend.
// Al integrar la API, borrar este archivo y su import en CrimesView.vue.
import { VILLAINS_MOCK } from '@/mocks/villains'

// Así llega el villano poblado dentro de un crimen.
function villanoPoblado(villano) {
  return {
    id: villano.id,
    name: villano.name,
    alias: villano.alias,
    threatLevel: villano.threatLevel,
  }
}

// Ubicaciones de categoría "crimen" (selector del formulario).
// Integración: GET /locations?category=crimen
export const CRIME_LOCATIONS_MOCK = [
  {
    id: 'loc-cr-1',
    name: 'Torre Oscorp, Piso 82',
    category: 'crimen',
    point: { type: 'Point', coordinates: [-73.9772, 40.7527] },
  },
  {
    id: 'loc-cr-2',
    name: 'Banco Unión Wall St',
    category: 'crimen',
    point: { type: 'Point', coordinates: [-74.009, 40.706] },
  },
  {
    id: 'loc-cr-3',
    name: 'Muelle 42',
    category: 'crimen',
    point: { type: 'Point', coordinates: [-74.0045, 40.7608] },
  },
  {
    id: 'loc-cr-4',
    name: "Hell's Kitchen Sector 4",
    category: 'crimen',
    point: { type: 'Point', coordinates: [-73.993, 40.7638] },
  },
  {
    id: 'loc-cr-5',
    name: 'Campus Empire State',
    category: 'crimen',
    point: { type: 'Point', coordinates: [-73.9857, 40.7484] },
  },
]

// Avistamientos disponibles para ligar a un crimen (selector opcional).
// Integración: GET /sightings
export const SIGHTINGS_MOCK = [
  {
    id: 'sig-1',
    seenAt: '2024-10-14T21:20:00.000Z',
    status: 'confirmado',
    notes: 'Spider-Drone 04 detectó movimiento a 200 m del punto de detonación principal.',
  },
  {
    id: 'sig-2',
    seenAt: '2024-10-13T22:50:00.000Z',
    status: 'por-verificar',
    notes: 'Un testigo vio una figura balanceándose cerca del muelle.',
  },
]

// Integración: GET /crimes (lista) y GET /crimes/:id (detalle).
export const CRIMES_MOCK = [
  {
    id: 'cri-0001',
    type: 'asalto',
    severity: 'critica',
    status: 'en-proceso',
    description:
      'Sujeto equipado con planeador propulsado y armamento incendiario penetró la bóveda de componentes de tecnología aeroespacial en la azotea del complejo. Se reportaron detonaciones de gas y daños estructurales en el cuadrante norte.',
    occurredAt: '2024-10-14T21:40:00.000Z',
    location: {
      ...CRIME_LOCATIONS_MOCK[0],
      // Solo viene con GET /locations/:id (zonas donde cae el punto).
      zones: [{ id: 'zona-1', name: 'Sector Midtown Central', riskLevel: 'alto' }],
    },
    villain: villanoPoblado(VILLAINS_MOCK[0]),
    sighting: SIGHTINGS_MOCK[0],
    reportedBy: { name: 'Agente Morales' },
    createdAt: '2024-10-14T22:00:00.000Z',
  },
  {
    id: 'cri-0002',
    type: 'robo',
    severity: 'alta',
    status: 'reportado',
    description:
      'Robo tecnológico en la sucursal central: se llevaron prototipos de comunicación cifrada de la bóveda principal.',
    occurredAt: '2024-10-14T18:15:00.000Z',
    location: CRIME_LOCATIONS_MOCK[1],
    villain: villanoPoblado(VILLAINS_MOCK[1]),
    sighting: null,
    reportedBy: { name: 'Agente Morales' },
    createdAt: '2024-10-14T18:40:00.000Z',
  },
  {
    id: 'cri-0003',
    type: 'incendio',
    severity: 'alta',
    status: 'resuelto',
    description:
      'Incendio premeditado en una bodega del muelle. Bomberos controlaron el fuego y no hubo víctimas.',
    occurredAt: '2024-10-13T23:05:00.000Z',
    location: CRIME_LOCATIONS_MOCK[2],
    villain: null,
    sighting: SIGHTINGS_MOCK[1],
    reportedBy: { name: 'Agente Morales' },
    createdAt: '2024-10-14T00:10:00.000Z',
  },
  {
    id: 'cri-0004',
    type: 'balacera',
    severity: 'media',
    status: 'resuelto',
    description:
      'Intercambio de disparos entre bandas rivales en el sector 4. Sin heridos graves, la zona fue acordonada.',
    occurredAt: '2024-10-13T16:40:00.000Z',
    location: CRIME_LOCATIONS_MOCK[3],
    villain: null,
    sighting: null,
    reportedBy: { name: 'Agente Morales' },
    createdAt: '2024-10-13T17:00:00.000Z',
  },
  {
    id: 'cri-0005',
    type: 'vandalismo',
    severity: 'baja',
    status: 'resuelto',
    description:
      'Pintas y daños menores en el campus. Se retiraron las marcas y no se identificó al responsable.',
    occurredAt: '2024-10-12T09:10:00.000Z',
    location: CRIME_LOCATIONS_MOCK[4],
    villain: null,
    sighting: null,
    reportedBy: { name: 'Agente Morales' },
    createdAt: '2024-10-12T10:00:00.000Z',
  },
]