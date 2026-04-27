const r=require('express').Router();
const c=require('../controllers/authController');
const {protect}=require('../middleware/auth');



r.post('/signup',         c.signup);
r.post('/login',          c.login);
r.post('/verify-otp',     c.verifyOTP);
r.post('/resend-otp',     c.resendOTP);
r.post('/forgot-password',c.forgotPassword);
r.post('/reset-password', c.resetPassword);
r.get('/me',              protect, c.getMe);
module.exports=r;
