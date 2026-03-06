require('dotenv').config();


const express = require("express");
const app = express();
const mongoose  = require("mongoose");
 const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
 const ExpressError = require("./utils/ExpressError.js");
 const session = require("express-session");
 const MongoStore = require('connect-mongo');
const flash = require("connect-flash"); 
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routers/listing.js");
const reviewRouter = require("./routers/reviews.js");
const userRouter = require("./routers/user.js");



// const MONGODB_url = "mongodb://127.0.0.1:27017/wanderlust";
const altasUrl = process.env.ALTASDB_URL || "mongodb://127.0.0.1:27017/wanderlust";

main().then(()=>{
    console.log("Successful connection");
}).catch((err)=>{
    console.log("Connection error:", err);
});


async function main(){
    await mongoose.connect ( altasUrl);
}

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
 app.use(express.json()); // 👈 ADD THIS LINE

const store = MongoStore.create({
    client: mongoose.connection.getClient(), // use existing mongoose connection
    touchAfter: 24 * 3600,
});

store.on("error", (err) => {
    console.error("Session store error", err);
});

 const secretOptions = {
    store:  store,
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: {
    expires: new Date(Date.now() + 14*60*60*1000),
       maxAge: 14*60*60*1000,
       httpOnly: true
    }
 };

//  app.get("/",(req,res) =>{
//     res.send("working");
// });



 app.use(session(secretOptions));
 app.use(flash( ));

 app.use(passport.initialize());
 app.use(passport.session());
 passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

 app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
     next();
 });

//  app.get("/demouser",async(req,res)=>{
//     let fakeUser = new User({
//         email: "student@gmail.com",
//         username: "delta-student",
//     });

//     let registerUser = await User.register(fakeUser, "helloworld");
//     res.send(registerUser);
//  });

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

app.use((req, res, next)=>{
    next(new ExpressError(404,"Page not found"));
});
  
app.use((err, req, res, next)=>{
    console.error(err && err.stack ? err.stack : err);
    let {statusCode = 500 , message ="Something went wrong" } = err;
    if (res.headersSent) {
        return next(err);
    }
    res.status(statusCode).render("error.ejs", { message, statusCode });
});

app.listen(8080,()=>{
    console.log("server is working");
});