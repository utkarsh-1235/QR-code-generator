//const express = require('express');
const QRCode = require('qrcode');
//onst mongoose = require('mongoose');
const QRCodeModel = require('../Models/QRModel');

//const app = express();

const generateQr =  async (req, res) => {
    
  try {
    const qrCodes = [];
    const promises = [];

    for (let i = 0; i < 100; i++) {
      const data = `QR code ${i}`;
      const qrCode = await QRCode.toDataURL(data);
      qrCodes.push(qrCode);

      const qrCodeModel = new QRCodeModel({
        codeImage: qrCode,
        associatedData: { id: i },
      });

      promises.push(qrCodeModel.save());
    }

    await Promise.all(promises);

    res.status(200).json({
      success: true,
      message: 'QR codes generated and saved successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error generating and saving QR codes',
    });
  }
};

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