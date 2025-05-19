//bookingID, customerID, packageID, event_start_date_time, event_end_date_time, location, event_theme, other_concern
const databaseTransaction = require('../utils/db.transaction');

// For getting package details
const getPackageInfoById = async (packageID) => {
    return await databaseTransaction(async (sqlCon) => {
        const [packageInfo] = await sqlCon.query('SELECT * FROM package WHERE packageID = ?', [packageID]);
        if (packageInfo.length === 0) {
            throw new Error('Package not found');
        }
        return packageInfo[0];
    });
}

const getFullyBookedDates = async () => {
    return await databaseTransaction(async (sqlCon) => {
        const [bookedDates] = await sqlCon.query(`SELECT event_start_date_time
            FROM bookings
            GROUP BY event_start_date_time
            HAVING COUNT(*) >= 3;`);
        if (bookedDates.length === 0) {
            throw new Error('No booked dates found');
        }
        return rows.map(r => r.event_start_date_time);
    });
}

const insertBooking = async (bookingData) => {
    return await databaseTransaction(async (sqlCon) => {
        const { customerID, packageID, event_start_date_time, event_end_date_time, location, event_theme, other_concern } = bookingData;
        const [result] = await sqlCon.query(
            `INSERT INTO booking (customerID, packageID, event_start_date_time, event_end_date_time, location, event_theme, other_concern) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`
             ,[customerID, packageID, event_start_date_time, event_end_date_time, location, event_theme, other_concern]);
        return result.insertId;
    });
}

module.exports = {
    getPackageInfoById,
    getFullyBookedDates,
    insertBooking
}

