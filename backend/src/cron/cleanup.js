const cron = require('node-cron');
const { deleteExpiredUnverifiedUsers } = require('../models/user.models');

// Runs every 6 hours (Asia/Manila timezone)
cron.schedule('0 */6 * * *', async () => {
    console.log('Running cleanup for expired unverified accounts...');
    await deleteExpiredUnverifiedUsers();
}, {
    timezone: 'Asia/Manila'
});