const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const passport = require("passport");
const cookieSession = require('cookie-session');
require("dotenv").config();
require("./passport-setup");

const app = express();
app.listen(process.env.PORT);

app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(cookieSession({
    name: 'auth-session',
    keys: ['key1', 'key2']
}));

const isLoggedId = (req, res, next) => {
    if(req.user) {
        next();
    } else {
        res.redirect("/failed");
    }
};

app.use(passport.initialize());
app.use(passport.session());

app.get("/", isLoggedId, (req, res) => {
    res.json({
        success: false,
        message: `already logged mr ${req.user.displayName}`
    })
});

app.get("/failed", (req, res) => {
    res.json({
        success: false,
        message: "you have failed to login"
    })
});

app.get("/good", isLoggedId, (req, res) => {
    console.log(req.user.id);
    res.json({
        success: true,
        message: `welcome mr ${req.user.displayName}`
    })
});

app.get('/google',
    passport.authenticate('google', { scope: ['profile', "email"] }));

app.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/failed' }),
    function(req, res) {
        // Successful authentication, redirect home.
        res.redirect('/good');
    });

app.get("/logout", (req, res) => {
    req.session = null;
    req.logout();
    res.redirect("/failed");
});
