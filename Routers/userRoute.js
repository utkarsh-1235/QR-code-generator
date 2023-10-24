const express = require('express')

const authRoute = express.Router();


// const upload = require('../Middleware/multer.middleware');



const {
       sendOtp,
       verifyOtp,
       resendOtp} = require('../Controllers/userController');
const checkQr = require('../Middleware/checkmiddleware');



authRoute.post('/send-otp', sendOtp);
authRoute.post('/resend-otp',resendOtp);
authRoute.post('/verify-otp', verifyOtp);

         





module.exports = authRoute;