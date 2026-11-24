"use strict";

const AppError = require("../utils/appError");
const { SIGHTING_STATUSES } = require("../utils/constants");
const {
    isObjectId,
    unknownFields,
    toDate,
    isFutureDate,
    dateRangeErrors,
} = require("../utils/validation");

const ALLOWED_FIELDS = ["location", "seenAt", "status", "witness", "notes"];
const REQUIRED_FIELDS = ["location", "seenAt", "notes"];

function validateSightingPayload({ partial = false } = {}) {
    return function sightingPayloadValidator(req, res, next) {
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

        if (body.seenAt !== undefined) {
            const seenAt = toDate(body.seenAt);
            if (!seenAt) {
                errors.push("seenAt debe ser una fecha y hora válidas (formato ISO).");
            } else if (isFutureDate(seenAt)) {
                errors.push("seenAt no puede estar en el futuro.");
            } else {
                req.body.seenAt = seenAt;
            }
        }

        if (body.status !== undefined && !SIGHTING_STATUSES.includes(body.status)) {
            errors.push(`El estado debe ser uno de: ${SIGHTING_STATUSES.join(", ")}.`);
        }

        if (body.witness !== undefined) {
            if (typeof body.witness !== "string" || body.witness.trim().length > 80) {
                errors.push("El testigo debe ser texto de máximo 80 caracteres.");
            }
        }

        if (body.notes !== undefined) {
            if (
                typeof body.notes !== "string" ||
                body.notes.trim().length < 5 ||
                body.notes.trim().length > 1000
            ) {
                errors.push("Las notas deben tener entre 5 y 1000 caracteres.");
            }
        }

        const unknown = unknownFields(body, ALLOWED_FIELDS);
        if (unknown.length > 0) {
            errors.push(`Campos no permitidos: ${unknown.join(", ")}.`);
        }

        if (errors.length > 0) {
            return next(new AppError("La información del avistamiento no es válida.", 400, errors));
        }

        if (typeof req.body.witness === "string") req.body.witness = req.body.witness.trim();
        if (typeof req.body.notes === "string") req.body.notes = req.body.notes.trim();

        next();
    };
}

// Filtros: ?search=&status=&location=&from=&to=
function validateSightingQuery(req, res, next) {
    const { search, status, location, from, to } = req.query;
    const errors = [];

    if (search !== undefined && typeof search !== "string") {
        errors.push("El término de búsqueda debe ser texto.");
    }

    if (status !== undefined && status !== "all" && !SIGHTING_STATUSES.includes(status)) {
        errors.push(`El estado del filtro debe ser "all" o uno de: ${SIGHTING_STATUSES.join(", ")}.`);
    }

    if (location !== undefined && location !== "all" && !isObjectId(location)) {
        errors.push('El filtro location debe ser "all" o el id de una ubicación.');
    }

    errors.push(...dateRangeErrors(from, to));

    if (errors.length > 0) {
        return next(new AppError("Los filtros enviados no son válidos.", 400, errors));
    }

    next();
}

module.exports = { validateSightingPayload, validateSightingQuery };