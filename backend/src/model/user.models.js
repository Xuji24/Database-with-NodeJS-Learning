const databaseTransaction = require('../utils/db.transaction');
const sendEmail = require('../utils/email.sender');
const jwt = require("jsonwebtoken");
const {jwtSecretKey} = require('../config/env');
const bcrypt = require('bcryptjs');

// =========================== User Account ============================================== //
// get user email
const getUserByEmail = async (email) => {
    return await databaseTransaction(async (sqlCon) => {
        const [userAccount] = await sqlCon.query('SELECT * FROM customer_account WHERE email = ?', [email]);
        return userAccount.length > 0 ? userAccount[0] : null;
    });
    
};

const getUserInfoByEmail = async (email) => {
    return await databaseTransaction(async (sqlCon) => {
        const [userInfo] = await sqlCon.query('SELECT * FROM customer WHERE email = ?', [email]);
        return userInfo.length > 0 ? userInfo[0] : null;
    });
}
// update user account information
const updateUserAccount = async (email, newPassword) => {
    return await databaseTransaction(async (sqlCon) =>{
        // check if the newPassword is same as the old password
        const [checkPassword] = await sqlCon.query('SELECT password FROM customer_account WHERE email = ?', [email]);

        const isOldPassword = await bcrypt.compare(newPassword, checkPassword[0].password);
        if(isOldPassword){
            return isOldPassword;
        }
        // hash the password
        const newHashedPassword = await bcrypt.hash(newPassword, 10); 
        console.log(newPassword, newHashedPassword);

        await sqlCon.query('UPDATE customer_account SET password = ? WHERE email = ?', [newHashedPassword, email]);
        
        return false; // returning a false value to indicate that the password was updated successfully
    });
}

// insert user account information
const insertUserAccount = async (email, hashedPassword, isVerified, firstName, lastName) => {
    let isCreated = false;

    return await databaseTransaction(async (sqlCon) => {
        // Store the user in the database
        const [newCustomerAccount] = await sqlCon.query('INSERT INTO customer_account (email, password, is_verified) VALUES (?, ?, ?)', [email, hashedPassword, isVerified]);
        const userId = newCustomerAccount.insertId; // Get the ID of the newly created user
        // Check if the user was created successfully
        if (newCustomerAccount.affectedRows === 0) {
            throw new Error('Failed to create user');
        }
        
        const [newCustomerDetails] = await sqlCon.query('INSERT INTO customer (accountID, full_name, email) VALUES (?, ?, ?)', [userId, firstName + ' ' + lastName, email]);
        
        // Check if the user was created successfully
        if (newCustomerDetails.affectedRows === 0) {
            throw new Error('Failed to create user' );
        }else{
            isCreated = true;
        }

        return isCreated;
    });
}

// insert or find user by google-oauth
const findOrCreateUser = async (profile) => {
    const email = profile.emails[0].value;
    const fullName = profile.displayName;
    return await databaseTransaction(async (sqlCon) => {
        const [users] = await sqlCon.query(
           `SELECT ca.*, c.full_name
            FROM customer_account ca
            JOIN customer c ON ca.accountID = c.accountID
            WHERE ca.email = ?`,
        [email]
        );
        if (users.length > 0) return users[0];
        
        // insert customer account
        const [customerAccount] = await sqlCon.query(
        "INSERT INTO customer_account (email, is_verified) VALUES (?, ?)",
        [email, true]
        );
        const accountID = customerAccount.insertId;

        // insert customer details
        const [customerInfo] = await sqlCon.query(
        "INSERT INTO customer (accountID, full_name, email) VALUES (?, ?, ?)",
        [accountID, fullName, email]
        );
        const customerId = customerInfo.insertId;
        
        return { 
            accountID: customerAccount.insertId,
            customerId,
            email,
            full_name: fullName
        };
  });
};

// ============================ User Verification Email ============================================== //
// Verify the account through the email
const sendVerificationEmail = async (email) => {
    return await databaseTransaction(async (sqlCon) => {
        try {
            const [userInfo] = await sqlCon.query('SELECT * FROM customer_account WHERE email = ?', [email]);
            if (userInfo.length === 0) {
                throw new Error('User not found');
            }

            const token = jwt.sign({ email }, jwtSecretKey, { expiresIn: '1h' });

            const verificationLink = `${process.env.CLIENT_URL}/verify-email/${token}`;
            const receiver = {
                to: email,
                subject: 'Email Verification',
                html: `<p>Click the link below to verify your email:</p><a href="${verificationLink}">${verificationLink}</a>`,
                from: process.env.EMAIL_USER,
            };

            await sendEmail(receiver);
            return true;    
        } catch (err) {
            console.error(err);
            throw new Error('Failed to send verification email');
        }
    });
    
};

const updateVerificationStatus = async (email) => {
    return await databaseTransaction(async (sqlCon) =>{
        const isVerified = true;
        const [updateStatus] = await sqlCon.query('UPDATE customer_account SET is_verified = ? WHERE email = ?', [isVerified, email]);
        if(updateStatus.affectedRows === 0) {
            isVerified = false;
            throw new Error('Failed to update verification status');
        }
        return isVerified; // Assuming you want the first result
    });
}
// =========================== User Basic Information ============================================== //
// get user basic information

const getUserBasicInfo = async (email) => {
    return await databaseTransaction(async (sqlCon) =>{
        const [userInfo] = await sqlCon.query('SELECT * FROM customer WHERE email = ?', [email]);

        if(userInfo.length === 0) {
            throw new Error('User not found');
        }

        return userInfo[0]; // Assuming you want the first result
    })
}

// User Account Information
module.exports = {
    getUserByEmail,
    getUserInfoByEmail,
    updateUserAccount,
    insertUserAccount,
    findOrCreateUser,
    sendVerificationEmail,
    updateVerificationStatus,
    getUserBasicInfo
};

