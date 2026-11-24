"use strict";

require("dotenv").config();

const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const { connectDatabase, disconnectDatabase } = require("../config/database");

const UserModel = require("../models/user.model");
const ZoneModel = require("../models/zone.model");
const LocationModel = require("../models/location.model");
const VillainModel = require("../models/villian.model");
const SightingModel = require("../models/sighting.model");
const CrimeModel = require("../models/crime.model");

const usersSeed = require("./users.seed");
const zonesSeed = require("./zones.seed");
const locationsSeed = require("./locations.seed.js.js");
const villainsSeed = require("./villians.seed");
const sightingsSeed = require("./sightings.seed");
const crimesSeed = require("./crimes.seed");

const SALT_ROUNDS = 10;

const hoursAgo = (hours) => new Date(Date.now() - hours * 60 * 60 * 1000);

// Busca el documento guardado por su clave y comprueba su categoría.
// Así el seed nunca deja un avistamiento apuntando a una ubicación de "crimen", etc.
function refOf(map, key, expectedCategory, label) {
    const doc = map.get(key);

    if (!doc) {
        throw new Error(`Seed inválido: no existe "${key}" (${label}).`);
    }

    if (expectedCategory && doc.category !== expectedCategory) {
        throw new Error(
            `Seed inválido: "${key}" es "${doc.category}" y ${label} requiere "${expectedCategory}".`
        );
    }

    return doc._id;
}

async function run() {
    if (process.env.NODE_ENV === "production" && !process.argv.includes("--force")) {
        throw new Error(
            "El seed borra los datos existentes. En producción ejecútalo solo con --force."
        );
    }

    const missingPasswords = ["SEED_USER_PASSWORD", "SEED_ADMIN_PASSWORD"].filter(
        (name) => !process.env[name]
    );
    if (missingPasswords.length > 0) {
        throw new Error(
            `Configura ${missingPasswords.join(" y ")} en backend/.env antes de ejecutar el seed.`
        );
    }

    await connectDatabase();
    console.log(`Base de datos: ${mongoose.connection.name}`);

    // Asegura los índices (único de correo/nombre y 2dsphere) antes de insertar
    await Promise.all(
        [UserModel, ZoneModel, LocationModel, VillainModel, SightingModel, CrimeModel].map(
            (model) => model.init()
        )
    );

    // 1. Usuarios: se crean solo si no existen (no se borra a nadie que ya se haya registrado)
    const users = new Map();
    for (const user of usersSeed) {
        let doc = await UserModel.findOne({ email: user.email });
        if (!doc) {
            doc = await UserModel.create({
                ...user,
                password: await bcrypt.hash(user.password, SALT_ROUNDS),
            });
        }
        users.set(user.email, doc);
    }
    const owner = users.get(usersSeed[0].email);

    // 2. Se limpian SOLO las colecciones de datos del mapa
    await Promise.all([
        CrimeModel.deleteMany({}),
        SightingModel.deleteMany({}),
        VillainModel.deleteMany({}),
        LocationModel.deleteMany({}),
        ZoneModel.deleteMany({}),
    ]);

    // 3. Zonas
    const zones = await ZoneModel.create(
        zonesSeed.map((zone) => ({ ...zone, createdBy: owner._id }))
    );

    // 4. Ubicaciones
    const locationDocs = await LocationModel.create(
        locationsSeed.map((location) => ({
            name: location.name,
            description: location.description,
            category: location.category,
            point: {
                type: "Point",
                coordinates: [location.longitude, location.latitude],
            },
            createdBy: owner._id,
        }))
    );
    const locations = new Map(locationsSeed.map((l, i) => [l.key, locationDocs[i]]));

    // 5. Villanos (sus guaridas deben ser ubicaciones "guarida")
    const villainDocs = await VillainModel.create(
        villainsSeed.map((villain) => ({
            name: villain.name,
            alias: villain.alias,
            history: villain.history,
            powers: villain.powers,
            threatLevel: villain.threatLevel,
            status: villain.status,
            knownLocations: villain.hideouts.map((key) =>
                refOf(locations, key, "guarida", `la guarida de ${villain.name}`)
            ),
            createdBy: owner._id,
        }))
    );
    const villains = new Map(villainsSeed.map((v, i) => [v.key, villainDocs[i]]));

    // 6. Avistamientos (solo en ubicaciones "avistamiento")
    const sightingDocs = await SightingModel.create(
        sightingsSeed.map((sighting) => ({
            location: refOf(locations, sighting.location, "avistamiento", `el avistamiento ${sighting.key}`),
            seenAt: hoursAgo(sighting.hoursAgo),
            status: sighting.status,
            witness: sighting.witness,
            notes: sighting.notes,
            reportedBy: owner._id,
        }))
    );
    const sightings = new Map(sightingsSeed.map((s, i) => [s.key, sightingDocs[i]]));

    // 7. Crímenes (solo en ubicaciones "crimen"; villano y avistamiento opcionales)
    const crimeDocs = await CrimeModel.create(
        crimesSeed.map((crime) => ({
            location: refOf(locations, crime.location, "crimen", `un crimen de tipo ${crime.type}`),
            type: crime.type,
            description: crime.description,
            occurredAt: hoursAgo(crime.hoursAgo),
            severity: crime.severity,
            status: crime.status,
            villain: crime.villain ? refOf(villains, crime.villain, null, "el villano del crimen") : null,
            sighting: crime.sighting ? refOf(sightings, crime.sighting, null, "el avistamiento del crimen") : null,
            reportedBy: owner._id,
        }))
    );

    console.log("");
    console.log("Seed completado:");
    console.log(`  Zonas:         ${zones.length}`);
    console.log(`  Ubicaciones:   ${locationDocs.length}`);
    console.log(`  Villanos:      ${villainDocs.length}`);
    console.log(`  Avistamientos: ${sightingDocs.length}`);
    console.log(`  Crímenes:      ${crimeDocs.length}`);
    console.log("");
    console.log("Usuario de prueba:");
    console.log(`  Correo:     ${usersSeed[0].email}`);
}

if (require.main === module) {
    run()
        .then(() => disconnectDatabase())
        .then(() => process.exit(0))
        .catch(async (error) => {
            console.error("Error en el seed:", error.message);
            try {
                await disconnectDatabase();
            } catch (_) {
                // la conexión ya estaba cerrada
            }
            process.exit(1);
        });
}

module.exports = run;