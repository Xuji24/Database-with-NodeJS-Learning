// new progress
const express = require('express');
const router = express.Router();
const {
    bookingFormCustomerInfo,
    bookingFormEventInfo,
    fetchBookedDates,
    fetchPackageInfo,
    insertBookingInfo
} = require('../controller/booking.controllers');

router.get('/customer-info', bookingFormCustomerInfo); // Fetch customer information
router.get('/customer-info/:packageID', bookingFormEventInfo); // Fetch event information by package ID
router.get('/event-info', fetchBookedDates); // Fetch booked dates
router.get('/package-info/:packageCode', fetchPackageInfo); // Fetch package information by package code
router.post('/create-booking', insertBookingInfo); // Insert booking information

module.exports = router;