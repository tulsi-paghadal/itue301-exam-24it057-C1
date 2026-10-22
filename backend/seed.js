const mongoose = require("mongoose");
require("dotenv").config();

const Vehicle = require("./models/Vehicle");

async function seedVehicles() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    await Vehicle.deleteMany({});

    await Vehicle.insertMany([
      {
        model: "Maruti Swift",
        type: "Hatchback",
        pricePerDay: 1500,
        available: true
      },
      {
        model: "Honda City",
        type: "Sedan",
        pricePerDay: 2500,
        available: true
      },
      {
        model: "Hyundai Creta",
        type: "SUV",
        pricePerDay: 3000,
        available: true
      }
    ]);

    console.log("SUCCESS: 3 sample vehicles added!");
  } catch (error) {
    console.error("ERROR:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

seedVehicles();
