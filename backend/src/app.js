const express = require("express");
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
//new progress
const feedback = require("./routes/feedback.routes");
const booking = require("./routes/booking.routes");

const app = express();
const port = 3000;



// middleware
app.use(express.static(path.join(__dirname, '..', 'public'), { index: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // for x-www-form-urlencoded
app.use(cors());
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
//new progress
app.use("/api", feedback);
app.use("/api/booking", booking);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'package.html'));
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
