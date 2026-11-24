"use strict";

const mongoose = require("mongoose");

const ROLES = ["user", "admin"];

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 60,
        },
        email: {
            type: String,
            required: true,
            unique: true, // crea un índice único: evita correos duplicados
            lowercase: true,
            trim: true,
        },
        // Aquí se guarda SIEMPRE el hash de bcrypt, nunca la contraseña real.
        // select:false hace que no salga en las consultas a menos que se pida.
        password: {
            type: String,
            required: true,
            select: false,
        },
        role: {
            type: String,
            enum: ROLES,
            default: "user",
        },
    },
    {
        timestamps: true,
        toJSON: {
            versionKey: false,
            transform: (doc, ret) => {
                ret.id = ret._id.toString();
                delete ret._id;
                delete ret.password; // seguridad extra: nunca se serializa
                return ret;
            },
        },
    }
);

const UserModel = mongoose.model("User", userSchema);

module.exports = UserModel;
module.exports.ROLES = ROLES;