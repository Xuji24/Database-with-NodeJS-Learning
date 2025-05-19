const {getPackageInfoById} = require('../models/booking.models');

const getPackageInfo = async (req, res) => {
    try{
        const packageID = req.query.package;;
        console.log("Package ID: ", packageID);
        const packageInfo = await getPackageInfoById(packageID);
        if (packageInfo.length === 0) {
            return res.status(404).json({ message: 'Package not found' });
        }
        req.session.booking = {
            ...req.session.booking,
            packageID,
            //bookingRange: packageInfo[0].booking_range_months
        };
        
        
        //return res.status(200).json({ message: "Customer info save!", redirect: '/booking-customer' });
        return res.redirect('/booking-customer');
    }catch(err){
        console.log(err);
        return res.status(500).json({ message: "Package did not get" });
    }
}
const saveCustomerInfo = async(req, res) => {
    try{
        const { name, contactNum, address, email } = req.body;
        const emptyFields = checkEmptyFields([name, contactNum, address, email]);
        if (emptyFields) {
            return res.status(400).json({ message: "Please fill all fields" });
        }

        req.session.booking = {
            ...req.session.booking,
            name,
            contactNum,
            address,
            email,
        };

        //return res.status(200).json({ message: "Customer info save!", redirect: '/booking-event' });
        res.redirect('/booking-event');
    }catch(err){
        console.log(err);
        return res.status(500).json({ message: "Customer info did not save" });
    }
};

const saveEventInfo = async (req, res) => {
    try{
        const { package: selectedPackage, price, eventDate, event, location, eventTheme, otherConcern } = req.body;

        const emptyFields = checkEmptyFields([selectedPackage, price, eventDate, event, location, eventTheme]);

        if (emptyFields) {
            return res.status(400).json({ message: "Please fill all fields" });
        }
        req.session.booking = {
            ...req.session.booking,
            selectedPackage,
            price,
            eventDate,
            location,
            eventTheme,
            otherConcern
        };
        //return res.status(200).json({ message: "Event Info Saved!", redirect: '/booking-terms' });
        res.redirect('/booking-terms');
    }catch(err){
        console.log(err);
        return res.status(500).json({ message: "Event info did not save" });
    }
};

const saveTerms = async (req, res) => {
    try{
        //return res.status(200).json({ message: "Terms have read", redirect: '/booking-payment' });
        res.redirect('/booking-payment');
    }catch(err){
        console.log(err);
        return res.status(500).json({ message: "Please check the terms & conditions" });
    }
    
};

const savePaymentInfo = async (req, res) => {
    try{
        const { paymentMethod, mobileNumber } = req.body;
        const emptyFields = checkEmptyFields([ paymentMethod, mobileNumber ]);

        if(emptyFields) {
            return res.status(400).json({ message: "Please fill all fields" });
        }
        req.session.booking = {
            ...req.session.booking,
            paymentMethod,
            mobileNumber
        };
        //return res.status(200).json({ message: "Successfully paid the booking", redirect: '/booking-end' });
        res.redirect('/booking-end');
    }catch(err){
        console.log(err);
        return res.status(500).json({ message: "Customer info did not save" });
    }
};

const finalizeBooking = async (req, res) => {
    try{
        const bookingData = req.session.booking;

        // Validation (ensure all needed fields exist)
        if (!bookingData.name || !bookingData.eventDate || !bookingData.paymentMethod) {
            return res.status(400).json({ message: "Incomplete booking data" });
        }
        console.log("Booking Data: ", bookingData);
        // Save to database (pseudo)
        //await saveBookingToDatabase(bookingData);

        // Clear session
        req.session.booking = null;

        return res.status(200).json({ message: "Booking finalized" });
    }catch(err){
        console.log(err);
        return res.status(500).json({ message: "Customer info did not save" });
    }
    
};

function checkEmptyFields(fields){
    for (const field of fields) {
        if (!field) {
            return true;
        }
    }
    return false;
}
module.exports = {
    getPackageInfo,
    saveCustomerInfo,
    saveEventInfo,
    saveTerms,
    savePaymentInfo,
    finalizeBooking
};


