
require("node:dns/promises").setServers(["1.1.1.1", "8.8.8.8"]);


if(process.env.NODE_ENV != "production"){
    require("dotenv").config();
} 

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodoverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const ListingRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodoverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname,"/public"))); 


const dbUrl = process.env.ATLASDB_URL;

async function main() {
    if (!dbUrl) {
        throw new Error("ATLASDB_URL is missing from .env");
    }

   await mongoose.connect(dbUrl, {
    autoSelectFamily: false
});
    console.log("MongoDB connected successfully");
}

main().catch((err) => {
    console.error("MongoDB connection failed:", err.message);
});


const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24*3600,
});

store.on("error", ()=>{
    console.log("error in Mongo session Store", err);
});

const sessionOption= {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie:{
        expires: Date.now + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 *  60 * 60 * 1000,
        httpOnly: true
    }, 
}

app.use(session(sessionOption));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());




app.use((req, res, next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});


app.use("/listings", ListingRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/", userRouter);


app.all("/{*splat}", (req, res, next)=>{
    next(new ExpressError(404,"page not found"));
});


app.use((err, req, res, next) => {
    console.error("ACTUAL ERROR:", err);

    let { statusCode = 500, message = "something went wrong" } = err;

    res.status(statusCode).render("listings/error.ejs", { message });
});


app.listen(8080, () =>{
    console.log("server is listening");
});