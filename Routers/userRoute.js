const express = require('express')

const authRoute = express.Router();


const upload = require('../Middleware/multer.middleware');

const {isLoggedIn} = require('../Middleware/userAuth');

const {
       sendOtp,
       verifyOtp,
       activateUser,
       logout,
       editQr} = require('../Controllers/userController');



authRoute.post('/send-otp', sendOtp);
authRoute.post('/logout', logout);
authRoute.post('/verify-otp', verifyOtp);
authRoute.get('/activate-user', activateUser);
authRoute.get('/edit-qr', editQr)




module.exports = authRoute;