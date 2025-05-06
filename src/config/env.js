const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config(); // Load environment variables from .env file
// Create a connection pool to the MySQL database for multiple connections simultaneously
const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER, 
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE, 
});

const jwtSecretKey = process.env.JWT_SECRET_KEY; // Store the JWT secret key from environment variables

const googleCaptchaSecretKey = process.env.GOOGLE_CAPTCHA_SECRET_KEY; // Store the Google reCAPTCHA secret key from environment variables
module.exports = {
    pool,
    jwtSecretKey, // Export the secret key for use in other parts of the application
    googleCaptchaSecretKey
};
