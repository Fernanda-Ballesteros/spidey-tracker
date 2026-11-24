"use strict";

const AppError = require("../utils/appError");
const {
    CRIME_TYPES,
    CRIME_SEVERITIES,
    CRIME_STATUSES,
} = require("../utils/constants");
const {
    isObjectId,
    unknownFields,
    toDate,
    isFutureDate,
    dateRangeErrors,
} = require("../utils/validation");

const ALLOWED_FIELDS = [
    "location",
    "type",
    "description",
    "occurredAt",
    "severity",
    "status",
    "villain",
    "sighting",
];
const REQUIRED_FIELDS = ["location", "type", "description", "occurredAt", "severity"];

function validateCrimePayload({ partial = false } = {}) {
    return function crimePayloadValidator(req, res, next) {
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

        if (body.location !== undefined && !isObjectId(body.location)) {
            errors.push("location debe ser el id de una ubicación.");
        }

        if (body.type !== undefined && !CRIME_TYPES.includes(body.type)) {
            errors.push(`El tipo debe ser uno de: ${CRIME_TYPES.join(", ")}.`);
        }

        if (body.description !== undefined) {
            if (
                typeof body.description !== "string" ||
                body.description.trim().length < 10 ||
                body.description.trim().length > 1000
            ) {
                errors.push("La descripción debe tener entre 10 y 1000 caracteres.");
            }
        }

        if (body.occurredAt !== undefined) {
            const occurredAt = toDate(body.occurredAt);
            if (!occurredAt) {
                errors.push("occurredAt debe ser una fecha y hora válidas (formato ISO).");
            } else if (isFutureDate(occurredAt)) {
                errors.push("occurredAt no puede estar en el futuro.");
            } else {
                req.body.occurredAt = occurredAt;
            }
        }

        if (body.severity !== undefined && !CRIME_SEVERITIES.includes(body.severity)) {
            errors.push(`La gravedad debe ser una de: ${CRIME_SEVERITIES.join(", ")}.`);
        }

        if (body.status !== undefined && !CRIME_STATUSES.includes(body.status)) {
            errors.push(`El estado debe ser uno de: ${CRIME_STATUSES.join(", ")}.`);
        }

        // villain y sighting son opcionales; null sirve para quitar la relación
        if (body.villain !== undefined && body.villain !== null && !isObjectId(body.villain)) {
            errors.push("villain debe ser el id de un villano (o null).");
        }

        if (body.sighting !== undefined && body.sighting !== null && !isObjectId(body.sighting)) {
            errors.push("sighting debe ser el id de un avistamiento (o null).");
        }

        const unknown = unknownFields(body, ALLOWED_FIELDS);
        if (unknown.length > 0) {
            errors.push(`Campos no permitidos: ${unknown.join(", ")}.`);
        }

        if (errors.length > 0) {
            return next(new AppError("La información del crimen no es válida.", 400, errors));
        }

        if (typeof req.body.description === "string") {
            req.body.description = req.body.description.trim();
        }

        next();
    };
}

// Filtros: ?search=&type=&severity=&status=&villain=&from=&to=
function validateCrimeQuery(req, res, next) {
    const { search, type, severity, status, villain, from, to } = req.query;
    const errors = [];

    if (search !== undefined && typeof search !== "string") {
        errors.push("El término de búsqueda debe ser texto.");
    }

    if (type !== undefined && type !== "all" && !CRIME_TYPES.includes(type)) {
        errors.push(`El tipo del filtro debe ser "all" o uno de: ${CRIME_TYPES.join(", ")}.`);
    }

    if (severity !== undefined && severity !== "all" && !CRIME_SEVERITIES.includes(severity)) {
        errors.push(`La gravedad del filtro debe ser "all" o una de: ${CRIME_SEVERITIES.join(", ")}.`);
    }

    if (status !== undefined && status !== "all" && !CRIME_STATUSES.includes(status)) {
        errors.push(`El estado del filtro debe ser "all" o uno de: ${CRIME_STATUSES.join(", ")}.`);
    }

    if (villain !== undefined && villain !== "all" && !isObjectId(villain)) {
        errors.push('El filtro villain debe ser "all" o el id de un villano.');
    }

    errors.push(...dateRangeErrors(from, to));

    if (errors.length > 0) {
        return next(new AppError("Los filtros enviados no son válidos.", 400, errors));
    }

    next();
}

module.exports = { validateCrimePayload, validateCrimeQuery };