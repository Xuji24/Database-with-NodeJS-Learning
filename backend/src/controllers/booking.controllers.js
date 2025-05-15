// new progress
const {getUserBasicInfo} = require('../model/user.models');
const {getBookedDates, getPackageInfo} = require('../model/booking.models')
const {createBookingInfo} = require('../model/booking.models')

// default value retrieved from the customer basic information table in db
const bookingFormCustomerInfo = async (req, res) => {
    try{
        // get user information by email
        const email = req.email;
        const {contactNum, name, address} = req.body;

        if(!email || !contactNum || !name || !address){
            return res.status(400).json({error: 'Missing required customer information'});
        }
        // check if the user exists in the database
        const userInfo = await getUserBasicInfo(email);
        
        res.status(200).json({
            status: 'success',
            data: {
                userInfo: userInfo
            }
        });
    }catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal server error'});
    }
}

const bookingFormEventInfo = async (req, res) => {
    try{
        // get event information by event id
        const packageID = req.params.packageID;
        const {price, eventDate, event, location, eventTheme, otherConcern} = req.body;
        if(!packageId || !eventDate || !location || !eventTheme){
            return res.status(400).json({error: 'Missing required event information'});
        }
        const eventInfo = {
            packageID: packageID,
            price: price,
            eventDate: eventDate,
            event: event,
            location: location,
            eventTheme: eventTheme,
            otherConcern: otherConcern
        }
        
        res.status(200).json({
            status: 'success',
            data: {
                eventInfo: eventInfo[0]
            }
        });
    }catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal server error'});
    }
}

const fetchBookedDates = async (req, res) => {
    try {
        const dates = await getBookedDates();
        res.json({ bookedDates: dates });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const fetchPackageInfo = async (req, res) => {
   try{
        // get package information by package code
        const customerID = req.customerID;
        if(!customerID){
            return res.status(400).json({ error: 'Missing required customer information', redirect: '/' });
        }

        const packageCode = req.body.package;
        const packageInfo = await getPackageInfo(packageCode);
        
        if(packageInfo.length === 0) {
            return res.status(404).json({error: 'Package not found'});
        }
        
        res.status(200).json({
            status: 'success',
            data: {
                packageInfo: packageInfo[0]
            }
        });
   }catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal server error'});
   }
}

const insertBookingInfo = async (req, res) => {
    try {
        const { customerInfo, eventInfo, paymentInfo } = req.body;
        if (!customerInfo || !eventInfo || !paymentInfo) {
            return res.status(400).json({ error: 'Missing required booking information' });
        }
        
        const bookingResult = await createBookingInfo(customerInfo, eventInfo, paymentInfo);
        
        res.status(201).json({
            status: 'success',
            data: {
                bookingResult: bookingResult
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
}
module.exports = {
    bookingFormCustomerInfo,
    bookingFormEventInfo,
    fetchBookedDates,
    fetchPackageInfo,
    insertBookingInfo
}