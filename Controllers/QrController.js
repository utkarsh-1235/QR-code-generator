//const express = require('express');
const QRCode = require('qrcode');
//onst mongoose = require('mongoose');
const QRCodeModel = require('../Models/QRModel');
const AppError = require('../Utils/error.util')
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

//const app = express();

const generateQr = async (req, res, next) => {
  try {
    const{phoneNumber} = req.body;
    if(!phoneNumber){
      return next(new AppError('Phone Number is required'),400)
    }
    for (let i = 1; i <= 100; i++) {
      const data = `QR Code ${i}`;
      const qrCodeImage = `qrcodes/qr_code_${i}.png`;

      // Generate QR code
      await QRCode.toFile(qrCodeImage, data);

      // Upload QR code to Cloudinary
      const cloudinaryResponse = await cloudinary.uploader.upload(qrCodeImage,{
        folder: 'QR',
        width: 100,
        height: 100
      });

      // Save QR code data and Cloudinary URL to the database
      const qrCode = new QRCodeModel({
        data,
        qrCodeImage: cloudinaryResponse.secure_url, // Store the Cloudinary URL
      });
      await qrCode.save();
      console.log(`QR Code ${i} saved to the database and uploaded to Cloudinary.`);
      
      // Remove the QR code from the server
      // Use fs.unlinkSync to remove the file
      fs.unlinkSync(qrCodeImage);
    }

    res.status(200).json({
      success: true,
      message: 'All QR codes generated, uploaded, and removed from the server successfully.',
    });
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};


module.exports = {generateQr}