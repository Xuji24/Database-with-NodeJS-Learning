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

const getInquiries = async (req, res) => {
    const inquiries = await databaseTransaction('SELECT * FROM inquiries');
    res.status(200).json(inquiries);
}

const deleteInquiry = async (req, res) => {
    const { id } = req.params;
    await databaseTransaction('DELETE FROM inquiries WHERE id = ?', [id]);
    res.status(200).json({ message: 'Inquiry deleted successfully.' });
}

const deleteAllInquiry = async (req, res) => {
    await databaseTransaction('DELETE FROM inquiries');
    res.status(200).json({ message: 'All inquiries deleted successfully.' });
}

module.exports = {
    sendInquiry,
    getInquiries,
    deleteInquiry,
    deleteAllInquiry
}