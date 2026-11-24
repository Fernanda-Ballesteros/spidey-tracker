"use strict";

const mongoose = require("mongoose");
const schemaOptions = require("../utils/schemaOptions");
const { THREAT_LEVELS, VILLAIN_STATUSES } = require("../utils/constants");

const villainSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            minlength: 2,
            maxlength: 80,
        },
        alias: {
            type: String,
            trim: true,
            maxlength: 80,
            default: "",
        },
        // Historial del villano
        history: {
            type: String,
            required: true,
            trim: true,
            minlength: 10,
            maxlength: 2500,
        },
        powers: {
            type: [String],
            default: [],
        },
        threatLevel: {
            type: String,
            required: true,
            enum: THREAT_LEVELS,
        },
        status: {
            type: String,
            enum: VILLAIN_STATUSES,
            default: "activo",
        },
        // Lugares donde se cree que se esconde: referencias a Location (categoría "guarida")
        knownLocations: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Location",
            },
        ],
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    schemaOptions
);

module.exports = mongoose.model("Villain", villainSchema);