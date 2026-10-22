
const express = require("express");
const Vehicle = require("../models/Vehicle");

const router = express.Router();

// GET /api/v1/vehicles
router.get("/", async (req, res, next) => {
  try {
    const vehicles = await Vehicle.find();

    res.status(200).json({
      success: true,
      count: vehicles.length,
      vehicles,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
