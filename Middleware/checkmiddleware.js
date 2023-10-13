const QRModel = require('../Models/QRModel')
const checkQr = async (req, res, next) => {
    const { QrId } = req.body;
  
    console.log('QrId', QrId);
  
    if (!QrId) {
      return next(new AppError('QR Id Required', 400));
    }
  
    try {
      // Check if a QR document with the provided QrId exists
      const existingQR = await QRModel.findOne({ QrId: QrId });
  
      if (!existingQR) {
        return next(new AppError('QR not exist of given Id', 404));
      }
  
      if (existingQR.additionalInfo.Name && existingQR.additionalInfo.BloodGroup) {
        return next(new AppError('Sorry QR already allotted', 400));
      }
  
      // Handle the remaining logic as needed
  
      // Update the QR model or perform other operations
  
      await existingQR.save();
  
      return res.status(200).json({
        success: true,
        message: 'Yes, you can fill your details',
      });
    } catch (err) {
      return next(new AppError(err.message, 500));
    }
  };
  
  module.exports = checkQr