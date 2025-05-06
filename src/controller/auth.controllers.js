const {jwtSecretKey} = require('../config/env');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require('axios');
const {
    insertUserAccount, 
    sendVerificationEmail, 
    updateVerificationStatus,
    getUserByEmail, 
    updateUserAccount
} = require('../model/user.models');
const databaseTransaction = require('../utils/db.transaction');
const sendEmail = require('../utils/email.sender');
const checkFields = require('../utils/validation.utils');
// =========================== User Validation ============================================== //
// register a user
const registerUser = async (req, res) =>{
    const { email, password, confirmPassword, firstName, lastName} = req.body;

    const isVerified = false;
    let isCreated = false;
    // Validate strength of password, hash and store it in the database
    // Check for empty fields
    const fieldError = checkFields(email, password, confirmPassword);
    if (fieldError) {
        return res.status(fieldError.status).json({ message: fieldError.message });
    }
   // Check if the email is in a valid format
   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
   if (!emailRegex.test(email) || !email.includes('@gmail') || !email.includes('.com')) {
       return res.status(400).json({ message: 'Invalid email format' });
   }

   await databaseTransaction(async (sqlCon) =>{
        const userExist = await getUserByEmail(sqlCon, email);
        if (userExist) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        passwordStrength(password, res);
        const hashedPassword = await bcrypt.hash(password, 10);

        isCreated = await insertUserAccount(sqlCon, email, hashedPassword, isVerified, firstName, lastName);

        // Use the SAME sqlCon here
        await sendVerificationEmail(sqlCon, email);
    }, res);
   
   if(isCreated){
        return res.status(200).json({ message: 'Registered successfully. Check your email to verify your account.' });
   }
};

const verifyEmail = async (req, res) => {
    try {
        const email = req.email;

        const isVerified = await updateVerificationStatus(email);

        if (isVerified) {
            return res.status(200).json({ message: 'Email verified successfully. You can now login.' });
        } else {
            return res.status(400).json({ message: 'Email verification failed.' });
        }
    } catch (err) {
        return res.status(500).json({ message: 'Server error during email verification.' });
    }
};

// Login user
const loginUser = async (req, res) => {
    const { email, password } = req.body;
     // Check for empty fields
     checkFields(email, password, null, res);

     await databaseTransaction(async (sqlCon) =>{
        // Check if the email exist
        const userExist = await getUserByEmail(sqlCon, email);
        if(!userExist){
            return res.status(400).json({message: 'Email does not exist'});
        }
        // Check if the password is correct
        const passwordMatch = await bcrypt.compare(password, userExist.password);
        if(!passwordMatch){
            return res.status(400).json({ message: 'Incorrect email or password'});
        }
        console.log('Logging in user: ', userExist);
        const user = userExist;
        // Generate a JWT token
        const token = jwt.sign(
            { 
                // Get id and email of the current user
                id: user.accountID,
                email: user.email

            }, 
            jwtSecretKey, 
            { expiresIn: '1h' }
        );
        
        // or redirect to another page and use the token
        //New Progress
        return res.status(200).json({ 
            message: `Login successful, welcome ${req.user.name}`,
            user: req.user, 
            token: token 
        }); // Send a JSON response with the token
     }, res);
}

//New Progress
const logoutUser = async (req, res) => {
    try {
        // Revoke the Google OAuth token if it exists
        if (req.user && req.user.token) {
            await axios.post('https://oauth2.googleapis.com/revoke', null, {
                params: { token: req.user.token },
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            });
        }

        // Log the user out of the session
        req.logout((err) => {
            if (err) {
                console.error('Error during logout:', err);
                return res.status(500).send('Error during logout');
            }
            res.redirect('/');
        });
    } catch (error) {
        console.error('Error revoking token:', error);
        res.status(500).send('Error during logout');
    }
};

function passwordStrength(password, res){
 const passwordStrength = (password) => {
        const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        const mediumRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/;
    
        if (strongRegex.test(password)) {
        return "strong";
        } else if (mediumRegex.test(password)) {
        return "average";
        } else {
        return "weak";
        }
    };
    
    const strength = passwordStrength(password);
    const passwordSuggestion = "A strong password should be at least 8 characters long and include uppercase letters, lowercase letters, numbers, and special characters (e.g., @$!%*?&)." ;
    const passwordStrengthMessage = [{message: "", suggestion: ""}];
    if (strength === "weak") {
        return res.status(400).json({ 
        message: "Password is too weak. Please use a stronger password.",
        suggestion: passwordSuggestion
        });
    } else if (strength === "average") {
        passwordStrengthMessage[0] = {
            message: "Password is average. Please use a stronger password.",
            suggestion: passwordSuggestion
        }
    }
}
// Forgot Password
const forgotPassword = async (req, res) =>{
    try{
        const {email} = req.body;
        
        if(!email){
            return res.status(400).json({ message: 'Missing email field' });
        }

        // Check if the email exists in the database
        const checkUser = await getUserAccountInfo(email);
        if(!checkUser){
            return res.status(400).json({ message: 'Email does not exist' });
        }

        const token = jwt.sign({ email }, jwtSecretKey, { expiresIn: '1h' });
        console.log(email);
        const receiver = {
            to: email,
            subject: 'Password Reset Request',
            html: `<p>Click the link to generate new password</p> <a href = "${process.env.CLIENT_URL}/reset-password/${token}">${process.env.CLIENT_URL}/reset-password/${token}</a>`,
            from: process.env.EMAIL_USER,
        };
        
        
        
        await sendEmail(receiver);

        return res.status(200).send({message: 'Password reset link sent to your gmail successfully'});
    }catch(err){
        console.log(err);
        return res.status(500).json({ message: 'Email did not send!' });
    }
}

const resetPassword = async (req, res) => {
    try{
        const { newPassword } = req.body;
        if(!newPassword){
            return res.status(400).json({ message: 'Missing new password field' });
        }

        const user = await getUserInfo(req.email);
        
        const checkPassword = await updateUserAccount(user.email, newPassword);
        console.log(user.email, checkPassword, newPassword);
        if(checkPassword){
            return res.status(400).json({ message: 'New password cannot be the same as the old password' });
        }

        return res.status(200).json({ message: 'Password reset successfully' });
    }catch(err){
        console.log(err);
        return res.status(500).json({ message: 'Password did not reset' });
    }
}
module.exports = {
    registerUser,
    verifyEmail,
    loginUser,
    logoutUser,
    forgotPassword,
    resetPassword
}