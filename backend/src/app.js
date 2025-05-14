const express = require("express");
const session = require("express-session");
const passport = require("passport");
const dotenv = require("dotenv");
const cors = require("cors");
dotenv.config();

const auth = require("./routes/auth.routes");
require("./utils/passport.setup");

const inquiry = require("./routes/inquiry.routes");
//new progress
const feedback = require("./routes/feedback.routes");
const booking = require("./routes/booking.routes");

const app = express();
const port = 3000;



// middleware
app.use(express.static("public")); // for serving static files
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
  res.render("index.html");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
