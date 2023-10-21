const QRCode = require('qrcode');
const QRCodeModel = require('../Models/QRModel');
const AppError = require('../Utils/error.util');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const shortid = require('shortid'); // Import the shortid library
const Jimp = require('jimp');
const userModel = require('../Models/userModel');

const generateQr = async (req, res, next) => {
  try {
    const { phoneNumber } = req.body;
    if (!phoneNumber) {
      return next(new AppError('Phone Number is required', 400));
    }
    
    // const permission = await userModel.findOne({phoneNumber});
    // if (!permission || (permission && permission.role !== "Admin")) {
    //   return next(new AppError("Unauthorized access", 401)); // Changed status code to 401 for unauthorized access
    // }
    for (let i = 1; i <= 100; i++) {
      const uniqueID = shortid.generate(); // Generate a short unique object ID

      // Generate QR code
      const data = `QR Code ${i}`;
      const qrCodeImage = `qrcodes/qr_code_${i}.png`;
      await QRCode.toFile(qrCodeImage, data);

      // Load the QR code image using Jimp
      const qrCodeJimp = await Jimp.read(qrCodeImage);

      // Overlay the unique object ID on the QR code
      qrCodeJimp.print(await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK), 10, 10, uniqueID);

      // Save the updated QR code with the unique object ID
      const qrCodeImageWithID = `qrcodes/qr_code_${i}_with_id.png`;
      await qrCodeJimp.writeAsync(qrCodeImageWithID);

      // Upload QR code with the unique object ID to Cloudinary
      const cloudinaryResponse = await cloudinary.uploader.upload(qrCodeImageWithID, {
        folder: 'QR',
        width: 100,
        height: 100,
      });

      // Save QR code data and Cloudinary URL to the database
      const qrCode = new QRCodeModel({
        data,
        qrCodeImage: cloudinaryResponse.secure_url, // Store the Cloudinary URL
        QrId: uniqueID, // Store the short unique object ID
      });
      await qrCode.save();

      // Remove the QR codes from the server
      fs.unlinkSync(qrCodeImage);
      fs.unlinkSync(qrCodeImageWithID);

      console.log(`QR Code ${i} with short unique object ID ${uniqueID} saved to the database and uploaded to Cloudinary.`);
    }

    res.status(200).json({
      success: true,
      message: 'All QR codes generated, uploaded, and removed from the server successfully.',
    });
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};


const scanQr = async (req, res) => {
  try {
      const qrData = req.params.qrData; // Extract QR code data or identifier from the request

      // Query the database to retrieve QR code information based on qrData
      const qrCodeInfo = await QRModel.findOne({ QrId: qrData });

      if (!qrCodeInfo) {
          return res.status(404).json({ error: 'QR code not found' });
      }

      res.json(qrCodeInfo); // Send the QR code information as a JSON response
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { generateQr,
                   scanQr };
