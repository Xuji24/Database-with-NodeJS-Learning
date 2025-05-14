const axios = require('axios');
const {googleCaptchaSecretKey} = require('../config/env');
// Captcha middleware to verify the captcha response
const checkCaptcha = async (req, res, next) => {
    const captcha = req.body['g-recaptcha-response'];

    if(!captcha) {
        return res.status(400).json({ message: 'Captcha not provided' });
    }

    try{
         const response = await axios.post('https://www.google.com/recaptcha/api/siteverify', null, {
            params:{
                secret: googleCaptchaSecretKey,
                response: captcha
            }
         });

         if(response.data.success){
            // Captcha verification successful
            next();
         } else{
            // Captcha verification failed
            return res.status(400).json({ message: 'Captcha verification failed' });
         }
    }catch(err){
        console.log(`Captcha verification error: ${err}`);
        return res.status(500).json({ message: 'Captcha verification failed' });
    }
}

module.exports = checkCaptcha;