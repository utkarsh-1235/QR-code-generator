const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const QRSchema = new Schema({
    QrId:{
        type: String,
        required: true,
        trim : true
    },
    user:{
        type: Schema.Types.ObjectId,
        ref: 'users',
    }
},
  {timestamps: true})

const QRModel = model('qr', QRSchema);
module.exports = QRModel;