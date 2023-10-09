const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const QRSchema = new Schema({
   codeImage:{
      type: String,
      required: true
   },
   associatedData:{
    type: Object,
    required: true
   },

},
  {timestamps: true})

const QRModel = model('qr', QRSchema);
module.exports = QRModel;