const express = require("express");
const router = express.Router();
// new progress
const passport = require("passport");


// controllers
const {
  registerUser,
  verifyEmail,
  loginUser,
  loginSuccess,
  logoutUser,
  forgotPassword,
  resetPassword,
} = require("../controllers/auth.controllers");

// middlewares
const checkCaptcha = require("../middlewares/captcha.middleware");
const {
  verifyToken,
  verifyUrlToken,
} = require("../middlewares/auth.middleware");


router.get(
  '/google',
  passport.authenticate('google', {scope: ['profile', 'email']})
)

router.get(
  '/google/callback', 
  passport.authenticate('google', {failureRedirect: '/'}), (req, res)=>{
  res.redirect('/api/auth/profile');
})

router.route("/register").post(registerUser);
router.route("/verify-email/:token").get(verifyUrlToken, verifyEmail);
router.route("/login").post(loginUser);
router.get("/profile", loginSuccess);
router.route("/logout").get(logoutUser);
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password").post(verifyToken, resetPassword);

module.exports = router;
