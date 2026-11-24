"use strict";

const AppError = require("../utils/appError");
const { THREAT_LEVELS, VILLAIN_STATUSES } = require("../utils/constants");
const { isObjectId, unknownFields } = require("../utils/validation");

const ALLOWED_FIELDS = [
    "name",
    "alias",
    "history",
    "powers",
    "threatLevel",
    "status",
    "knownLocations",
];
const REQUIRED_FIELDS = ["name", "history", "threatLevel"];

const MAX_POWERS = 15;
const MAX_KNOWN_LOCATIONS = 20;

function validateVillainPayload({ partial = false } = {}) {
    return function villainPayloadValidator(req, res, next) {
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
            if (typeof body.name !== "string" || body.name.trim().length < 2 || body.name.trim().length > 80) {
                errors.push("El nombre debe tener entre 2 y 80 caracteres.");
            }
        }

        if (body.alias !== undefined) {
            if (typeof body.alias !== "string" || body.alias.trim().length > 80) {
                errors.push("El alias debe ser texto de máximo 80 caracteres.");
            }
        }

        if (body.history !== undefined) {
            if (
                typeof body.history !== "string" ||
                body.history.trim().length < 10 ||
                body.history.trim().length > 2500
            ) {
                errors.push("El historial debe tener entre 10 y 2500 caracteres.");
            }
        }

        if (body.powers !== undefined) {
            const validPowers =
                Array.isArray(body.powers) &&
                body.powers.length <= MAX_POWERS &&
                body.powers.every(
                    (p) => typeof p === "string" && p.trim().length >= 1 && p.trim().length <= 40
                );

            if (!validPowers) {
                errors.push(
                    `powers debe ser una lista de máximo ${MAX_POWERS} textos de 1 a 40 caracteres.`
                );
            } else {
                req.body.powers = [...new Set(body.powers.map((p) => p.trim()))];
            }
        }

        if (body.threatLevel !== undefined && !THREAT_LEVELS.includes(body.threatLevel)) {
            errors.push(`El nivel de amenaza debe ser uno de: ${THREAT_LEVELS.join(", ")}.`);
        }

        if (body.status !== undefined && !VILLAIN_STATUSES.includes(body.status)) {
            errors.push(`El estado debe ser uno de: ${VILLAIN_STATUSES.join(", ")}.`);
        }

        if (body.knownLocations !== undefined) {
            const validLocations =
                Array.isArray(body.knownLocations) &&
                body.knownLocations.length <= MAX_KNOWN_LOCATIONS &&
                body.knownLocations.every(isObjectId);

            if (!validLocations) {
                errors.push(
                    `knownLocations debe ser una lista de máximo ${MAX_KNOWN_LOCATIONS} ids de ubicaciones.`
                );
            } else {
                // Sin repetidos
                req.body.knownLocations = [...new Set(body.knownLocations)];
            }
        }

        const unknown = unknownFields(body, ALLOWED_FIELDS);
        if (unknown.length > 0) {
            errors.push(`Campos no permitidos: ${unknown.join(", ")}.`);
        }

        if (errors.length > 0) {
            return next(new AppError("La información del villano no es válida.", 400, errors));
        }

        if (typeof req.body.name === "string") req.body.name = req.body.name.trim();
        if (typeof req.body.alias === "string") req.body.alias = req.body.alias.trim();
        if (typeof req.body.history === "string") req.body.history = req.body.history.trim();

        next();
    };
}

// Filtros: ?search=&threatLevel=&status=
function validateVillainQuery(req, res, next) {
    const { search, threatLevel, status } = req.query;
    const errors = [];

    if (search !== undefined && typeof search !== "string") {
        errors.push("El término de búsqueda debe ser texto.");
    }

    if (threatLevel !== undefined && threatLevel !== "all" && !THREAT_LEVELS.includes(threatLevel)) {
        errors.push(`El nivel de amenaza del filtro debe ser "all" o uno de: ${THREAT_LEVELS.join(", ")}.`);
    }

    if (status !== undefined && status !== "all" && !VILLAIN_STATUSES.includes(status)) {
        errors.push(`El estado del filtro debe ser "all" o uno de: ${VILLAIN_STATUSES.join(", ")}.`);
    }

    if (errors.length > 0) {
        return next(new AppError("Los filtros enviados no son válidos.", 400, errors));
    }

    next();
}

module.exports = { validateVillainPayload, validateVillainQuery };