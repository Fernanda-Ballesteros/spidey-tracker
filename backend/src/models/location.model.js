"use strict";

const mongoose = require("mongoose");
const schemaOptions = require("../utils/schemaOptions");
const { LOCATION_CATEGORIES } = require("../utils/constants");

const locationSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 3,
            maxlength: 80,
        },
        description: {
            type: String,
            required: true,
            trim: true,
            minlength: 10,
            maxlength: 500,
        },
        category: {
            type: String,
            required: true,
            enum: LOCATION_CATEGORIES,
        },
        // GeoJSON Point: SIEMPRE [longitud, latitud]
        point: {
            type: {
                type: String,
                enum: ["Point"],
                default: "Point",
                required: true,
            },
            coordinates: {
                type: [Number],
                required: true,
                validate: {
                    validator: (c) =>
                        c.length === 2 &&
                        c[0] >= -180 && c[0] <= 180 &&
                        c[1] >= -90 && c[1] <= 90,
                    message: "point.coordinates debe ser [longitud, latitud] válidos.",
                },
            },
        },
        // Relación por referencia: quién registró la ubicación
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    schemaOptions
);

locationSchema.index({ point: "2dsphere" });
locationSchema.index({ category: 1 });

module.exports = mongoose.model("Location", locationSchema);