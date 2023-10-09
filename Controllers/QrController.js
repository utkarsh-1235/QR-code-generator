//const express = require('express');
const QRCode = require('qrcode');
//onst mongoose = require('mongoose');
const QRCodeModel = require('../Models/QRModel');
const AppError = require('../Utils/error.util')

//const app = express();

const generateQr =  async (req, res, next) => {
    
    try {
      for (let i = 1; i <= 100; i++) {
        const data = `QR Code ${i}`;
        const qrCodeImage = `qrcodes/qr_code_${i}.png`;
  
        // Generate QR code
        await QRCode.toFile(qrCodeImage, data);
  
        // Save QR code data to the database
        const qrCode = new QRCodeModel({
          data,
          qrCodeImage,
        });
        await qrCode.save();
        console.log(`QR Code ${i} saved to the database.`);
        
      }
  
      //mongoose.disconnect();
      res.status(200).json({
        success: true,
        message: `All QR codes generated and stored successfully.`,
        
      })
      
    } catch (err) {
      return (next(new AppError(err.message, 500)));
    }
  }

// mongoose.connect('mongodb://localhost:27017/qrCodes', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// }).then(() => {
//   console.log('Connected to database');
//   app.listen(3000, () => {
//     console.log('Server started on port 3000');
//   });
// }).catch((err) => {
//   console.error(err);
// });
module.exports = {generateQr}