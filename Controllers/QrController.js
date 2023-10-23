const QRCode = require('qrcode');
const QRModel = require('../Models/QRModel');
const AppError = require('../Utils/error.util');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const shortid = require('shortid'); // Import the shortid library
const Jimp = require('jimp');
const userModel = require('../Models/userModel');

const generateQr = async (req, res, next) => {
  try {
    const {countryCode, phoneNumber } = req.body;
    
    if (!phoneNumber || !countryCode) {
      return next(new AppError('Phone Number and country code are required', 400));
    }
    
    const normalizedCountryCode = countryCode.replace('+', '');

// Ensure the country code is in the correct format
if (!/^\d+$/.test(normalizedCountryCode)) {
  return next(new AppError('Invalid country code.', 400));
}

// Format the phone number to E.164 format
const formattedPhoneNumber = `+${normalizedCountryCode}${phoneNumber}`;
     console.log(formattedPhoneNumber)   ;

    const permission = await userModel.findOne({phoneNumber: formattedPhoneNumber});
    console.log(permission);
    if (!permission ) {
      return next(new AppError("Unauthorized access", 401)); // Changed status code to 401 for unauthorized access
    }
    for (let i = 1; i <= 100; i++) {
      const uniqueID = shortid.generate(); // Generate a short unique object ID
      const qrCodeUrl = `http://localhost:4000/api/v1/qr/scan/${uniqueID}`;
      const options = {
        color: {
          dark: '#000000ff',
          light: '#ffffffff',
        },
      };
      

      // Generate QR code
      const data = `QR Code ${i}`;
      const qrCodeImage = `qrcodes/qr_code_${i}.png`;
       await QRCode.toFile(qrCodeImage,qrCodeUrl, options);

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
      const qrCode = new QRModel({
        data,
        qrCodeImage: cloudinaryResponse.secure_url, // Store the Cloudinary URL
        QrId: uniqueID, // Store the short unique object ID
        QrUrl:qrCodeUrl
      });
      await qrCode.save();

      // Remove the QR codes from the server
      fs.unlinkSync(qrCodeImage);
      fs.unlinkSync(qrCodeImageWithID);

      console.log(`QR Code ${i} with short unique object ID ${uniqueID} and associated url ${qrCodeUrl} saved to the database and uploaded to Cloudinary.`);
    }

    res.status(200).json({
      success: true,
      message: 'All QR codes generated, uploaded, and removed from the server successfully.',
    });
  } catch (err) {
    console.log(err)
    return next(new AppError(err.message, 500));
  }
};


 const scanQr = async (req, res, next) => {
  try {
    const qrId = req.params.qrId;
            console.log(qrId);
    // Find the QR code in the database
    const qrCode = await QRModel.findOne({ QrId: qrId });
        console.log(qrCode);
    if (!qrCode) {
      return next(new AppError('QR Not found',404));
    }

    if (qrCode.additionalInfo && qrCode.additionalInfo.Name && qrCode.additionalInfo.BloodGroup) {
      res.status(200).json({
        success: true,
        message: 'QR code is activated',
        userData: qrCode.additionalInfo
      });
    } else {
      return next(new AppError('QR not activated',201))
    }
  } catch (err) {
    console.error(err);
   return next(new AppError(`ERROR${err}`, 500))
  }
};

module.exports = { generateQr,
                   scanQr };
