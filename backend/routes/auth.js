
const express = require("express");
const jwt = require("jsonwebtoken");
const Customer = require("../models/Customer");

const router = express.Router();

// POST /api/v1/auth/login
router.post("/login", async (req, res, next) => {
  try {
    const { email, licenseNumber } = req.body;

    if (!email || !licenseNumber) {
      return res.status(400).json({
        success: false,
        message: "Email and license number are required",
      });
    }

    const customer = await Customer.findOne({
      email: email.toLowerCase(),
      licenseNumber,
    });

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or license number",
      });
    }

    const token = jwt.sign(
      { customerId: customer._id },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      customer: {
        _id: customer._id,
        name: customer.name,
        email: customer.email,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
