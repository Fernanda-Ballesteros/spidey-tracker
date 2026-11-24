"use strict";

const mongoose = require("mongoose");
const schemaOptions = require("../utils/schemaOptions");
const {
    CRIME_TYPES,
    CRIME_SEVERITIES,
    CRIME_STATUSES,
} = require("../utils/constants");

const crimeSchema = new mongoose.Schema(
    {
        // El dónde vive en Location. Aquí no se repiten coordenadas.
        location: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Location",
            required: true,
        },
        type: {
            type: String,
            required: true,
            enum: CRIME_TYPES,
        },
        description: {
            type: String,
            required: true,
            trim: true,
            minlength: 10,
            maxlength: 1000,
        },
        occurredAt: {
            type: Date,
            required: true,
        },
        severity: {
            type: String,
            required: true,
            enum: CRIME_SEVERITIES,
        },
        status: {
            type: String,
            enum: CRIME_STATUSES,
            default: "reportado",
        },
        // Opcional: villano responsable (solo el ObjectId, sin copiar su nombre)
        villain: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Villain",
            default: null,
        },
        // Opcional: avistamiento de Spider-Man relacionado con este crimen
        sighting: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Sighting",
            default: null,
        },
        reportedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    schemaOptions
);

crimeSchema.index({ occurredAt: -1 });
crimeSchema.index({ location: 1 });
crimeSchema.index({ villain: 1 });

module.exports = mongoose.model("Crime", crimeSchema);