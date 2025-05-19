const {jwtSecretKey} = require('../config/env');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
    insertUserAccount, 
    sendVerificationEmail, 
    updateVerificationStatus,
    getUserAccountByEmail,
    getUserInfoByEmail,
    updateUserAccount
} = require('../models/user.models');
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

    const userExist = await getUserAccountByEmail(email);
    if (userExist){
        if (!userExist.isVerified) {
            const now = new Date();
            if (userExist.verificationExpiresAt && now > new Date(userExist.verificationExpiresAt)) {
                // Delete or overwrite the expired unverified account
                await deleteUserByEmail(email); // Implement this function
            } else {
                await sendVerificationEmail(email);
                return res.status(400).json({ 
                    message: 'Account exists but is not verified. Verification email resent. Please check your inbox.' 
                });
            }
        } else {
            return res.status(400).json({ message: 'Email already exists' });
        }
    }

    passwordStrength(password, res);
    const hashedPassword = await bcrypt.hash(password, 10);

    const expiration = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
    isCreated = await insertUserAccount(email, hashedPassword, isVerified, firstName, lastName, expiration);

    // Use the SAME sqlCon here
    await sendVerificationEmail(email);               
   
   if(isCreated){
        return res.status(200).json({ 
            message: 'Registered successfully. Check your email to verify your account.', 
            data: {email, firstName, lastName} 
        });
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

function createToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
}

const loginUser = async (req, res) => {
    try{
        const { email, password } = req.body;
            // Check for empty fields
        checkFields(email, password, null, res);

        // Check if the email exist
        const userExist = await getUserAccountByEmail(email);
        if(!userExist){
            return res.status(400).json({message: 'Email does not exist'});
        }
        if(userExist.password === "" || !userExist.password){
            return res.status(400).json({message: 'User does not exist'});
        }
        if(!userExist.is_verified){
            return res.status(400).json({ message: 'Email not verified. Please check your inbox for the verification email. It expires after 24 hours of register. ' });
        }
        const passwordMatch = await bcrypt.compare(password, userExist.password);
        if(!passwordMatch){
            return res.status(400).json({ message: 'Incorrect email or password'});
        }

        //const user = await getUserInfoByEmail(email);

        // Generate a JWT token
        // const token = jwt.sign(
        //     { 
        //         // Get id and email of the current user
        //         id: user.accountID,
        //         email: user.email

        //     }, 
        //     jwtSecretKey, 
        //     { expiresIn: '1h' }
        // );
        // or redirect to another page and use the token
        // return res.status(200).json({ 
        //     message: `Login successful, welcome ${user.full_name}`,
        //     user: user, 
        //     token: token,
        //     redirect: '/'
        // });
        const token = createToken(userExist.accountID);
        
        res.cookie('jwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict', // Or 'Lax' if using across subdomains
            maxAge: 24 * 60 * 60 * 1000, // 1 day
        });
        res.redirect('/packages');
    }catch(err){
        console.log(err);
        return res.status(500).json({ message: 'Login failed' });
    }
}
const logout = (req, res) => {
    res.clearCookie('jwt');
    res.json({ message: 'Logged out' });
}

// Login Logout OAuth
const loginSuccess = (req, res) => {
    const name = req.user.full_name|| "Guest";
    res.status(200).json({
    message: `Welcome ${name}`,
    user: req.user
  });
};
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
    loginSuccess,
    logout,
    logoutUser,
    forgotPassword,
    resetPassword
}