"use strict";

const express = require("express");
const ZonesService = require("../services/zones.service");
const { requireAuth } = require("../middlewares/auth.validator");
const { validateIdParam } = require("../middlewares/common.validator");
const {
    validateZonePayload,
    validateZoneQuery,
} = require("../middlewares/zones.validator");

const router = express.Router();
const zonesService = new ZonesService();

router.use(requireAuth);

// GET /api/zones?search=
router.get("/", validateZoneQuery, async (req, res) => {
    const zones = await zonesService.getAll(req.query);
    res.status(200).json(zones);
});

// GET /api/zones/geojson  (debe ir antes de /:id)
router.get("/geojson", validateZoneQuery, async (req, res) => {
    const geoJson = await zonesService.getGeoJSON(req.query);
    res.status(200).json(geoJson);
});

router.get("/:id", validateIdParam, async (req, res) => {
    const zone = await zonesService.getById(req.params.id);
    res.status(200).json(zone);
});

router.post("/", validateZonePayload(), async (req, res) => {
    const zone = await zonesService.create(req.body, req.user.id);
    res.status(201).json(zone);
});

router.patch(
    "/:id",
    validateIdParam,
    validateZonePayload({ partial: true }),
    async (req, res) => {
        const zone = await zonesService.update(req.params.id, req.body);
        res.status(200).json(zone);
    }
);

router.delete("/:id", validateIdParam, async (req, res) => {
    const zone = await zonesService.delete(req.params.id);
    res.status(200).json(zone);
});

module.exports = router;