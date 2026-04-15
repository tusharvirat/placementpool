const r=require('express').Router();
const c=require('../controllers/authController');
const {protect}=require('../middleware/auth');
const express = require('express');
const app = express();


// //temp 
// const cors = require("cors");

// app.use(cors({
//   origin: "https://placepool.vercel.app",
//   methods: ["GET", "POST", "PUT", "DELETE"],
//   credentials: true
// }));




// //temp


r.post('/signup',         c.signup);
r.post('/login',          c.login);
r.post('/verify-otp',     c.verifyOTP);
r.post('/resend-otp',     c.resendOTP);
r.post('/forgot-password',c.forgotPassword);
r.post('/reset-password', c.resetPassword);
r.get('/me',              protect, c.getMe);
module.exports=r;
