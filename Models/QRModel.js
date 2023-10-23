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
  //  user: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'user',
  //   required: true,
  // },
   data: String,
   qrCodeImage: {
     type: String,
     required: true
   },
   QrUrl:{
     type: String,
     required: true
   },
   QrId:{
     type: String,
     required: true
   },
   additionalInfo:{
      Name:{
        type: String
      },
      BloodGroup:{
        type: String
      },
      age:{
        type: Number
      },
      user: {
        type: Schema.Types.ObjectId,
        ref: 'user'
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
          relation:{
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
          relation:{
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