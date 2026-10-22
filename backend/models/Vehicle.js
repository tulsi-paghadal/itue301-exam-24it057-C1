
const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema(
  {
    model: { type: String, required: true },
    type: { type: String, required: true },
    pricePerDay: { type: Number, required: true, min: 0 },
    available: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vehicle", vehicleSchema);
