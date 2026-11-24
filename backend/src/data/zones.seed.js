"use strict";

// Polígonos aproximados, en formato [longitud, latitud].
// Cada anillo termina en el mismo punto con el que empieza.
module.exports = [
    {
        name: "Queens",
        description: "Zona perimetral de Queens, el barrio de Peter Parker.",
        riskLevel: "alto",
        area: {
            type: "Polygon",
            coordinates: [[
                [-73.962, 40.770],
                [-73.700, 40.800],
                [-73.700, 40.590],
                [-73.850, 40.540],
                [-73.962, 40.600],
                [-73.962, 40.770],
            ]],
        },
    },
    {
        name: "Manhattan",
        description: "Isla de Manhattan, donde están el Daily Bugle y la Torre Stark.",
        riskLevel: "alto",
        area: {
            type: "Polygon",
            coordinates: [[
                [-74.019, 40.700],
                [-73.972, 40.710],
                [-73.929, 40.800],
                [-73.910, 40.873],
                [-73.933, 40.878],
                [-73.960, 40.820],
                [-74.010, 40.720],
                [-74.019, 40.700],
            ]],
        },
    },
    {
        name: "Brooklyn",
        description: "Distrito de Brooklyn, con puentes y muelles de actividad constante.",
        riskLevel: "medio",
        area: {
            type: "Polygon",
            coordinates: [[
                [-74.040, 40.570],
                [-73.860, 40.570],
                [-73.860, 40.700],
                [-73.985, 40.704],
                [-74.040, 40.640],
                [-74.040, 40.570],
            ]],
        },
    },
    {
        name: "Midtown Oeste",
        description: "Hell's Kitchen y alrededores de Times Square.",
        riskLevel: "medio",
        area: {
            type: "Polygon",
            coordinates: [[
                [-74.005, 40.755],
                [-73.975, 40.755],
                [-73.975, 40.775],
                [-74.005, 40.775],
                [-74.005, 40.755],
            ]],
        },
    },
];