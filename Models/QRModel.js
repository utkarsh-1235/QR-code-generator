const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const QRSchema = new Schema({
   // codeImage:{
   //    type: String,
   //    required: true
   // },
   // associatedData:{
   //  type: Object,
   //  required: true
   // },
   data: String,
   qrCodeImage: String,
   additionalInfo:{
      Name:{
        type: String
      },
      BloodGroup:{
        type: String
      },
      preMedicalInfo:{
        type: String
      },
      vehicleNumber:{
        type: String
      },
      EmergencyContact:{
        Contact1: {
          Name:{
            type: String
          },
          phoneNumber:{
            type: String
          }
        }, 
        Contact2: {
          Name:{
            type: String
          },
          phoneNumber:{
            type: String
          }
        }
      }
   }

},
  {timestamps: true})

const QRModel = model('qr', QRSchema);
module.exports = QRModel;