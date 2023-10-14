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
    const { phoneNumber, role } = req.body;
    console.log(phoneNumber);

    if (!phoneNumber) {
      return next(new AppError('Phone Number required.', 400));
    }

    // Check if the user with the given phone number already exists
    const existingUser = await userModel.findOne({ phoneNumber });
    console.log("ExistingUser", existingUser);

    if (!existingUser) {
      // If the user does not exist, create a new user with the phone number
      const newUser = new userModel({
        phoneNumber, role
      });

      await newUser.save();

      // Continue with sending the OTP
      Client.verify.v2.services(process.env.VERIFY_SERVICE_SID)
        .verifications
        .create({ to: phoneNumber, channel: 'sms' })
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
          return next(new AppError('Failed to send OTP.', 500));
        });
    } else if (!existingUser.verified) {
      // Handle the case where the user exists but is not verified
      // You might choose to resend the OTP or return an error
      
      Client.verify.v2.services(process.env.VERIFY_SERVICE_SID)
    .verifications
    .create({ to: phoneNumber, channel: 'sms' })
    .then((verification) => {
      console.log(verification.status);
      res.status(200).json({
        success: true,
        message: 'OTP resent successfully.',
        phoneNumber
      });
    })
    .catch((err) => {
      console.error(err);
      return next(new AppError('Failed to resend OTP.', 500));
    });
    } else {
      // The user is already verified, return an appropriate response
      res.status(200).json({
        success: true,
        message: 'User is already verified.',
        phoneNumber
      });
    }
  } catch (err) {
    console.error(err);
    return next(new AppError('Failed to send OTP.', 500));
  }
};



 

const verifyOtp = async (req, res, next) => {
  const phoneNumber = req.body.phoneNumber;
  const otpCode = req.body.otpCode;

  if (!phoneNumber || !otpCode) {
    return next(new AppError('Phone number and OTP code are required.', 400));
  }

  Client.verify.v2.services(process.env.VERIFY_SERVICE_SID)
    .verificationChecks
    .create({ to: phoneNumber, code: otpCode })
    .then(async (verificationCheck) => {
      if (verificationCheck.status === 'approved') {
        // Update the user's verified status in the database
        const user = await userModel.findOne({ phoneNumber });
          if(user){
            user.verified = true;
            await user.save();
          }
        
        return res.status(200).json({
          success: true,
          message: 'OTP verification successful.',
          phoneNumber,
          otpCode,
          verified: true,
        });
      } else {
        return next(new AppError('Incorrect OTP. Please try again.', 401));
      }
    })
    .catch((err) => {
      return next(new AppError('Failed to verify OTP.', 500));
    });
};


const activateUser = async (req, res, next) => {
  const { QrId, Name, BloodGroup, preMedicalInfo, EmergencyContact, vehicleNumber } = req.body;

  console.log(Name, BloodGroup, preMedicalInfo, vehicleNumber, EmergencyContact);

  if (!QrId || !Name || !BloodGroup || !preMedicalInfo || !EmergencyContact || !vehicleNumber) {
    return next(new AppError('Enter all the required fields', 400));
  }

  try {
    // Find the QR code document by QrId (assuming it's unique)
    const qrCode = await QRModel.findOne({ QrId });
         
    console.log(qrCode);

    if (!qrCode) {
      return next(new AppError('QR code not found', 404));
    }

   if (qrCode.additionalInfo && qrCode.additionalInfo.Name && qrCode.additionalInfo.BloodGroup) {
  return next(new AppError('QR code has already been allotted', 400));
}

    
 //   const user = req.user; // Assuming you have the user object in the request
    qrCode.additionalInfo = {
      Name,
      BloodGroup,
      preMedicalInfo,
      vehicleNumber,
      EmergencyContact,
    };
;
    // Save the updated QR code document
    await qrCode.save();

    res.status(200).json({
      success: true,
      message: 'User activated successfully.',
      qrCode,
    });
  } catch (error) {
    console.error('Error in activating user:', error);
    return next(new AppError('Failed to activate user', 500));
  }
};


const editQr = async (req, res, next) => {
  const { QrId, Name, BloodGroup, preMedicalInfo, EmergencyContact, vehicleNumber } = req.body;

  if (!QrId && !Name && !BloodGroup && !preMedicalInfo && !EmergencyContact && !vehicleNumber) {
    return next(new AppError('Enter all the required fields', 400));
  }

  try {
    // Find the QR code document by ID
    const qrCode = await QRModel.findOne({ QrId: QrId });

    if (!qrCode) {
      return next(new AppError('QR code not found', 404));
    }

    // Update all fields
    qrCode.additionalInfo = {
      Name,
      BloodGroup,
      preMedicalInfo,
      vehicleNumber,
      EmergencyContact,
    };

    // Save the updated QR code document
    await qrCode.save();

    res.status(200).json({
      success: true,
      message: 'User edited successfully.',
      qrCode,
    });
  } catch (error) {
    console.error('Error editing user:', error);
    return next(new AppError('Failed to edit user', 500));
  }
};

  
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
    verifyOtp,
    activateUser,
    editQr,
    logout

}