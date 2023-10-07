const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const JWT = require('jsonwebtoken');
require('dotenv').config();

const userSchema = new Schema(
  {
    name: {
      type: String,
      require: [true, 'user name is Required'],
      minLength: [5, 'Name must be at least 5 characters'],
      maxLength: [50, 'Name must be less than 50 characters'],
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'user email is required'],
      unique: true,
      lowercase: true,
      unique: [true, 'already registered'],
      match: [/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      'Please fill in a valid email address',
    ]
    },
    password: {
      type: String,
      required: [true, 'password is required'],
      minLength:[8, 'password must be at least 8 characters'],
      select: false,
    },
    avatar: {
      public_id:{
        type: 'String'
      },
      secure_url: {
        type: 'String'
      }
    },
    role:{
      type: 'String',
      enum: ['USER', 'ADMIN', 'EDUCATOR'],
      required: true
    },
    forgotPasswordToken: {
      type: String,
    },
    forgotPasswordExpiryDate: {
      type: Date,
    },
    subscription:{
      id: String,
      status: String
    }
  },
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
