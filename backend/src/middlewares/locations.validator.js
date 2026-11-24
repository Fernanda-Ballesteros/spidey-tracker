"use strict";

const AppError = require("../utils/appError");
const { LOCATION_CATEGORIES } = require("../utils/constants");
const { isObjectId, unknownFields, toNumber } = require("../utils/validation");

const ALLOWED_FIELDS = [
    "name",
    "description",
    "category",
    "latitude",
    "longitude",
];

// Validación del body para POST (completo) y PATCH ({ partial: true })
function validateLocationPayload({ partial = false } = {}) {
    return function locationPayloadValidator(req, res, next) {
        const errors = [];
        const body = req.body || {};

        const provided = ALLOWED_FIELDS.filter((f) => body[f] !== undefined);

        if (partial && provided.length === 0) {
            errors.push("Debes proporcionar al menos un campo para actualizar.");
        }

        if (!partial) {
            ALLOWED_FIELDS.forEach((field) => {
                if (body[field] === undefined || body[field] === null || body[field] === "") {
                    errors.push(`El campo "${field}" es obligatorio.`);
                }
            });
        }

        if (body.name !== undefined) {
            if (typeof body.name !== "string" || body.name.trim().length < 3 || body.name.trim().length > 80) {
                errors.push("El nombre debe tener entre 3 y 80 caracteres.");
            }
        }

        if (body.description !== undefined) {
            if (
                typeof body.description !== "string" ||
                body.description.trim().length < 10 ||
                body.description.trim().length > 500
            ) {
                errors.push("La descripción debe tener entre 10 y 500 caracteres.");
            }
        }

        if (body.category !== undefined && !LOCATION_CATEGORIES.includes(body.category)) {
            errors.push(`La categoría debe ser una de: ${LOCATION_CATEGORIES.join(", ")}.`);
        }

        if (body.latitude !== undefined) {
            const latitude = toNumber(body.latitude);
            if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
                errors.push("La latitud debe ser un número entre -90 y 90.");
            } else {
                req.body.latitude = latitude;
            }
        }

        if (body.longitude !== undefined) {
            const longitude = toNumber(body.longitude);
            if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
                errors.push("La longitud debe ser un número entre -180 y 180.");
            } else {
                req.body.longitude = longitude;
            }
        }

        const unknown = unknownFields(body, ALLOWED_FIELDS);
        if (unknown.length > 0) {
            errors.push(`Campos no permitidos: ${unknown.join(", ")}.`);
        }

        if (errors.length > 0) {
            return next(new AppError("La información de la ubicación no es válida.", 400, errors));
        }

        if (typeof req.body.name === "string") req.body.name = req.body.name.trim();
        if (typeof req.body.description === "string") req.body.description = req.body.description.trim();

        next();
    };
}

// Validación de los filtros: ?search=&category=&zone=
function validateLocationQuery(req, res, next) {
    const { search, category, zone } = req.query;
    const errors = [];

    if (search !== undefined && typeof search !== "string") {
        errors.push("El término de búsqueda debe ser texto.");
    }

    if (
        category !== undefined &&
        category !== "all" &&
        !LOCATION_CATEGORIES.includes(category)
    ) {
        errors.push(`La categoría del filtro debe ser "all" o una de: ${LOCATION_CATEGORIES.join(", ")}.`);
    }

    if (zone !== undefined && zone !== "all" && !isObjectId(zone)) {
        errors.push('El filtro de zona debe ser "all" o el id de una zona.');
    }

    if (errors.length > 0) {
        return next(new AppError("Los filtros enviados no son válidos.", 400, errors));
    }

    next();
}

module.exports = { validateLocationPayload, validateLocationQuery };