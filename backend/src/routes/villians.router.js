"use strict";

const express = require("express");
const VillainsService = require("../services/villians.service");
const { requireAuth } = require("../middlewares/auth.validator");
const { validateIdParam } = require("../middlewares/common.validator");
const {
    validateVillainPayload,
    validateVillainQuery,
} = require("../middlewares/villanins.validator");

const router = express.Router();
const villainsService = new VillainsService();

router.use(requireAuth);

// GET /api/villains?search=&threatLevel=&status=
router.get("/", validateVillainQuery, async (req, res) => {
    const villains = await villainsService.getAll(req.query);
    res.status(200).json(villains);
});

// Detalle: incluye su historial de crímenes
router.get("/:id", validateIdParam, async (req, res) => {
    const villain = await villainsService.getDetail(req.params.id);
    res.status(200).json(villain);
});

router.post("/", validateVillainPayload(), async (req, res) => {
    const villain = await villainsService.create(req.body, req.user.id);
    res.status(201).json(villain);
});

router.patch(
    "/:id",
    validateIdParam,
    validateVillainPayload({ partial: true }),
    async (req, res) => {
        const villain = await villainsService.update(req.params.id, req.body);
        res.status(200).json(villain);
    }
);

router.delete("/:id", validateIdParam, async (req, res) => {
    const villain = await villainsService.delete(req.params.id);
    res.status(200).json(villain);
});

module.exports = router;