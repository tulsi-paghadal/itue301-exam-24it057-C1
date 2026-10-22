
const express = require("express");
const Booking = require("../models/Booking");
const Vehicle = require("../models/Vehicle");

const router = express.Router();

// POST /api/v1/bookings
router.post("/", async (req, res, next) => {
  try {
    const { vehicleId, pickupDate, returnDate } = req.body;

    if (!vehicleId || !pickupDate || !returnDate) {
      return res.status(400).json({
        success: false,
        message: "Vehicle, pickup date and return date are required",
      });
    }

    const pickup = new Date(pickupDate);
    const returning = new Date(returnDate);

    if (
      Number.isNaN(pickup.getTime()) ||
      Number.isNaN(returning.getTime()) ||
      returning <= pickup
    ) {
      return res.status(400).json({
        success: false,
        message: "Return date must be after pickup date",
      });
    }

    const vehicle = await Vehicle.findById(vehicleId);

    if (!vehicle) {
      return res.status(400).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    if (!vehicle.available) {
      return res.status(400).json({
        success: false,
        message: "Vehicle is not available",
      });
    }

    const booking = await Booking.create({
      customerId: req.customerId,
      vehicleId,
      pickupDate: pickup,
      returnDate: returning,
      status: "reserved",
    });

    vehicle.available = false;
    await vehicle.save();

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      booking,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/bookings/my
router.get("/my", async (req, res, next) => {
  try {
    const bookings = await Booking.find({
      customerId: req.customerId,
    })
      .populate("customerId", "name email")
      .populate("vehicleId", "model type");

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/v1/bookings/:id/status
router.patch("/:id/status", async (req, res, next) => {
  try {
    const allowedStatuses = [
      "reserved",
      "ongoing",
      "completed",
      "cancelled",
    ];

    const { status } = req.body;

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking status",
      });
    }

    const booking = await Booking.findOne({
      _id: req.params.id,
      customerId: req.customerId,
    });

    if (!booking) {
      return res.status(400).json({
        success: false,
        message: "Booking not found for this customer",
      });
    }

    const previousStatus = booking.status;
    booking.status = status;
    await booking.save();

    // Return the vehicle to the fleet after cancellation/completion.
    if (
      status === "cancelled" ||
      status === "completed"
    ) {
      const vehicle = await Vehicle.findById(booking.vehicleId);

      if (vehicle) {
        vehicle.available = true;
        await vehicle.save();
      }
    } else if (
      previousStatus === "cancelled" ||
      previousStatus === "completed"
    ) {
      const vehicle = await Vehicle.findById(booking.vehicleId);

      if (vehicle) {
        vehicle.available = false;
        await vehicle.save();
      }
    }

    res.status(200).json({
      success: true,
      message: "Booking status updated successfully",
      booking,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
