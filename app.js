const express = require('express');
const app = new express();
 const userAuthRoute = require('./Routers/userRoute');
 const cookieParser = require('cookie-parser');
 const bodyParser = require('body-parser');
 const cors = require('cors');
 const path = require('path');
 const morgan = require('morgan');
const QrRoute = require('./Routers/QrRoute');
 const errorMiddleware = require('./Middleware/errorMiddleware');
 const AppError = require('./Utils/error.util');
 const QRModel = require('./Models/QRModel')
 const userModel = require('./Models/userModel')
// const paymentRoute = require('./Route/paymentRoute');

const twilio = require('twilio');
//const PhoneNumber = require('libphonenumber-js');

app.use(express.json()); // Built-in middleware

// Parse JSON requests
app.use(bodyParser.json());

app.use(express.urlencoded({ extended: false }));

app.use(cors({ origin: [process.env.CLIENT_URL], credentials: true })); //Third-party middleware

app.use(cookieParser());   // Third-party middleware

 app.use(morgan('dev'));

 app.use((req, res, next) => {
    console.log('Request Payload:', req.body);
    next();
  });

 //auth route
 const Client = new twilio(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN); // Twilio client setup
 app.post('/api/v1/users/send-otp',async (req, res, next) => {
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
    const existingUser = await userModel.findOne({ phoneNumber: formattedPhoneNumber });
    console.log("ExistingUser", existingUser);

    if (!existingUser) {
      // If the user does not exist, create a new user with the phone number
      const newUser = new userModel({
        phoneNumber: phoneNumber,
        countryCode: countryCode
      });

      await newUser.save();

      // Continue with sending the OTP
      Client.verify.v2.services(process.env.VERIFY_SERVICE_SID)
        .verifications
        .create({ to: formattedPhoneNumber, channel: 'sms' })
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
      }
    
  } catch (err) {
    console.error(err);
    return next(new AppError('Failed to send OTP.', 500));
  }
}
)

app.post('/api/v1/users/resend-otp', async (req, res, next) => {
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
    const existingUser = await userModel.findOne({ phoneNumber });

    if (!existingUser) {
      return next(new AppError('User not found.', 404));
    }

    if (!existingUser.verified) {
      // The user is not verified, send a new OTP
      Client.verify.v2.services(process.env.VERIFY_SERVICE_SID)
        .verifications
        .create({ to: formattedPhoneNumber, channel: 'sms' })
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
});

app.post("/api/v1/users/verify-otp",async (req, res, next) => {
  
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
    
  Client.verify.v2.services(process.env.VERIFY_SERVICE_SID)
    .verificationChecks
    .create({ to: formattedPhoneNumber, code: otp })
    .then(async (verificationCheck) => {
      if (verificationCheck.status === 'approved') {
        // Update the user's verified status in the database
        const user = await userModel.findOne({ phoneNumber });
        console.log(user);
          if(user){
            user.verified = true;
            await user.save();
          }
        
        return res.status(200).json({
          success: true,
          message: 'OTP verification successful.',
          phoneNumber,
          otp,
          verified: true,
        });
      } else {
        return next(new AppError('Incorrect OTP. Please try again.', 401));
      }
    })
    .catch((err) => {
      return next(new AppError(`ERROR${err}`, 500));
    });
}
)
 app.post('/api/v1/users/activate/:qrId', async (req, res, next) => {
    console.log(req.body);
    const QrId = req.params.qrId;
    const {Name, age, BloodGroup, preMedicalInfo, EmergencyContact } = req.body;
  
    console.log(Name, age, BloodGroup, preMedicalInfo, EmergencyContact);
  
    if (!QrId || !Name || !age || !BloodGroup || !preMedicalInfo || !EmergencyContact ) {
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
        age,
        BloodGroup,
        preMedicalInfo,
        //vehicleNumber,
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
  });

  app.post('/api/v1/users/check-qr-allotment', async(req, res, next) => {
    try{
      const qrId = req.body.userID;
  console.log(qrId);
    // Search for the user with the provided ID in the 'users' array
    const user = await QRModel.findOne({QrId:qrId});
    if (user) {
      console.log(user.additionalInfo);
      
      if(user.additionalInfo.name && user.additionalInfo.age){
        return res.status(200).json({
          success: true,
          message: " Sorry user already allotted",
          user: user
        })
        }
        else if(!user.additionalInfo){
          return res.status(401).json({
            success: false,
            message: "Yes you can fill the detail"
          })
        }
      
    } 
}
    catch(err){
       next(new AppError(err.message, 500))
    }
  })


  app.patch('api/v1/users/edit-qr',async (req, res, next) => {
    const QrId = req.params.qrId;
    const {Name, age, BloodGroup, preMedicalInfo, EmergencyContact, vehicleNumber } = req.body;
  
    if (!QrId && !Name && !age && !BloodGroup && !preMedicalInfo && !EmergencyContact && !vehicleNumber) {
      return next(new AppError('Give Information to edit', 400));
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
        age,
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
  })
 //qr Route
 app.use('/api/v1/qr',QrRoute);

const static_path = path.join(__dirname, '../client');
app.use(express.static(static_path));
// console.log(path.join(__dirname));

app.all('*',(req, res)=>{
    res.status(400).json('OOPS 404 not found')
})

app.use(errorMiddleware);

module.exports = app;