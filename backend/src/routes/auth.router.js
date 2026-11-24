"use strict";

const express = require("express");
const AuthService = require("../services/auth.service");
const {
    validateRegister,
    validateLogin,
    requireAuth,
} = require("../middlewares/auth.validator");

const router = express.Router();
const authService = new AuthService();

// POST /api/auth/register
router.post("/register", validateRegister, async (req, res) => {
    const { user, token } = await authService.register(req.body);
    res.status(201).json({ user, token });
});

// POST /api/auth/login
router.post("/login", validateLogin, async (req, res) => {
    const { user, token } = await authService.login(req.body);
    res.status(200).json({ user, token });
});

// GET /api/auth/me  (ruta protegida: devuelve el usuario de la sesión)
router.get("/me", requireAuth, async (req, res) => {
    res.status(200).json({ user: req.user });
});

module.exports = router;