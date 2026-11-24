"use strict";

class AppError extends Error {
    constructor(message, statusCode, details = null) {
        super(message);
        this.name = "AppError";
        this.status = statusCode;
        this.details = details;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;