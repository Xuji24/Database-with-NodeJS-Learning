// new progress
const databaseTransaction = require('../utils/db.transaction');

// all information related to booking
const getBookingInfo = async (email) => {
    return await databaseTransaction(async (sqlCon) =>{
        const [bookingInfo] = await sqlCon.query('SELECT * FROM booking WHERE email = ?', [email]);

        if(bookingInfo.length === 0) {
            throw new Error('Booking not found');
        }

        return bookingInfo[0]; // Assuming you want the first result
    })
};

// get booked dates
const getBookedDates = async () => {
    return await databaseTransaction(async (sqlCon) => {
      const [dateReserved] = await sqlCon.query('SELECT date_reserved FROM booking');
      return dateReserved.map(row => row.date_reserved.toISOString().split('T')[0]); // Format to 'YYYY-MM-DD'
    });
};


// get package information by package code
const getPackageInfo = async (packageCode) => {
    return await databaseTransaction(async (sqlCon) => {
        const [packageInfo] = await sqlCon.query('SELECT * FROM package WHERE packageCode = ?', [packageCode]);

        if(packageInfo.length === 0) {
            throw new Error('Package not found');
        }

        return packageInfo[0]; // Assuming you want the first result
    });
}



// Insert booking information into the database
const createBookingInfo = async (customerInfo, eventInfo, paymentInfo) => {
    if (!customerInfo || !eventInfo || !paymentInfo) {
        throw new Error('Missing required booking information');
    }
    return await databaseTransaction(async (sqlCon) => {
        const { email } = customerInfo;
        const {packageID, price, eventDate, event, location, eventTheme, otherConcern} = eventInfo;
        const { paymentMethod, amount } = paymentInfo;

        // retrieve for the user Id
        const [user] = await sqlCon.query('SELECT customerID FROM customer WHERE email = ?', [email]);
        if (user.length === 0) {
            throw new Error('User not found');
        }
        const customerID = user[0].customerID
        // Insert into booking table
        const [insertedBooking] = await sqlCon.query(
            'INSERT INTO booking (customerID, packageID, eventDate, price, event, location, event_theme, paymentMethod, amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [customerID, packageID, eventDate, price, event, location, eventTheme, paymentMethod, amount]
        );

        return insertedBooking.insertId; // Return the ID of the newly inserted booking
    })
}
module.exports = {
    getBookingInfo,
    getBookedDates,
    getPackageInfo
}

module.exports = {
    createBookingInfo
}
