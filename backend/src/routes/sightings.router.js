"use strict";

const express = require("express");
const SightingsService = require("../services/sightings.service");
const { requireAuth } = require("../middlewares/auth.validator");
const { validateIdParam } = require("../middlewares/common.validator");
const {
    validateSightingPayload,
    validateSightingQuery,
} = require("../middlewares/sightings.validator");

const router = express.Router();
const sightingsService = new SightingsService();

router.use(requireAuth);

// GET /api/sightings?search=&status=&location=&from=&to=
router.get("/", validateSightingQuery, async (req, res) => {
    const sightings = await sightingsService.getAll(req.query);
    res.status(200).json(sightings);
});

router.get("/:id", validateIdParam, async (req, res) => {
    const sighting = await sightingsService.getById(req.params.id);
    res.status(200).json(sighting);
});

router.post("/", validateSightingPayload(), async (req, res) => {
    const sighting = await sightingsService.create(req.body, req.user.id);
    res.status(201).json(sighting);
});

router.patch(
    "/:id",
    validateIdParam,
    validateSightingPayload({ partial: true }),
    async (req, res) => {
        const sighting = await sightingsService.update(req.params.id, req.body);
        res.status(200).json(sighting);
    }
);

router.delete("/:id", validateIdParam, async (req, res) => {
    const sighting = await sightingsService.delete(req.params.id);
    res.status(200).json(sighting);
});

module.exports = router;