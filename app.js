const express = require("express");
const path = require("path");
require("dotenv").config();
const morgan = require("morgan");
const session = require("express-session");
const connectDb = require("./config/db.config");
const app = express();
connectDb();

const checkLogin = require("./middlewares/checkLogein");

const homeRoute = require("./routes/home.routes");
const authRoute = require("./routes/auth.routes");
const tweetRoute = require('./routes/api/tweet.routes')
const profileRoute = require('./routes/profile.routes')
//middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: process.env.SECRET,
    resave: true,
    saveUninitialized: false,
  })
);
app.all("/", checkLogin);
app.use(morgan("dev"));

//view and view engin
app.set("view engine", "pug");
app.set("views", "views");

//static elements
app.use(express.static(path.join(__dirname, "public")));

//routes
app.use("/", homeRoute);
app.use("/auth", authRoute);
app.use('/api/tweet',tweetRoute);
app.use('/profile',profileRoute);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`app is running on port ${port}`));
