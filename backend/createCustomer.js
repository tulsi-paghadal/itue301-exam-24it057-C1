require("dotenv").config();
const mongoose = require("mongoose");
const Customer = require("./models/Customer");

async function createCustomer() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const email = "tulsi.demo@example.com";
    const licenseNumber = "DEMO-LIC-2026";

    let customer = await Customer.findOne({ email });

    if (!customer) {
      customer = await Customer.create({
        name: "Demo Customer",
        email,
        licenseNumber
      });
    }

    console.log("Test customer ready!");
    console.log("Email:", customer.email);
    console.log("License number:", customer.licenseNumber);
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

createCustomer();
