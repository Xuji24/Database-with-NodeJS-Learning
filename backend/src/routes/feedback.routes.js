// New progress
const express = require('express');
const router = express.Router();

const getFeedback = require('../controllers/feedback.controllers');

router.route('/home-page').get(getFeedback);

module.exports = router;