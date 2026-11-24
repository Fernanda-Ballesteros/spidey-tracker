"use strict";

const express = require("express");
const CrimesService = require("../services/crimes.service");
const { requireAuth } = require("../middlewares/auth.validator");
const { validateIdParam } = require("../middlewares/common.validator");
const {
    validateCrimePayload,
    validateCrimeQuery,
} = require("../middlewares/crimes.validator");

const router = express.Router();
const crimesService = new CrimesService();

router.use(requireAuth);

// GET /api/crimes?search=&type=&severity=&status=&villain=&from=&to=
router.get("/", validateCrimeQuery, async (req, res) => {
    const crimes = await crimesService.getAll(req.query);
    res.status(200).json(crimes);
});

router.get("/:id", validateIdParam, async (req, res) => {
    const crime = await crimesService.getById(req.params.id);
    res.status(200).json(crime);
});

router.post("/", validateCrimePayload(), async (req, res) => {
    const crime = await crimesService.create(req.body, req.user.id);
    res.status(201).json(crime);
});

router.patch(
    "/:id",
    validateIdParam,
    validateCrimePayload({ partial: true }),
    async (req, res) => {
        const crime = await crimesService.update(req.params.id, req.body);
        res.status(200).json(crime);
    }
);

router.delete("/:id", validateIdParam, async (req, res) => {
    const crime = await crimesService.delete(req.params.id);
    res.status(200).json(crime);
});

module.exports = router;