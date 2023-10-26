const express = require('express')

const authRoute = express.Router();


// const upload = require('../Middleware/multer.middleware');



const {
       sendOtp,
       verifyOtp,
       resendOtp,
       userExist,
       register} = require('../Controllers/userController');
const { editQr } = require('../Controllers/QrController');




authRoute.post('/send-otp', sendOtp);
authRoute.post('/resend-otp',resendOtp);
authRoute.post('/verify-otp', verifyOtp);
authRoute.post('/user-exist',userExist);
authRoute.post('/register', register);
authRoute.patch('/edit-qr',editQr);

         





module.exports = authRoute;