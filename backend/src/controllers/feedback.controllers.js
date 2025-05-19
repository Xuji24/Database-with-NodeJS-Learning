// new progress
const {retrieveFeedback} = require('../models/feedback.models');

// get feedbacks from the database
// This function retrieves feedbacks from the database and returns them as a JSON response.

const getFeedback = async (req, res) => {
    try{
        const feedbacks = await retrieveFeedback();
        if (feedbacks.length === 0) {
            return res.status(404).json({message: 'No feedbacks found'});
        }

        res.status(200).json(feedbacks);
    }catch (err){
        res.status(500).json({message: 'Error retrieving feedback', error: err.message});
    }
}

module.exports = getFeedback;