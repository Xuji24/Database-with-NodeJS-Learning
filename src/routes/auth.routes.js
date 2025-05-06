const express = require('express');
const router = express.Router();
// new progress
const passport = require('passport');

router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email'],
}));

// controllers
const {
    registerUser,
    verifyEmail,
    loginUser,
    logoutUser,
    forgotPassword,
    resetPassword
} = require('../controller/auth.controllers');

// middlewares
const checkCaptcha = require('../middlewares/captcha.middleware');
const {verifyToken, verifyUrlToken} = require('../middlewares/auth.middleware');

router.route('/google').get(passport.authenticate('google', {
    scope: ['profile', 'email'],
}));

router.route('/google/callback').get(
    passport.authenticate('google', {
        failureRedirect: '/',
        session: true,
    }),
    (req, res) => {
        res.redirect('/api/auth/profile');
    }
);

router.route('/register').post(registerUser);
router.route('/verify-email/:token').get(verifyUrlToken, verifyEmail);
router.route('/login').post(loginUser);
router.route('/logout').get(logoutUser);
router.route('/forgot-password').post(forgotPassword);
router.route('/reset-password').post(verifyToken, resetPassword);

module.exports = router;