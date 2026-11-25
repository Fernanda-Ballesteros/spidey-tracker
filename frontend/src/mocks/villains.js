// DATOS DE EJEMPLO — solo para maquetar la vista de Villanos.
// Tienen la misma forma que responde el backend.
// Al integrar la API, borrar este archivo y su import en VillainsView.vue.

// Ubicaciones de categoría "guarida" (para el selector del formulario).
// Integración: GET /locations?category=guarida
export const HIDEOUTS_MOCK = [
  {
    id: 'loc-oscorp',
    name: 'Torre Oscorp',
    category: 'guarida',
    point: { type: 'Point', coordinates: [-73.9712, 40.7549] },
  },
  {
    id: 'loc-queens',
    name: 'Almacén Queens',
    category: 'guarida',
    point: { type: 'Point', coordinates: [-73.9442, 40.7447] },
  },
  {
    id: 'loc-muelle',
    name: 'Muelle 42',
    category: 'guarida',
    point: { type: 'Point', coordinates: [-74.0021, 40.7615] },
  },
  {
    id: 'loc-hangar',
    name: 'Hangar Queens',
    category: 'guarida',
    point: { type: 'Point', coordinates: [-73.8740, 40.7769] },
  },
]

// Integración: GET /villains (lista) y GET /villains/:id (detalle, trae `crimes`).
export const VILLAINS_MOCK = [
  {
    id: 'vil-1',
    name: 'Norman Osborn',
    alias: 'Duende Verde',
    history:
      'Magnate industrial y fundador de Oscorp Industries. Expuesto voluntariamente a la fórmula experimental de mejora química global que le otorgó reflejos e inmunidad sobrehumana al costo de desestabilización psicótica crónica. Líder de múltiples complots terroristas en Manhattan.',
    powers: [
      'Fuerza sobrehumana',
      'Planeador de combate',
      'Bombas calabaza incendiarias',
      'Gas asfixiante',
      'Factor curativo acelerado',
    ],
    threatLevel: 'extremo',
    status: 'activo',
    knownLocations: [HIDEOUTS_MOCK[0], HIDEOUTS_MOCK[1]],
    crimes: [
      {
        id: 'cri-1',
        type: 'asalto',
        severity: 'critica',
        status: 'en-proceso',
        occurredAt: '2024-10-12T21:30:00.000Z',
      },
      {
        id: 'cri-2',
        type: 'vandalismo',
        severity: 'alta',
        status: 'reportado',
        occurredAt: '2024-09-28T03:10:00.000Z',
      },
      {
        id: 'cri-3',
        type: 'secuestro',
        severity: 'critica',
        status: 'reportado',
        occurredAt: '2024-08-15T18:45:00.000Z',
      },
    ],
  },
  {
    id: 'vil-2',
    name: 'Otto Octavius',
    alias: 'Doctor Octopus',
    history:
      'Científico brillante fusionado con cuatro brazos mecánicos tras un accidente en su laboratorio. Planea grandes robos con ayuda de su tecnología.',
    powers: ['Brazos mecánicos', 'Intelecto genial'],
    threatLevel: 'alto',
    status: 'capturado',
    knownLocations: [HIDEOUTS_MOCK[2]],
    crimes: [
      {
        id: 'cri-4',
        type: 'robo',
        severity: 'alta',
        status: 'resuelto',
        occurredAt: '2024-07-02T14:20:00.000Z',
      },
    ],
  },
  {
    id: 'vil-3',
    name: 'Sergei Kravinoff',
    alias: 'Kraven el Cazador',
    history:
      'Cazador de élite obsesionado con atrapar a las presas más peligrosas de la ciudad. Rastrea a sus objetivos por los techos de Queens.',
    powers: ['Rastreo experto', 'Agilidad'],
    threatLevel: 'alto',
    status: 'desaparecido',
    knownLocations: [HIDEOUTS_MOCK[3]],
    crimes: [],
  },
  {
    id: 'vil-4',
    name: 'Herman Schultz',
    alias: 'Shocker',
    history:
      'Ladrón de cajas fuertes que usa guanteletes sónicos para abrir bóvedas y aturdir a quien lo persiga.',
    powers: ['Guanteletes sónicos'],
    threatLevel: 'medio',
    status: 'capturado',
    knownLocations: [],
    crimes: [],
  },
]
