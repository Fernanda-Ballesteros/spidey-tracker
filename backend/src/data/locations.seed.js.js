"use strict";

// "key" solo sirve para que los demás seeds referencien la ubicación.
// No se guarda en la base de datos.
module.exports = [
    // ---------- Avistamientos ----------
    {
        key: "av-brooklyn",
        name: "Puente de Brooklyn",
        description: "Puente colgante donde Spider-Man cruza con frecuencia entre Manhattan y Brooklyn.",
        category: "avistamiento",
        latitude: 40.7061,
        longitude: -73.9969,
    },
    {
        key: "av-lic",
        name: "Queensboro Plaza",
        description: "Zona de azoteas y vías elevadas en Long Island City, ruta habitual de patrullaje.",
        category: "avistamiento",
        latitude: 40.7508,
        longitude: -73.9402,
    },
    {
        key: "av-times",
        name: "Times Square",
        description: "Cruce más concurrido de Manhattan, con pantallas luminosas y mucha afluencia turística.",
        category: "avistamiento",
        latitude: 40.758,
        longitude: -73.9855,
    },
    {
        key: "av-flushing",
        name: "Unisphere, Flushing Meadows",
        description: "Parque de Queens con la gran esfera de acero, punto de varios avistamientos.",
        category: "avistamiento",
        latitude: 40.7466,
        longitude: -73.8448,
    },
    {
        key: "av-harlem",
        name: "Azoteas de Harlem",
        description: "Edificios altos de Harlem usados para el desplazamiento y vigilancia nocturna.",
        category: "avistamiento",
        latitude: 40.8116,
        longitude: -73.9465,
    },

    // ---------- Crímenes ----------
    {
        key: "cr-banco",
        name: "Banco de Jamaica, Queens",
        description: "Sucursal bancaria de Jamaica, objetivo de asaltos recientes.",
        category: "crimen",
        latitude: 40.7021,
        longitude: -73.789,
    },
    {
        key: "cr-diamantes",
        name: "Distrito de los Diamantes",
        description: "Calle de joyerías en Midtown, con varios robos reportados.",
        category: "crimen",
        latitude: 40.7573,
        longitude: -73.981,
    },
    {
        key: "cr-redhook",
        name: "Muelle de Red Hook",
        description: "Muelles y bodegas de Brooklyn donde ocurren secuestros e incendios.",
        category: "crimen",
        latitude: 40.6745,
        longitude: -74.009,
    },
    {
        key: "cr-jay",
        name: "Estación Jay St-MetroTech",
        description: "Estación de metro de Brooklyn con incidentes de violencia entre bandas.",
        category: "crimen",
        latitude: 40.6923,
        longitude: -73.9873,
    },

    // ---------- Guaridas ----------
    {
        key: "gu-oscorp",
        name: "Fábrica abandonada de Oscorp",
        description: "Antigua planta industrial en Gowanus, posible laboratorio y escondite de varios villanos.",
        category: "guarida",
        latitude: 40.672,
        longitude: -73.989,
    },
    {
        key: "gu-sunnyside",
        name: "Patio ferroviario de Sunnyside",
        description: "Enorme patio de trenes en Queens con subestaciones eléctricas fuera de servicio.",
        category: "guarida",
        latitude: 40.7415,
        longitude: -73.925,
    },
    {
        key: "gu-hells",
        name: "Almacén de Hell's Kitchen",
        description: "Almacén que se cree usado como centro de operaciones de una organización criminal.",
        category: "guarida",
        latitude: 40.764,
        longitude: -73.996,
    },

    // ---------- Puntos de interés ----------
    {
        key: "pi-bugle",
        name: "Edificio del Daily Bugle",
        description: "Sede del periódico donde Peter Parker trabaja como fotógrafo.",
        category: "punto-de-interes",
        latitude: 40.7527,
        longitude: -73.9772,
    },
    {
        key: "pi-may",
        name: "Casa de tía May, Forest Hills",
        description: "Hogar de la familia Parker en Queens y punto seguro para Peter.",
        category: "punto-de-interes",
        latitude: 40.7185,
        longitude: -73.8448,
    },
];