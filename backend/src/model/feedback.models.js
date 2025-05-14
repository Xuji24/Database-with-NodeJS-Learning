// new progress
const databaseTransaction = require('../utils/db.transaction');

const retrieveFeedback = async () => {
    return await databaseTransaction(async (sqlCon) => {
        const [feedbacks] = await sqlCon.query('SELECT * FROM selected_feedback');
        if (feedbacks.length === 0) {
            throw new Error('No feedbacks found');
        }
        return feedbacks;
    })
}

module.exports = {
    retrieveFeedback
}