"use strict";

const express = require("express");
const LocationsService = require("../services/locations.service");
const { requireAuth } = require("../middlewares/auth.validator");
const { validateIdParam } = require("../middlewares/common.validator");
const {
    validateLocationPayload,
    validateLocationQuery,
} = require("../middlewares/locations.validator");

const router = express.Router();
const locationsService = new LocationsService();

// Todas las rutas de ubicaciones requieren sesión iniciada
router.use(requireAuth);

// GET /api/locations?search=&category=&zone=
router.get("/", validateLocationQuery, async (req, res) => {
    const locations = await locationsService.getAll(req.query);
    res.status(200).json(locations);
});

// GET /api/locations/geojson  (debe ir antes de /:id)
router.get("/geojson", validateLocationQuery, async (req, res) => {
    const geoJson = await locationsService.getGeoJSON(req.query);
    res.status(200).json(geoJson);
});

router.get("/:id", validateIdParam, async (req, res) => {
    const location = await locationsService.getDetail(req.params.id);
    res.status(200).json(location);
});

router.post("/", validateLocationPayload(), async (req, res) => {
    const location = await locationsService.create(req.body, req.user.id);
    res.status(201).json(location);
});

router.patch(
    "/:id",
    validateIdParam,
    validateLocationPayload({ partial: true }),
    async (req, res) => {
        const location = await locationsService.update(req.params.id, req.body);
        res.status(200).json(location);
    }
);

router.delete("/:id", validateIdParam, async (req, res) => {
    const result = await locationsService.delete(req.params.id);
    res.status(200).json(result);
});

module.exports = router;