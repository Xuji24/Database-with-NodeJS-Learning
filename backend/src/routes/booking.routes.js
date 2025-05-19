const express = require("express");
const router = express.Router();
const {
  getPackageInfo,
  saveCustomerInfo,
  saveEventInfo,
  saveTerms,
  savePaymentInfo,
  finalizeBooking
} = require("../controllers/booking.controllers");

const { verifyToken } = require("../middlewares/auth.middleware");

// router.get("/booking/booked-dates", async (req, res) => {
//   try {
//     const dates = await getFullyBookedDates(); // You'll write this in model
//     res.json(dates);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to fetch booked dates" });
//   }
// });
router.get("/packages", verifyToken, getPackageInfo); // Package Info
router.post("/booking-customer", verifyToken,saveCustomerInfo);// Customer Info
router.post("/booking-event", verifyToken, saveEventInfo);         // Event Info
router.post("/booking-terms", verifyToken, saveTerms);             // Terms Accepted
router.post("/booking-payment", verifyToken, savePaymentInfo);       // Payment Info
router.post("/booking-end", verifyToken, finalizeBooking);       // Final submission

module.exports = router;