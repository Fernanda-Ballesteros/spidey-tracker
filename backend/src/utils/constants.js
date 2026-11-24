"use strict";

// Una sola fuente de verdad para las listas de valores permitidos.
// Las usan tanto los modelos como los validadores.

module.exports = {
    // Ubicaciones
    LOCATION_CATEGORIES: ["avistamiento", "crimen", "guarida", "punto-de-interes"],

    // Zonas
    RISK_LEVELS: ["bajo", "medio", "alto"],

    // Avistamientos
    SIGHTING_STATUSES: ["confirmado", "por-verificar", "descartado"],

    // Crímenes
    CRIME_TYPES: [
        "asalto",
        "robo",
        "balacera",
        "secuestro",
        "vandalismo",
        "incendio",
        "otro",
    ],
    CRIME_SEVERITIES: ["baja", "media", "alta", "critica"],
    CRIME_STATUSES: ["reportado", "en-proceso", "resuelto"],

    // Villanos
    THREAT_LEVELS: ["bajo", "medio", "alto", "extremo"],
    VILLAIN_STATUSES: ["activo", "capturado", "desaparecido", "fallecido"],
};