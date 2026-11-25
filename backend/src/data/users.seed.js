"use strict";

// Las contraseñas se configuran localmente y se guardan cifradas al ejecutar el seed.
module.exports = [
    {
        name: "Spidey",
        email: "spidey@spideytracker.com",
        password: process.env.SEED_USER_PASSWORD,
        role: "user",
    },
    {
        name: "Administrador",
        email: "admin@spideytracker.com",
        password: process.env.SEED_ADMIN_PASSWORD,
        role: "admin",
    },
];