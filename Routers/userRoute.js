const express = require('express')

const authRoute = express.Router();


const upload = require('../Middleware/multer.middleware');

const {isLoggedIn} = require('../Middleware/userAuth');

const {
       sendOtp,
       logout,
       verifyOtp} = require('../Controllers/userController');


authRoute.post('/send-otp', sendOtp);
authRoute.post('/logout', logout);
authRoute.post('/verify-otp', verifyOtp);




module.exports = authRoute;