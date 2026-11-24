"use strict";

const SightingModel = require("../models/sighting.model");
const CrimeModel = require("../models/crime.model");
const LocationsService = require("./locations.service");
const AppError = require("../utils/appError");
const { escapeRegex, dateRange } = require("../utils/validation");

// Qué datos de las referencias se traen con populate (nada de repetir información)
const POPULATE = [
    { path: "location", select: "name category point" },
    { path: "reportedBy", select: "name" },
];

class SightingsService {
    constructor() {
        this.locationsService = new LocationsService();
    }

    // Filtros: ?search=&status=&location=&from=&to=
    async getAll(filters = {}) {
        const { search = "", status = "all", location = "all", from, to } = filters;
        const query = {};

        if (search.trim()) {
            const regex = { $regex: escapeRegex(search.trim()), $options: "i" };
            query.$or = [{ notes: regex }, { witness: regex }];
        }

        if (status !== "all") query.status = status;
        if (location !== "all") query.location = location;

        const range = dateRange(from, to);
        if (range) query.seenAt = range;

        return SightingModel.find(query).populate(POPULATE).sort({ seenAt: -1 });
    }

    async getById(id) {
        const sighting = await SightingModel.findById(id).populate(POPULATE);
        if (!sighting) {
            throw new AppError(`Avistamiento no encontrado con id ${id}.`, 404);
        }
        return sighting;
    }

    async create(data, userId) {
        // El avistamiento solo puede colgar de una ubicación de categoría "avistamiento"
        await this.locationsService.assertCategory(data.location, "avistamiento");

        const sighting = await SightingModel.create({
            location: data.location,
            seenAt: data.seenAt,
            status: data.status,
            witness: data.witness,
            notes: data.notes,
            reportedBy: userId,
        });

        return sighting.populate(POPULATE);
    }

    async update(id, changes) {
        const sighting = await this.findOrFail(id);

        if (
            changes.location !== undefined &&
            String(changes.location) !== String(sighting.location)
        ) {
            await this.locationsService.assertCategory(changes.location, "avistamiento");
        }

        for (const field of ["location", "seenAt", "status", "witness", "notes"]) {
            if (changes[field] !== undefined) {
                sighting[field] = changes[field];
            }
        }

        await sighting.save();
        return sighting.populate(POPULATE);
    }

    async delete(id) {
        const sighting = await this.findOrFail(id);

        // Los crímenes que lo mencionaban quedan sin avistamiento (no se borran)
        await CrimeModel.updateMany({ sighting: id }, { $set: { sighting: null } });

        await sighting.deleteOne();
        return sighting;
    }

    // Documento sin populate, para editar o borrar
    async findOrFail(id) {
        const sighting = await SightingModel.findById(id);
        if (!sighting) {
            throw new AppError(`Avistamiento no encontrado con id ${id}.`, 404);
        }
        return sighting;
    }
}

module.exports = SightingsService;