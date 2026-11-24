"use strict";

const AppError = require("../utils/appError");
const AuthService = require("../services/auth.service");
const { verifyToken } = require("../utils/token");

const authService = new AuthService();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REGISTER_FIELDS = ["name", "email", "password"];
const LOGIN_FIELDS = ["email", "password"];

function unknownFieldsOf(body, allowed) {
    return Object.keys(body).filter((field) => !allowed.includes(field));
}

// ---------- Validación del body ----------

function validateRegister(req, res, next) {
    const errors = [];
    const body = req.body || {};
    const { name, email, password } = body;

    if (typeof name !== "string" || name.trim().length < 2 || name.trim().length > 60) {
        errors.push("El nombre debe tener entre 2 y 60 caracteres.");
    }

    if (typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
        errors.push("El correo no tiene un formato válido.");
    }

    // bcrypt solo procesa los primeros 72 bytes, por eso el máximo
    if (typeof password !== "string" || password.length < 8 || password.length > 72) {
        errors.push("La contraseña debe tener entre 8 y 72 caracteres.");
    } else if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
        errors.push("La contraseña debe incluir al menos una letra y un número.");
    }

    const unknown = unknownFieldsOf(body, REGISTER_FIELDS);
    if (unknown.length > 0) {
        errors.push(`Campos no permitidos: ${unknown.join(", ")}`);
    }

    if (errors.length > 0) {
        return next(new AppError("Los datos de registro no son válidos.", 400, errors));
    }

    req.body.name = name.trim();
    req.body.email = email.trim().toLowerCase();
    next();
}

function validateLogin(req, res, next) {
    const errors = [];
    const body = req.body || {};
    const { email, password } = body;

    if (typeof email !== "string" || !email.trim()) {
        errors.push("El correo es obligatorio.");
    }

    if (typeof password !== "string" || !password) {
        errors.push("La contraseña es obligatoria.");
    }

    const unknown = unknownFieldsOf(body, LOGIN_FIELDS);
    if (unknown.length > 0) {
        errors.push(`Campos no permitidos: ${unknown.join(", ")}`);
    }

    if (errors.length > 0) {
        return next(new AppError("Los datos de inicio de sesión no son válidos.", 400, errors));
    }

    req.body.email = email.trim().toLowerCase();
    next();
}

// ---------- Protección de rutas ----------

// Exige un token válido: Authorization: Bearer <token>
// Si todo sale bien deja al usuario en req.user.
async function requireAuth(req, res, next) {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) {
        throw new AppError("Debes iniciar sesión para acceder a este recurso.", 401);
    }

    let payload;
    try {
        payload = verifyToken(token);
    } catch (error) {
        throw new AppError("Tu sesión no es válida o ya expiró.", 401);
    }

    // Verifica que el usuario siga existiendo en la base de datos
    req.user = await authService.getById(payload.sub);
    next();
}

// Se usa DESPUÉS de requireAuth: requireRole("admin")
function requireRole(...roles) {
    return function roleGuard(req, res, next) {
        if (!req.user || !roles.includes(req.user.role)) {
            return next(new AppError("No tienes permisos para realizar esta acción.", 403));
        }
        next();
    };
}

module.exports = {
    validateRegister,
    validateLogin,
    requireAuth,
    requireRole,
};