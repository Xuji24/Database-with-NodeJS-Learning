const sendEmail = require('../utils/email.sender');
const databaseTransaction = require('../utils/db.transaction');

const sendInquiry = async (req, res) =>{
    const { name, email, message } = req.body;

    await sendEmail({
        from: email,
        to: process.env.EMAIL_USER,
        subject: 'Customer Inquiry',
        html: `<strong>${name}</strong>: <p>${message}</p>`,
    });

    res.status(200).json({ message: 'Inquiry sent successfully.' });
}

module.exports = {
    sendInquiry
}