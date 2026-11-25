"use strict";

// "key" solo sirve para que los demás seeds referencien la ubicación.
// No se guarda en la base de datos.
// Coordenadas aproximadas en León, Guanajuato.
module.exports = [
    // ---------- Avistamientos ----------
    {
        key: "av-brooklyn",
        name: "Arco de la Calzada",
        description: "Arco emblemático de la Calzada de los Héroes; Spider-Man suele columpiarse desde aquí hacia el centro.",
        category: "avistamiento",
        latitude: 21.1189,
        longitude: -101.6797,
    },
    {
        key: "av-lic",
        name: "Azoteas de la Zona Piel",
        description: "Bodegas y locales de calzado con azoteas conectadas, ruta habitual de patrullaje.",
        category: "avistamiento",
        latitude: 21.1335,
        longitude: -101.67,
    },
    {
        key: "av-times",
        name: "Plaza Principal",
        description: "Corazón del Centro Histórico, frente al Palacio Municipal, con mucha afluencia de gente.",
        category: "avistamiento",
        latitude: 21.1222,
        longitude: -101.6826,
    },
    {
        key: "av-flushing",
        name: "Parque Metropolitano",
        description: "Parque junto a la presa El Palote, punto de varios avistamientos al atardecer.",
        category: "avistamiento",
        latitude: 21.17,
        longitude: -101.665,
    },
    {
        key: "av-harlem",
        name: "Azoteas del Barrio Arriba",
        description: "Barrio tradicional de calles estrechas usado para el desplazamiento y la vigilancia nocturna.",
        category: "avistamiento",
        latitude: 21.129,
        longitude: -101.681,
    },

    // ---------- Crímenes ----------
    {
        key: "cr-banco",
        name: "Banco del Blvd. Campestre",
        description: "Sucursal bancaria sobre el Blvd. Campestre, objetivo de asaltos recientes.",
        category: "crimen",
        latitude: 21.146,
        longitude: -101.692,
    },
    {
        key: "cr-diamantes",
        name: "Joyerías del Centro",
        description: "Calles de joyerías cerca de la Plaza Principal, con varios robos reportados.",
        category: "crimen",
        latitude: 21.1218,
        longitude: -101.68,
    },
    {
        key: "cr-redhook",
        name: "Bodegas de Ciudad Industrial",
        description: "Naves y bodegas al sur de la ciudad donde ocurren secuestros e incendios.",
        category: "crimen",
        latitude: 21.093,
        longitude: -101.645,
    },
    {
        key: "cr-jay",
        name: "Central de Autobuses",
        description: "Terminal con mucho movimiento de pasajeros e incidentes de violencia entre bandas.",
        category: "crimen",
        latitude: 21.1345,
        longitude: -101.668,
    },

    // ---------- Guaridas ----------
    {
        key: "gu-oscorp",
        name: "Fábrica abandonada de Oscorp",
        description: "Antigua planta industrial sobre el Blvd. Adolfo López Mateos, posible laboratorio y escondite de varios villanos.",
        category: "guarida",
        latitude: 21.101,
        longitude: -101.642,
    },
    {
        key: "gu-sunnyside",
        name: "Patio del ferrocarril",
        description: "Vías y bodegas ferroviarias con subestaciones eléctricas fuera de servicio.",
        category: "guarida",
        latitude: 21.1155,
        longitude: -101.687,
    },
    {
        key: "gu-hells",
        name: "Torre corporativa de Plaza Mayor",
        description: "Torre de oficinas que se cree usada como centro de operaciones de una organización criminal.",
        category: "guarida",
        latitude: 21.153,
        longitude: -101.6935,
    },

    // ---------- Puntos de interés ----------
    {
        key: "pi-bugle",
        name: "Corresponsalía del Daily Bugle",
        description: "Oficina del periódico donde Peter Parker entrega sus fotos.",
        category: "punto-de-interes",
        latitude: 21.1235,
        longitude: -101.684,
    },
    {
        key: "pi-may",
        name: "Casa de tía May, Jardines del Moral",
        description: "Hogar de la familia Parker y punto seguro para Peter.",
        category: "punto-de-interes",
        latitude: 21.148,
        longitude: -101.6985,
    },
];
