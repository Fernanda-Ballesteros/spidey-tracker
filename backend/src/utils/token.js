"use strict";

const jwt = require("jsonwebtoken");

function getSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("Falta la variable JWT_SECRET en las variables de entorno.");
    }
    return secret;
}

// Genera el token que el frontend guardará después del login
function signToken(user) {
    return jwt.sign(
        { sub: user.id, role: user.role },
        getSecret(),
        { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
    );
}

// Lanza un error si el token es falso, está alterado o ya expiró
function verifyToken(token) {
    return jwt.verify(token, getSecret());
}

module.exports = { signToken, verifyToken };