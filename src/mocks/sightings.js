
export const SIGHTING_LOCATIONS_MOCK = [
  {
    id: 'loc-av-1',
    name: 'Azotea Daily Bugle',
    category: 'avistamiento',
    point: { type: 'Point', coordinates: [-73.9855, 40.7527] },
  },
  {
    id: 'loc-av-2',
    name: 'Puente de Brooklyn',
    category: 'avistamiento',
    point: { type: 'Point', coordinates: [-73.9969, 40.7061] },
  },
  {
    id: 'loc-av-3',
    name: 'Torre Oscorp',
    category: 'avistamiento',
    point: { type: 'Point', coordinates: [-73.9712, 40.7549] },
  },
  {
    id: 'loc-av-4',
    name: 'Estación Grand Central',
    category: 'avistamiento',
    point: { type: 'Point', coordinates: [-73.9772, 40.7527] },
  },
  {
    id: 'loc-av-5',
    name: 'Hudson River Greenway',
    category: 'avistamiento',
    point: { type: 'Point', coordinates: [-74.0113, 40.7306] },
  },
]

// Integración: GET /sightings
export const SIGHTINGS_LIST_MOCK = [
  {
    id: 'sig-0001',
    location: SIGHTING_LOCATIONS_MOCK[0],
    seenAt: '2024-10-14T18:30:00.000Z',
    status: 'confirmado',
    witness: 'J. Jonah Jameson',
    notes:
      'Sujeto visto balanceándose con traje rojo y azul hacia el norte. Dejó restos de telaraña fresca en la antena principal de transmisión de la azotea.',
    reportedBy: { name: 'Agente Morales' },
    createdAt: '2024-10-14T18:45:00.000Z',
  },
  {
    id: 'sig-0002',
    location: SIGHTING_LOCATIONS_MOCK[1],
    seenAt: '2024-10-14T14:15:00.000Z',
    status: 'confirmado',
    witness: 'Oficial NYPD Davis',
    notes: 'Intervención en el rescate de un autobús escolar suspendido del cable del puente.',
    reportedBy: { name: 'Agente Morales' },
    createdAt: '2024-10-14T14:30:00.000Z',
  },
  {
    id: 'sig-0003',
    location: SIGHTING_LOCATIONS_MOCK[2],
    seenAt: '2024-10-13T23:40:00.000Z',
    status: 'por-verificar',
    witness: 'Seguridad Privada Oscorp',
    notes: 'Silueta adherida a los ventanales del piso 72 durante la madrugada.',
    reportedBy: { name: 'Agente Morales' },
    createdAt: '2024-10-14T00:00:00.000Z',
  },
  {
    id: 'sig-0004',
    location: SIGHTING_LOCATIONS_MOCK[3],
    seenAt: '2024-10-13T11:20:00.000Z',
    status: 'por-verificar',
    witness: 'Ciudadano anónimo',
    notes: 'Reportan telaraña disolviéndose en el vestíbulo principal de la estación.',
    reportedBy: { name: 'Agente Morales' },
    createdAt: '2024-10-13T11:40:00.000Z',
  },
  {
    id: 'sig-0005',
    location: SIGHTING_LOCATIONS_MOCK[4],
    seenAt: '2024-10-12T09:05:00.000Z',
    status: 'descartado',
    witness: 'Turista no identificado',
    notes: 'Dron comercial con decoración roja confundido con Spider-Man.',
    reportedBy: { name: 'Agente Morales' },
    createdAt: '2024-10-12T09:30:00.000Z',
  },
]