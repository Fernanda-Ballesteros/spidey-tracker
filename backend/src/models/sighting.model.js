"use strict";

const mongoose = require("mongoose");
const schemaOptions = require("../utils/schemaOptions");
const { SIGHTING_STATUSES } = require("../utils/constants");

const sightingSchema = new mongoose.Schema(
    {
        // El dónde vive en Location (coordenadas, nombre, categoría). Aquí no se repite.
        location: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Location",
            required: true,
        },
        seenAt: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
            enum: SIGHTING_STATUSES,
            default: "por-verificar",
        },
        witness: {
            type: String,
            trim: true,
            maxlength: 80,
            default: "",
        },
        notes: {
            type: String,
            required: true,
            trim: true,
            minlength: 5,
            maxlength: 1000,
        },
        reportedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    schemaOptions
);

sightingSchema.index({ seenAt: -1 });
sightingSchema.index({ location: 1 });

module.exports = mongoose.model("Sighting", sightingSchema);