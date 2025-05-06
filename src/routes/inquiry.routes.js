const express = require('express');
const router = express.Router();
const { sendInquiry, getInquiries, deleteInquiry, deleteAllInquiry } = require('../controller/inquiry.controllers');

const {verifyToken} = require('../middlewares/auth.middleware');

router.route('/send-inquiry').post(sendInquiry);


module.exports = router;