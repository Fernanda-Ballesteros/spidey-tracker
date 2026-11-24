"use strict";

// Funciones pequeñas que reutilizan todos los validadores y servicios.

const OBJECT_ID_REGEX = /^[a-f\d]{24}$/i;
const ISO_DATE_REGEX =
    /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})?)?$/;
const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

// Margen de 5 minutos por si el reloj del navegador va adelantado
const FUTURE_TOLERANCE_MS = 5 * 60 * 1000;

function isObjectId(value) {
    return typeof value === "string" && OBJECT_ID_REGEX.test(value);
}

// Campos del body que no están en la lista permitida
function unknownFields(body, allowed) {
    return Object.keys(body).filter((field) => !allowed.includes(field));
}

// Convierte a número solo si viene como número o como texto con contenido.
// Number("") y Number(null) darían 0, por eso no se usa Number() directo.
function toNumber(value) {
    if (typeof value === "number") return value;
    if (typeof value === "string" && value.trim() !== "") return Number(value);
    return NaN;
}

// Escapa los caracteres especiales para usar texto del usuario dentro de un regex
function escapeRegex(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Convierte un texto ISO ("2026-11-23" o "2026-11-23T18:30:00Z") en Date.
// Devuelve null si no es una fecha real (por ejemplo 2026-02-31).
function toDate(value) {
    if (typeof value !== "string") return null;

    const text = value.trim();
    if (!ISO_DATE_REGEX.test(text)) return null;

    // JavaScript "corrige" el 31 de febrero a marzo; aquí se rechaza
    const [year, month, day] = text.slice(0, 10).split("-").map(Number);
    const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
    if (month < 1 || month > 12 || day < 1 || day > daysInMonth) return null;

    const date = new Date(text);
    return Number.isNaN(date.getTime()) ? null : date;
}

function isFutureDate(date) {
    return date.getTime() > Date.now() + FUTURE_TOLERANCE_MS;
}

// Errores de los filtros ?from=&to= (ambos opcionales)
function dateRangeErrors(from, to) {
    const errors = [];
    const fromDate = from === undefined ? null : toDate(from);
    const toDateValue = to === undefined ? null : toDate(to);

    if (from !== undefined && !fromDate) {
        errors.push("El filtro from debe ser una fecha válida (AAAA-MM-DD).");
    }
    if (to !== undefined && !toDateValue) {
        errors.push("El filtro to debe ser una fecha válida (AAAA-MM-DD).");
    }
    if (fromDate && toDateValue && fromDate > toDateValue) {
        errors.push("El filtro from no puede ser posterior a to.");
    }

    return errors;
}

// Arma el rango { $gte, $lte } para Mongo. Si "to" es solo fecha,
// se incluye todo ese día. Devuelve null si no hay rango.
function dateRange(from, to) {
    const range = {};

    if (from) {
        range.$gte = toDate(from);
    }

    if (to) {
        const end = toDate(to);
        if (DATE_ONLY_REGEX.test(to.trim())) {
            end.setUTCHours(23, 59, 59, 999);
        }
        range.$lte = end;
    }

    return Object.keys(range).length > 0 ? range : null;
}

module.exports = {
    isObjectId,
    unknownFields,
    toNumber,
    escapeRegex,
    toDate,
    isFutureDate,
    dateRangeErrors,
    dateRange,
};