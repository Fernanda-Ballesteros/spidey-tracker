"use strict";

const mongoose = require("mongoose");

async function connectDatabase() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("Falta la variable MONGODB_URI en las variables de entorno.");
  }

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000
  });

  // Se muestra el host y la base, nunca la cadena completa (lleva la contraseña)
  const { host, name } = mongoose.connection;
  console.log(`Conexión a MongoDB establecida: ${host}/${name}`);
}

async function disconnectDatabase() {
  await mongoose.disconnect();
  console.log("Desconexión de la base de datos realizada con éxito.");
}

module.exports = {
  connectDatabase,
  disconnectDatabase
};