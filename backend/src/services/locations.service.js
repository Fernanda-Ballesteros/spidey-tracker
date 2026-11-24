"use strict";

const LocationModel = require("../models/location.model");
const ZoneModel = require("../models/zone.model");
const SightingModel = require("../models/sighting.model");
const CrimeModel = require("../models/crime.model");
const VillainModel = require("../models/villian.model");
const AppError = require("../utils/appError");
const { escapeRegex } = require("../utils/validation");

class LocationsService {
    // Filtros: ?search=(nombre parcial)&category=&zone=(id de zona)
    async getAll(filters = {}) {
        const { search = "", category = "all", zone = "all" } = filters;
        const query = {};

        if (search.trim()) {
            query.name = { $regex: escapeRegex(search.trim()), $options: "i" };
        }

        if (category !== "all") {
            query.category = category;
        }

        // Filtro geográfico: solo las ubicaciones que caen dentro del polígono de la zona
        if (zone !== "all") {
            const zoneDoc = await ZoneModel.findById(zone);
            if (!zoneDoc) {
                throw new AppError("La zona del filtro no existe.", 400);
            }
            query.point = { $geoWithin: { $geometry: zoneDoc.toObject().area } };
        }

        return LocationModel.find(query)
            .populate("createdBy", "name")
            .sort({ createdAt: -1 });
    }

    async getById(id) {
        const location = await LocationModel.findById(id).populate("createdBy", "name");
        if (!location) {
            throw new AppError(`Ubicación no encontrada con id ${id}.`, 404);
        }
        return location;
    }

    // Detalle: la ubicación + las zonas donde cae (se calcula, no se guarda)
    async getDetail(id) {
        const location = await this.getById(id);

        const zones = await ZoneModel.find({
            area: { $geoIntersects: { $geometry: location.toObject().point } },
        }).select("name riskLevel");

        return { ...location.toJSON(), zones: zones.map((z) => z.toJSON()) };
    }

    async create(data, userId) {
        const location = await LocationModel.create({
            name: data.name,
            description: data.description,
            category: data.category,
            point: { type: "Point", coordinates: [data.longitude, data.latitude] },
            createdBy: userId,
        });

        return location.populate("createdBy", "name");
    }

    async update(id, changes) {
        const location = await this.getById(id);

        // Cambiar la categoría con registros asociados dejaría datos incoherentes
        // (por ejemplo, un avistamiento apuntando a una ubicación "crimen")
        if (changes.category !== undefined && changes.category !== location.category) {
            if (await this.hasRecords(id)) {
                throw new AppError(
                    "No se puede cambiar la categoría: la ubicación ya tiene avistamientos, crímenes o villanos asociados.",
                    409
                );
            }
        }

        for (const field of ["name", "description", "category"]) {
            if (changes[field] !== undefined) {
                location[field] = changes[field];
            }
        }

        if (changes.longitude !== undefined || changes.latitude !== undefined) {
            const [currentLng, currentLat] = location.point.coordinates;
            location.point = {
                type: "Point",
                coordinates: [
                    changes.longitude ?? currentLng,
                    changes.latitude ?? currentLat,
                ],
            };
        }

        await location.save();
        return location;
    }

    // Al eliminar una ubicación se limpian los registros que dependen de ella,
    // para no dejar referencias rotas.
    async delete(id) {
        const location = await this.getById(id);

        const sightings = await SightingModel.find({ location: id }).select("_id");
        const sightingIds = sightings.map((s) => s._id);

        // Crímenes de OTRAS ubicaciones que apuntaban a estos avistamientos
        await CrimeModel.updateMany(
            { sighting: { $in: sightingIds } },
            { $set: { sighting: null } }
        );

        const removedSightings = await SightingModel.deleteMany({ location: id });
        const removedCrimes = await CrimeModel.deleteMany({ location: id });

        // Villanos que la tenían como guarida conocida
        await VillainModel.updateMany(
            { knownLocations: id },
            { $pull: { knownLocations: id } }
        );

        await location.deleteOne();

        return {
            location,
            removed: {
                sightings: removedSightings.deletedCount,
                crimes: removedCrimes.deletedCount,
            },
        };
    }

    async getGeoJSON(filters = {}) {
        const locations = await this.getAll(filters);

        return {
            type: "FeatureCollection",
            features: locations.map((location) => {
                const { point, ...properties } = location.toJSON();
                return { type: "Feature", properties, geometry: point };
            }),
        };
    }

    // ¿Tiene avistamientos, crímenes o villanos que dependan de ella?
    async hasRecords(id) {
        const [sighting, crime, villain] = await Promise.all([
            SightingModel.exists({ location: id }),
            CrimeModel.exists({ location: id }),
            VillainModel.exists({ knownLocations: id }),
        ]);
        return Boolean(sighting || crime || villain);
    }

    // Lo usan Sightings, Crimes y Villains para comprobar que la ubicación
    // existe y es de la categoría correcta.
    async assertCategory(id, category) {
        const location = await LocationModel.findById(id);

        if (!location) {
            throw new AppError("La ubicación indicada no existe.", 400);
        }

        if (location.category !== category) {
            throw new AppError(
                `La ubicación indicada debe ser de categoría "${category}" (es "${location.category}").`,
                400
            );
        }

        return location;
    }
}

module.exports = LocationsService;