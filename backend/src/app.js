const express = require("express");
const cookieParser = require('cookie-parser');
const path = require("path");
const session = require("express-session");
const passport = require("passport");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const auth = require("./routes/auth.routes");
require("./utils/passport.setup");
require('./cron/cleanup');
const inquiry = require("./routes/inquiry.routes");
const feedback = require("./routes/feedback.routes");
const booking = require("./routes/booking.routes");

const app = express();
const port = 3000;


// middleware
app.use(express.static(path.join(__dirname, '..', 'public'), { index: false }));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true })); // for x-www-form-urlencoded
app.use(cors({
   origin: 'http://localhost:3000', // or your frontend domain
   credentials: true,
}));
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());
//middleware routes
app.use("/api/auth", auth);
app.use("/api/inquiry", inquiry);
app.use("/api/feedback", feedback);
app.use("/api/booking", booking);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

app.get("/packages", (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'package.html'));
});

app.get("/booking-customer", (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'booking1.html'));
});

app.get("/booking-event", (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'booking2.html'));
});

app.get("/booking-terms", (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'booking3.html'));
});

app.get("/booking-payment", (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'booking4.html'));
});

app.get("/booking-end", (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'booking5.html'));
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
 