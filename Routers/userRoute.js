const express = require('express')

const authRoute = express.Router();


const upload = require('../Middleware/multer.middleware');

const {isLoggedIn} = require('../Middleware/userAuth');

const {
       sendOtp,
       verifyOtp,
       activateUser,
       logout,
       editQr,
       checkQr} = require('../Controllers/userController');



authRoute.post('/send-otp', sendOtp);
authRoute.post('/logout', logout);
authRoute.post('/verify-otp', verifyOtp);

authRoute.route('/')
          .post(checkQr,
                activateUser)
          .get(checkQr,
               editQr)





module.exports = authRoute;