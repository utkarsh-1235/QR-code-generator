const userModel = require('../Models/userModel');
// const emailValidator = require('email-validator');
// const bcrypt = require('bcrypt');
// const crypto = require('crypto');
// const cloudinary = require('cloudinary');
const AppError = require('../Utils/error.util');
const twilio = require('twilio');
//const fs = require('fs/promises');
//const sendEmail = require('../Utils/sendmail.util.js');


// const cookieOptions = {
//   maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
//   httpOnly: true,
//   secure: true
// }

const Client = new twilio(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN);

/******************************************************
   * @login
   * @route /api/auth/user
   * @method GET
   * @description retrieve user data from mongoDb if user is valid(jwt auth)
   * @returns User Object
   ******************************************************/
  
const sendOtp = async (req, res, next) => {
  
  try {
    const {phoneNumber } = req.body;
  
    console.log(phoneNumber);

    if(!phoneNumber){
       return next(new AppError('Phone number is required.', 400))
    }
     // Check if the user with the given phone number already exists
     const existingUser = await userModel.findOne({ phoneNumber });

     if (!existingUser) {
        // If the user does not exist, create a new user with the phone number
        const newUser = new userModel({ phoneNumber });
        await newUser.save();
     }

    Client.verify.services(process.env.VERIFY_SERVICE_SID)
    .verifications
    .create({to: phoneNumber, channel: 'sms'})
    .then((verification)=>{
      console.log(verification.status);
      res.status(200).json({
        success:true,
        message:'OTP sent successfully.'
      });
      
    })
      .catch((err)=>{
        console.log(err);
        return next(new AppError(err, 500));
      })
    
    
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};


const verifyOtp = async(req, res, next)=>{
    const phoneNumber = req.body.phoneNumber;
    const otpCode = req.body.otpCode;
          console.log(phoneNumber, otpCode);
    if(!phoneNumber || !otpCode){
      return next(new AppError('Phone number and OTP code are required.',400));
    }
    

    Client.verify.v2.services(process.env.VERIFY_SERVICE_SID)
    .verificationChecks
    .create({ to: phoneNumber, code: otpCode})
    .then((verificationCheck) =>{
       console.log(verificationCheck.status);
      
       if(verificationCheck.status === 'approved'){
        return res.status(200).json({
           success: true,
           message: 'Otp verification successful.'
        });
       }
       else{
        return next(new AppError('Incorrect OTP. Please try again.',401));
       }
    })
    .catch((err)=>{
      return next(new AppError('Failed to verify OTP.', 500))
    })
}
  /******************************************************
   * @LOGOUT
   * @route /api/auth/logout
   * @method GET
   * @description Remove the token form  cookie
   * @returns logout message and cookie without token
   ******************************************************/
  
  const logout =  (req, res) => {
    res.cookie('token', null, {
      secure: true,
      maxAge: 0,
      httpOnly: true
    });

    res.status(200).json({
      success: true,
      message: 'User logged out successfully'
    })
  };

module.exports = {
    sendOtp,
    logout,
    verifyOtp
}