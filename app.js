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
// const paymentRoute = require('./Route/paymentRoute');


app.use(express.json()); // Built-in middleware

// Parse JSON requests
//app.use(bodyParser.json());

//app.use(express.urlencoded({ extended: false }));

app.use(cors({ origin: [process.env.CLIENT_URL], credentials: true })); //Third-party middleware

app.use(cookieParser());   // Third-party middleware

 app.use(morgan('dev'));

 app.use((req, res, next) => {
    console.log('Request Payload:', req.body);
    next();
  });

 //auth route
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