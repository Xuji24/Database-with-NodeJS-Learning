const cron = require('node-cron');
const { deleteExpiredUnverifiedUsers } = require('../model/user.models');

// Runs every day at midnight
cron.schedule('0 0 * * *', async () => {
    console.log('Running cleanup for expired unverified accounts...');
    await deleteExpiredUnverifiedUsers();
});