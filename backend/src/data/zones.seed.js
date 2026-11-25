"use strict";

// Polígonos aproximados en León, Guanajuato, en formato [longitud, latitud].
// Cada anillo termina en el mismo punto con el que empieza.
module.exports = [
    {
        name: "Centro Histórico",
        description: "Plaza Principal, Calzada de los Héroes y Barrio Arriba; zona con más avistamientos.",
        riskLevel: "alto",
        area: {
            type: "Polygon",
            coordinates: [[
                [-101.692, 21.115],
                [-101.672, 21.115],
                [-101.672, 21.131],
                [-101.692, 21.131],
                [-101.692, 21.115],
            ]],
        },
    },
    {
        name: "Zona Piel",
        description: "Zona comercial del calzado y la Central de Autobuses.",
        riskLevel: "medio",
        area: {
            type: "Polygon",
            coordinates: [[
                [-101.678, 21.131],
                [-101.662, 21.131],
                [-101.662, 21.140],
                [-101.678, 21.140],
                [-101.678, 21.131],
            ]],
        },
    },
    {
        name: "Ciudad Industrial",
        description: "Naves industriales y el Blvd. López Mateos, con actividad criminal constante.",
        riskLevel: "alto",
        area: {
            type: "Polygon",
            coordinates: [[
                [-101.660, 21.085],
                [-101.630, 21.085],
                [-101.630, 21.105],
                [-101.660, 21.105],
                [-101.660, 21.085],
            ]],
        },
    },
    {
        name: "Zona Campestre",
        description: "Blvd. Campestre, Plaza Mayor y Jardines del Moral.",
        riskLevel: "bajo",
        area: {
            type: "Polygon",
            coordinates: [[
                [-101.705, 21.140],
                [-101.685, 21.140],
                [-101.685, 21.160],
                [-101.705, 21.160],
                [-101.705, 21.140],
            ]],
        },
    },
];
