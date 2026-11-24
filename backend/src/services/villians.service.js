"use strict";

const VillainModel = require("../models/villian.model");
const CrimeModel = require("../models/crime.model");
const LocationsService = require("./locations.service");
const AppError = require("../utils/appError");
const { escapeRegex } = require("../utils/validation");

const POPULATE = [
    { path: "knownLocations", select: "name category point" },
    { path: "createdBy", select: "name" },
];

const EDITABLE_FIELDS = [
    "name",
    "alias",
    "history",
    "powers",
    "threatLevel",
    "status",
    "knownLocations",
];

class VillainsService {
    constructor() {
        this.locationsService = new LocationsService();
    }

    // Filtros: ?search=(nombre o alias)&threatLevel=&status=
    async getAll(filters = {}) {
        const { search = "", threatLevel = "all", status = "all" } = filters;
        const query = {};

        if (search.trim()) {
            const regex = { $regex: escapeRegex(search.trim()), $options: "i" };
            query.$or = [{ name: regex }, { alias: regex }];
        }

        if (threatLevel !== "all") query.threatLevel = threatLevel;
        if (status !== "all") query.status = status;

        return VillainModel.find(query).populate(POPULATE).sort({ name: 1 });
    }

    async getById(id) {
        const villain = await VillainModel.findById(id).populate(POPULATE);
        if (!villain) {
            throw new AppError(`Villano no encontrado con id ${id}.`, 404);
        }
        return villain;
    }

    // Detalle: el villano + su historial de crímenes (se calcula, no se guarda dentro)
    async getDetail(id) {
        const villain = await this.getById(id);

        const crimes = await CrimeModel.find({ villain: id })
            .select("type severity status occurredAt")
            .sort({ occurredAt: -1 });

        return { ...villain.toJSON(), crimes: crimes.map((c) => c.toJSON()) };
    }

    async create(data, userId) {
        await this.assertHideouts(data.knownLocations);

        try {
            const villain = await VillainModel.create({
                name: data.name,
                alias: data.alias,
                history: data.history,
                powers: data.powers,
                threatLevel: data.threatLevel,
                status: data.status,
                knownLocations: data.knownLocations,
                createdBy: userId,
            });

            return await villain.populate(POPULATE);
        } catch (error) {
            throw this.translateError(error);
        }
    }

    async update(id, changes) {
        const villain = await this.findOrFail(id);

        if (changes.knownLocations !== undefined) {
            await this.assertHideouts(changes.knownLocations);
        }

        for (const field of EDITABLE_FIELDS) {
            if (changes[field] !== undefined) {
                villain[field] = changes[field];
            }
        }

        try {
            await villain.save();
            return await villain.populate(POPULATE);
        } catch (error) {
            throw this.translateError(error);
        }
    }

    async delete(id) {
        const villain = await this.findOrFail(id);

        // Los crímenes que lo mencionaban se conservan, pero sin villano asignado
        await CrimeModel.updateMany({ villain: id }, { $set: { villain: null } });

        await villain.deleteOne();
        return villain;
    }

    // Cada lugar donde se cree que se esconde debe existir y ser categoría "guarida"
    async assertHideouts(locationIds = []) {
        await Promise.all(
            locationIds.map((locationId) =>
                this.locationsService.assertCategory(locationId, "guarida")
            )
        );
    }

    translateError(error) {
        if (error.code === 11000) {
            return new AppError("Ya existe un villano con ese nombre.", 409);
        }
        return error;
    }

    async findOrFail(id) {
        const villain = await VillainModel.findById(id);
        if (!villain) {
            throw new AppError(`Villano no encontrado con id ${id}.`, 404);
        }
        return villain;
    }
}

module.exports = VillainsService;