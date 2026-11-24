"use strict";

// hideouts: claves de ubicaciones con categoría "guarida"
module.exports = [
    {
        key: "duende-verde",
        name: "Duende Verde",
        alias: "Norman Osborn",
        history:
            "Industrial de Oscorp que se transformó tras probar en sí mismo una fórmula experimental. Ataca con bombas calabaza desde su planeador.",
        powers: ["fuerza sobrehumana", "planeador", "bombas calabaza"],
        threatLevel: "extremo",
        status: "activo",
        hideouts: ["gu-oscorp"],
    },
    {
        key: "doc-ock",
        name: "Doctor Octopus",
        alias: "Otto Octavius",
        history:
            "Científico brillante fusionado con cuatro brazos mecánicos tras un accidente en su laboratorio. Planea grandes robos con ayuda de su tecnología.",
        powers: ["brazos mecánicos", "intelecto genial"],
        threatLevel: "alto",
        status: "activo",
        hideouts: ["gu-oscorp"],
    },
    {
        key: "electro",
        name: "Electro",
        alias: "Max Dillon",
        history:
            "Ex técnico eléctrico que adquirió poderes tras un accidente con anguilas eléctricas. Provoca apagones y ataques en la red de energía.",
        powers: ["control eléctrico", "absorción de energía"],
        threatLevel: "alto",
        status: "activo",
        hideouts: ["gu-sunnyside"],
    },
    {
        key: "kingpin",
        name: "Kingpin",
        alias: "Wilson Fisk",
        history:
            "Magnate y cabeza del crimen organizado de Nueva York. Controla negocios legales como fachada de su imperio criminal.",
        powers: ["fuerza física", "imperio criminal"],
        threatLevel: "alto",
        status: "activo",
        hideouts: ["gu-hells"],
    },
    {
        key: "buitre",
        name: "El Buitre",
        alias: "Adrian Toomes",
        history:
            "Ingeniero que construyó un traje con alas a partir de tecnología alienígena recuperada. Fue capturado tras un robo de joyas.",
        powers: ["traje con alas", "vuelo"],
        threatLevel: "medio",
        status: "capturado",
        hideouts: [],
    },
    {
        key: "lagarto",
        name: "El Lagarto",
        alias: "Curt Connors",
        history:
            "Biólogo que buscaba regenerar su brazo perdido y se transformó en una criatura reptil. Su paradero actual es desconocido.",
        powers: ["regeneración", "fuerza sobrehumana"],
        threatLevel: "alto",
        status: "desaparecido",
        hideouts: [],
    },
];