const QRModel = require('../Models/QRModel');
const userModel = require('../Models/userModel');
const AppError = require('../Utils/error.util');
const twilio = require('twilio');
const mongoose = require('mongoose');
const PhoneNumber = require('libphonenumber-js');


/******************************************************
   * @login
   * @route /api/auth/user
   * @method GET
   * @description retrieve user data from mongoDb if user is valid(jwt auth)
   * @returns User Object
   ******************************************************/
  
const Client = new twilio(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN); // Twilio client setup

const sendOtp = async (req, res, next) => {
  try {
    const { countryCode, phoneNumber} = req.body;
    console.log(phoneNumber);
    console.log(countryCode);

    if (!phoneNumber || ! countryCode) {
      return next(new AppError('Both Country code and Phone Number required.', 400));
    }
   
    // Normalize the country code to the two-letter ISO country code
// Normalize the country code
const normalizedCountryCode = countryCode.replace('+', '');

// Ensure the country code is in the correct format
if (!/^\d+$/.test(normalizedCountryCode)) {
  return next(new AppError('Invalid country code.', 400));
}

// Format the phone number to E.164 format
const formattedPhoneNumber = `+${normalizedCountryCode}${phoneNumber}`;
       

    // Check if the user with the given phone number already exists
    const existingUser = await userModel.findOne({ phoneNumber: phoneNumber });
//    console.log("ExistingUser", existingUser);
       
let newUser;
    if (!existingUser) {
      // If the user does not exist, create a new user with the phone number
       newUser = new userModel({
        phoneNumber: phoneNumber,
        countryCode: countryCode
      });

      await newUser.save();
    }
      // Continue with sending the OTP
      Client.verify.v2.services(process.env.VERIFY_SERVICE_SID)
        .verifications
        .create({ to: formattedPhoneNumber, channel: 'sms', validity_period: 600 })
        .then((verification) => {
          console.log(verification.status);
          res.status(200).json({
            success: true,
            message: 'OTP sent successfully.',
            newUser
          });
        
        })
        .catch((err) => {
          console.error(err);
          return next(new AppError(`Error${err}`, 404));
        });
      
    
  } catch (err) {
    console.error(err);
    return next(new AppError('Failed to send OTP.', 500));
  }
}


 const resendOtp = async (req, res, next) => {
  try {
    const { countryCode, phoneNumber } = req.body;

    if (!countryCode || !phoneNumber) {
      return next(new AppError('Country code and Phone Number is required.', 400));
    }

    // Normalize the country code to the two-letter ISO country code
// Normalize the country code
const normalizedCountryCode = countryCode.replace('+', '');

// Ensure the country code is in the correct format
if (!/^\d+$/.test(normalizedCountryCode)) {
  return next(new AppError('Invalid country code.', 400));
}

// Format the phone number to E.164 format
const formattedPhoneNumber = `+${normalizedCountryCode}${phoneNumber}`;
       

    // Check if the user with the given phone number already exists
    const existingUser = await userModel.findOne({ phoneNumber: phoneNumber });
      
    console.log(existingUser);

    if (!existingUser) {
      return next(new AppError('User not found.', 404));
    }

    if (!existingUser.verified) {
      // The user is not verified, send a new OTP
      Client.verify.v2.services(process.env.VERIFY_SERVICE_SID)
        .verifications
        .create({ to: formattedPhoneNumber, channel: 'sms',validity_period: 600 })
        .then((verification) => {
          console.log(verification.status);
          res.status(200).json({
            success: true,
            message: 'OTP resent successfully.',
            phoneNumber: formattedPhoneNumber
          });
        })
        .catch((err) => {
          console.error(err);
          return next(new AppError('Failed to resend OTP.', 500));
        });
    } else {
      // The user is already verified, no need to resend OTP
      res.status(200).json({
        success: true,
        message: 'User is already verified.',
        phoneNumber: formattedPhoneNumber
      });
    }
  } catch (err) {
    console.error(err);
    return next(new AppError('Failed to resend OTP.', 500));
  }
}

const verifyOtp = async (req, res, next) => {
  
  const {phoneNumber, countryCode, otp} = req.body;
   console.log(phoneNumber);
    console.log(otp);
  if (!phoneNumber || !countryCode || !otp) {
    return next(new AppError(' Phone Number and OTP code are required.', 400));
  }
  const normalizedCountryCode = countryCode.replace('+', '');

  // Ensure the country code is in the correct format
  if (!/^\d+$/.test(normalizedCountryCode)) {
    return next(new AppError('Invalid country code.', 400));
  }
  
  // Format the phone number to E.164 format
  const formattedPhoneNumber = `+${normalizedCountryCode}${phoneNumber}`;
    
  const user = await userModel.findOne({ phoneNumber: phoneNumber });

  // if(user.verified === true){
  //   return next(new AppError('Already verified',401));
  // }
  Client.verify.v2.services(process.env.VERIFY_SERVICE_SID)
    .verificationChecks
    .create({ to: formattedPhoneNumber, code: otp })
    .then(async (verificationCheck) => {
      if (verificationCheck.status === 'approved') {
        // Update the user's verified status in the database
    
        
          if(user){
            // user.verified = true;
            await user.save();
          }
          console.log(user);
        return res.status(200).json({
          success: true,
          message: 'OTP verification successful.',
          phoneNumber: formattedPhoneNumber,
          otp,
          // verified: true,
        });
      } else {
        return next(new AppError('Incorrect OTP. Please try again.', 401));
      }
    })
    .catch((err) => {
      return next(new AppError(`ERROR${err}`, 500));
    });
}

const userExist = async(req, res, next)=>{
  try{
    const { countryCode, phoneNumber } = req.body;

    if (!countryCode || !phoneNumber) {
      return next(new AppError('Country code and Phone Number is required.', 400));
    }
  
    // Normalize the country code to the two-letter ISO country code
  // Normalize the country code
  // const normalizedCountryCode = countryCode.replace('+', '');
  
  // // Ensure the country code is in the correct format
  // if (!/^\d+$/.test(normalizedCountryCode)) {
  // return next(new AppError('Invalid country code.', 400));
  // }
  
  // // Format the phone number to E.164 format
  // const formattedPhoneNumber = `+${normalizedCountryCode}${phoneNumber}`;
       
  
    // Check if the user with the given phone number already exists
    const existingUser = await userModel.findOne({ phoneNumber: phoneNumber});
      
    console.log(existingUser);
    if(existingUser.verified){
      console.log("user verified")
      return res.status(200).json({
        success: true,
        message: "user already exist",
        existingUser
      })
    }
    else if (!existingUser.verified){
      console.log("user not verified")
      return res.status(200).json({
        success: false,
        message: "user not exist",
        existingUser
     })
    }
     
  }
  catch(err){
     return next(new AppError(`ERROR${err}`,500));
  }

}

const register = async(req, res, next)=>{
  try{
        
    const {countryCode, phoneNumber, name, email} = req.body;
    console.log(phoneNumber, name, email);

    if(!countryCode || !phoneNumber || !name){
      return next(new AppError('country code ,phone number and name required',400));

    }

  //   const normalizedCountryCode = countryCode.replace('+', '');

  // // Ensure the country code is in the correct format
  // if (!/^\d+$/.test(normalizedCountryCode)) {
  //   return next(new AppError('Invalid country code.', 400));
  // }
  
  // // Format the phone number to E.164 format
  // const formattedPhoneNumber = `+${normalizedCountryCode}${phoneNumber}`;

  const updateUser = await userModel.findOneAndUpdate(
    { phoneNumber: phoneNumber },
    { name: name, email: email, verified:true }
  );
    
   await updateUser.save();

   if (!updateUser) {
    return next(new AppError('You are not permitted to come to this page; go back', 401));
  }
  
   return res.status(200).json({
     success: true,
     message: 'You are successfully registered'
   })
  }
  catch(err){
    return next(new AppError(`ERROR${err.message}`,500))
  }
    
}

module.exports = {
    sendOtp,
    resendOtp,
    verifyOtp,
    userExist,
    register
}