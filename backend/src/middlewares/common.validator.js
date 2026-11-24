"use strict";

const AppError = require("../utils/appError");
const { isObjectId } = require("../utils/validation");

// Valida que :id de la URL tenga formato de ObjectId antes de llegar al servicio
function validateIdParam(req, res, next) {
    if (!isObjectId(req.params.id)) {
        return next(new AppError("El identificador enviado no es válido.", 400));
    }
    next();
}

module.exports = { validateIdParam };