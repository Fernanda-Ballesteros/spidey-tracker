"use strict";

const mongoose = require("mongoose");
const schemaOptions = require("../utils/schemaOptions");
const { RISK_LEVELS } = require("../utils/constants");

const zoneSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            minlength: 3,
            maxlength: 80,
        },
        description: {
            type: String,
            trim: true,
            maxlength: 500,
            default: "",
        },
        riskLevel: {
            type: String,
            enum: RISK_LEVELS,
            default: "medio",
        },
        // GeoJSON Polygon: [ [ [lng, lat], [lng, lat], ..., primer punto otra vez ] ]
        area: {
            type: {
                type: String,
                enum: ["Polygon"],
                default: "Polygon",
                required: true,
            },
            coordinates: {
                type: [[[Number]]],
                required: true,
            },
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    schemaOptions
);

zoneSchema.index({ area: "2dsphere" });

module.exports = mongoose.model("Zone", zoneSchema);