"use strict"

const express = require("express")

const authRouter = require("./auth.router")
const locationsRouter = require("./locations.router")
const zonesRouter = require("./zones.router")
const sightingsRouter = require("./sightings.router")
const crimesRouter = require("./crimes.router")
const villainsRouter = require("./villians.router")

function routerApi(app) {
  const apiRouter = express.Router()

  app.use("/api", apiRouter)

  apiRouter.use("/auth", authRouter)
  apiRouter.use("/locations", locationsRouter)
  apiRouter.use("/zones", zonesRouter)
  apiRouter.use("/sightings", sightingsRouter)
  apiRouter.use("/crimes", crimesRouter)
  apiRouter.use("/villains", villainsRouter)
}

module.exports = routerApi