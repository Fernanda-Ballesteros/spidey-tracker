"use strict";

const bcrypt = require("bcryptjs");
const UserModel = require("../models/user.model");
const AppError = require("../utils/appError");
const { signToken } = require("../utils/token");

const SALT_ROUNDS = 10;

class AuthService {
    async register({ name, email, password }) {
        const normalizedEmail = email.toLowerCase().trim();

        const existing = await UserModel.findOne({ email: normalizedEmail });
        if (existing) {
            throw new AppError("Ya existe una cuenta con ese correo.", 409);
        }

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        let user;
        try {
            user = await UserModel.create({
                name,
                email: normalizedEmail,
                password: hashedPassword,
            });
        } catch (error) {
            // 11000 = índice único violado (dos registros simultáneos con el mismo correo)
            if (error.code === 11000) {
                throw new AppError("Ya existe una cuenta con ese correo.", 409);
            }
            throw error;
        }

        return { user, token: signToken(user) };
    }

    async login({ email, password }) {
        // El password tiene select:false, por eso se pide explícitamente
        const user = await UserModel.findOne({
            email: email.toLowerCase().trim(),
        }).select("+password");

        // Mismo mensaje si el correo no existe o la contraseña falla:
        // así no se revela qué correos están registrados.
        const invalid = new AppError("Correo o contraseña incorrectos.", 401);
        if (!user) throw invalid;

        const matches = await bcrypt.compare(password, user.password);
        if (!matches) throw invalid;

        return { user, token: signToken(user) };
    }

    async getById(id) {
        const user = await UserModel.findById(id);
        if (!user) {
            throw new AppError("El usuario ya no existe.", 401);
        }
        return user;
    }
}

module.exports = AuthService;