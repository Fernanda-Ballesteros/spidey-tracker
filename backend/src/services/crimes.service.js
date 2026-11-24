"use strict";

const CrimeModel = require("../models/crime.model");
const VillainModel = require("../models/villian.model");
const SightingModel = require("../models/sighting.model");
const LocationsService = require("./locations.service");
const AppError = require("../utils/appError");
const { escapeRegex, dateRange } = require("../utils/validation");

const POPULATE = [
    { path: "location", select: "name category point" },
    { path: "villain", select: "name alias threatLevel" },
    { path: "sighting", select: "seenAt status" },
    { path: "reportedBy", select: "name" },
];

const EDITABLE_FIELDS = [
    "location",
    "type",
    "description",
    "occurredAt",
    "severity",
    "status",
    "villain",
    "sighting",
];

class CrimesService {
    constructor() {
        this.locationsService = new LocationsService();
    }

    // Filtros: ?search=&type=&severity=&status=&villain=&from=&to=
    async getAll(filters = {}) {
        const {
            search = "",
            type = "all",
            severity = "all",
            status = "all",
            villain = "all",
            from,
            to,
        } = filters;
        const query = {};

        if (search.trim()) {
            query.description = { $regex: escapeRegex(search.trim()), $options: "i" };
        }

        if (type !== "all") query.type = type;
        if (severity !== "all") query.severity = severity;
        if (status !== "all") query.status = status;
        if (villain !== "all") query.villain = villain;

        const range = dateRange(from, to);
        if (range) query.occurredAt = range;

        return CrimeModel.find(query).populate(POPULATE).sort({ occurredAt: -1 });
    }

    async getById(id) {
        const crime = await CrimeModel.findById(id).populate(POPULATE);
        if (!crime) {
            throw new AppError(`Crimen no encontrado con id ${id}.`, 404);
        }
        return crime;
    }

    async create(data, userId) {
        // Solo puede colgar de una ubicación de categoría "crimen"
        await this.locationsService.assertCategory(data.location, "crimen");
        await this.assertReferences(data);

        const crime = await CrimeModel.create({
            location: data.location,
            type: data.type,
            description: data.description,
            occurredAt: data.occurredAt,
            severity: data.severity,
            status: data.status,
            villain: data.villain ?? null,
            sighting: data.sighting ?? null,
            reportedBy: userId,
        });

        return crime.populate(POPULATE);
    }

    async update(id, changes) {
        const crime = await this.findOrFail(id);

        if (
            changes.location !== undefined &&
            String(changes.location) !== String(crime.location)
        ) {
            await this.locationsService.assertCategory(changes.location, "crimen");
        }
        await this.assertReferences(changes);

        for (const field of EDITABLE_FIELDS) {
            if (changes[field] !== undefined) {
                crime[field] = changes[field];
            }
        }

        await crime.save();
        return crime.populate(POPULATE);
    }

    async delete(id) {
        const crime = await this.findOrFail(id);
        await crime.deleteOne();
        return crime;
    }

    // Comprueba que el villano y el avistamiento indicados existan (si se enviaron)
    async assertReferences({ villain, sighting }) {
        if (villain) {
            if (!(await VillainModel.exists({ _id: villain }))) {
                throw new AppError("El villano indicado no existe.", 400);
            }
        }

        if (sighting) {
            if (!(await SightingModel.exists({ _id: sighting }))) {
                throw new AppError("El avistamiento indicado no existe.", 400);
            }
        }
    }

    async findOrFail(id) {
        const crime = await CrimeModel.findById(id);
        if (!crime) {
            throw new AppError(`Crimen no encontrado con id ${id}.`, 404);
        }
        return crime;
    }
}

module.exports = CrimesService;