const express = require('express');
const router = express.Router();
const { sendInquiry} = require('../controllers/inquiry.controllers');

const {verifyToken} = require('../middlewares/auth.middleware');

router.route('/send-inquiry').post(sendInquiry);


module.exports = router;