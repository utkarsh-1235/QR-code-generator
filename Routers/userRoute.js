const express = require('express')

const authRoute = express.Router();


// const upload = require('../Middleware/multer.middleware');



const {
       sendOtp,
       verifyOtp,
       activateUser,
       logout,
       editQr} = require('../Controllers/userController');
const checkQr = require('../Middleware/checkmiddleware');



authRoute.post('/send-otp', sendOtp);
authRoute.post('/logout', logout);
authRoute.post('/verify-otp', verifyOtp);

authRoute.route('/activate/:qrId')
          .post(//checkQr,
                activateUser)
          .patch(//checkQr,
               editQr)





module.exports = authRoute;