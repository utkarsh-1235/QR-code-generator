const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const JWT = require('jsonwebtoken');
require('dotenv').config();

const userSchema = new Schema(
  {
    phoneNumber: {
      type: String,
      required: true,
  },
  
  verified: {
      type: Boolean,
      default: false,
   
  }},
  { timestamps: true }
);

// Hash password before saving to the database
userSchema.pre('save', async function (next) {
  // If password is not modified then do not hash it
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  return next();
});

// FIXME: Check if these methods are working as expected
userSchema.methods = {
  //method for generating the jwt token
  jwtToken: async function(){
    return await JWT.sign(
      { id: this._id, email: this.email, subscription: this.subscription, role: this.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY, } 
    );
  },
  comparePassword: async function(plainTextPassword) {
    return await bcrypt.compare(plainTextPassword, this.password);
},

  //userSchema method for generating and return forgotPassword token
  getForgotPasswordResetToken: async function() {
    const resetToken = crypto.randomBytes(20).toString('hex');
    //step 1 - save to DB
    this.forgotPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    /// forgot password expiry date
    this.forgotPasswordExpiry = Date.now() + 10 * 60 * 1000; // 10min

    //step 2 - return values to user
    return resetToken;
  },
};

const userModel = model('user', userSchema);
module.exports = userModel;
