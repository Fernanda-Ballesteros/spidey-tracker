"use strict";

const ZoneModel = require("../models/zone.model");
const AppError = require("../utils/appError");
const { escapeRegex } = require("../utils/validation");

class ZonesService {
    async getAll(filters = {}) {
        const { search = "" } = filters;
        const query = {};

        if (search.trim()) {
            query.name = { $regex: escapeRegex(search.trim()), $options: "i" };
        }

        return ZoneModel.find(query)
            .populate("createdBy", "name")
            .sort({ name: 1 });
    }

    async getById(id) {
        const zone = await ZoneModel.findById(id).populate("createdBy", "name");
        if (!zone) {
            throw new AppError(`Zona no encontrada con id ${id}.`, 404);
        }
        return zone;
    }

    async create(data, userId) {
        try {
            const zone = await ZoneModel.create({
                name: data.name,
                description: data.description,
                riskLevel: data.riskLevel,
                area: { type: "Polygon", coordinates: data.area.coordinates },
                createdBy: userId,
            });
            return await zone.populate("createdBy", "name");
        } catch (error) {
            throw this.translateError(error);
        }
    }

    async update(id, changes) {
        const zone = await this.getById(id);

        for (const field of ["name", "description", "riskLevel"]) {
            if (changes[field] !== undefined) {
                zone[field] = changes[field];
            }
        }

        if (changes.area !== undefined) {
            zone.area = { type: "Polygon", coordinates: changes.area.coordinates };
        }

        try {
            await zone.save();
            return zone;
        } catch (error) {
            throw this.translateError(error);
        }
    }

    async delete(id) {
        const zone = await this.getById(id);
        await zone.deleteOne();
        return zone;
    }

    async getGeoJSON(filters = {}) {
        const zones = await this.getAll(filters);

        return {
            type: "FeatureCollection",
            features: zones.map((zone) => {
                const { area, ...properties } = zone.toJSON();
                return { type: "Feature", properties, geometry: area };
            }),
        };
    }

    // Convierte errores de MongoDB en errores HTTP claros
    translateError(error) {
        if (error.code === 11000) {
            return new AppError("Ya existe una zona con ese nombre.", 409);
        }

        // 16755 = "Can't extract geo keys": polígono con lados que se cruzan, etc.
        if (error.code === 16755) {
            return new AppError(
                "El polígono no es válido: los lados no deben cruzarse.",
                400
            );
        }

        return error;
    }
}

module.exports = ZonesService;