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

// const paymentRoute = require('./Route/paymentRoute');


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

 app.use('/api/v1/users',userAuthRoute);

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