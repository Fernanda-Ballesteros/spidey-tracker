"use strict";

const AppError = require("../utils/appError");
const { RISK_LEVELS } = require("../utils/constants");
const { unknownFields } = require("../utils/validation");

const ALLOWED_FIELDS = ["name", "description", "riskLevel", "area"];
const REQUIRED_FIELDS = ["name", "area"];
const MAX_VERTICES = 500;

// Revisa que "area" sea un GeoJSON Polygon bien formado: [ [ [lng, lat], ... ] ]
function polygonErrors(area) {
    if (!area || typeof area !== "object" || Array.isArray(area)) {
        return ["El campo area debe ser un objeto GeoJSON."];
    }

    if (area.type !== "Polygon") {
        return ['area.type debe ser "Polygon".'];
    }

    const rings = area.coordinates;
    if (!Array.isArray(rings) || rings.length === 0) {
        return ["area.coordinates debe contener al menos un anillo de puntos."];
    }

    const errors = [];

    rings.forEach((ring, index) => {
        if (!Array.isArray(ring) || ring.length < 4) {
            errors.push(`El anillo ${index} necesita al menos 4 puntos (el último igual al primero).`);
            return;
        }

        if (ring.length > MAX_VERTICES) {
            errors.push(`El anillo ${index} no puede tener más de ${MAX_VERTICES} puntos.`);
            return;
        }

        const invalidPoint = ring.some(
            (p) =>
                !Array.isArray(p) ||
                p.length !== 2 ||
                !Number.isFinite(p[0]) ||
                !Number.isFinite(p[1]) ||
                Math.abs(p[0]) > 180 ||
                Math.abs(p[1]) > 90
        );
        if (invalidPoint) {
            errors.push(`El anillo ${index} tiene puntos inválidos. Usa [longitud, latitud].`);
            return;
        }

        const first = ring[0];
        const last = ring[ring.length - 1];
        if (first[0] !== last[0] || first[1] !== last[1]) {
            errors.push(`El anillo ${index} debe cerrarse: el último punto debe ser igual al primero.`);
        }
    });

    return errors;
}

function validateZonePayload({ partial = false } = {}) {
    return function zonePayloadValidator(req, res, next) {
        const errors = [];
        const body = req.body || {};

        const provided = ALLOWED_FIELDS.filter((f) => body[f] !== undefined);

        if (partial && provided.length === 0) {
            errors.push("Debes proporcionar al menos un campo para actualizar.");
        }

        if (!partial) {
            REQUIRED_FIELDS.forEach((field) => {
                if (body[field] === undefined || body[field] === null || body[field] === "") {
                    errors.push(`El campo "${field}" es obligatorio.`);
                }
            });
        }

        if (body.name !== undefined) {
            if (typeof body.name !== "string" || body.name.trim().length < 3 || body.name.trim().length > 80) {
                errors.push("El nombre de la zona debe tener entre 3 y 80 caracteres.");
            }
        }

        if (body.description !== undefined) {
            if (typeof body.description !== "string" || body.description.trim().length > 500) {
                errors.push("La descripción no puede superar 500 caracteres.");
            }
        }

        if (body.riskLevel !== undefined && !RISK_LEVELS.includes(body.riskLevel)) {
            errors.push(`El nivel de riesgo debe ser uno de: ${RISK_LEVELS.join(", ")}.`);
        }

        if (body.area !== undefined) {
            errors.push(...polygonErrors(body.area));
        }

        const unknown = unknownFields(body, ALLOWED_FIELDS);
        if (unknown.length > 0) {
            errors.push(`Campos no permitidos: ${unknown.join(", ")}.`);
        }

        if (errors.length > 0) {
            return next(new AppError("La información de la zona no es válida.", 400, errors));
        }

        if (typeof req.body.name === "string") req.body.name = req.body.name.trim();
        if (typeof req.body.description === "string") req.body.description = req.body.description.trim();

        next();
    };
}

function validateZoneQuery(req, res, next) {
    const { search } = req.query;

    if (search !== undefined && typeof search !== "string") {
        return next(
            new AppError("Los filtros enviados no son válidos.", 400, [
                "El término de búsqueda debe ser texto.",
            ])
        );
    }

    next();
}

module.exports = { validateZonePayload, validateZoneQuery };