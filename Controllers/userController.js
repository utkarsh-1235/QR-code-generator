const userModel = require('../Models/userSchema.js');
const emailValidator = require('email-validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const cloudinary = require('cloudinary');
const AppError = require('../Utils/error.utils.js');
const fs = require('fs/promises');
const sendEmail = require('../Utils/sendmail.util.js');


const cookieOptions = {
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  httpOnly: true,
  secure: true
}
/******************************************************
 * @Register
 * @route /api/auth/signup
 * @method POST
 * @description singUp function for creating new user
 * @body name, email, password, confirmPassword
 * @returns User Object
 ******************************************************/

const register = async(req, res, next)=>{
    const {fullName, email, password, avatar, role } = req.body;
    console.log(fullName, email, password, role);

      /// every field is required
    if(!fullName || !email || !password || !role){
        return next(new AppError("Every field is required", 400));
    }
    const userExists = await userModel.findOne({ email});

    if(userExists){
       return next( new AppError("Email already exists", 400));
    }

    const user = await userModel.create({
       fullName,
       email,
       password,
       avatar: {
         public_id: email,
         secure_url: "https://res.cloudinary.com/du9jzqlpt/image/upload/v1674647316/avatar_drzgxv.jpg"
       },
       role

    });

    if(!user){
      return next(new AppError('User registration failed, please try again', 400));
    }
        
    console.log('File Details > ', JSON.stringify(req.file));
    if(req.file){
      try{
        const result = await cloudinary.v2.uploader.upload(req.file.path, {
            folder: 'lms',
            width: 100,
            height: 100,
            gravity: 'faces',
            crop: 'fill'
        });
        console.log(result);

        if(result) {
          user.avatar.public_id = result.public_id;
          user.avatar.secure_url = result.secure_url;

          // Remove file from server
          fs.rm(`uploads/${req.file.filename}`)
        }
      await user.save();
      }
      catch(e){
        return next(new AppError(e || 'File not uploaded, please try again',500 ))
      }
    }
    await user.save();

    user.password = undefined;

    const token = await user.jwtToken();

    res.cookie('token', token, cookieOptions)

    res.status(201).json({
      success: true,
      message: 'User registered successfully', 
      user,
    })
     
  };


/******************************************************
   * @login
   * @route /api/auth/user
   * @method GET
   * @description retrieve user data from mongoDb if user is valid(jwt auth)
   * @returns User Object
   ******************************************************/
  
const login = async (req, res, next) => {
  
  try {
    const {email, password } = req.body;
  
    console.log(email, password);

    if(!email || !password){
      return next(new AppError('All fields are required', 400));
    }
    const user = await userModel.findOne({
      email
    }).select('+password');

    if(!user || !user.comparePassword(password)){
      return next(new AppError('Email or password does not match', 400));
    }

    const token = await user.jwtToken();
     user.password = undefined;

     res.cookie('token', token, cookieOptions);

     res.status(200).json({
      success: true,
      message: 'User loggedin successfully',
      user
     });
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};


  /******************************************************
   * @LOGOUT
   * @route /api/auth/logout
   * @method GET
   * @description Remove the token form  cookie
   * @returns logout message and cookie without token
   ******************************************************/
  
  const logout =  (req, res) => {
    res.cookie('token', null, {
      secure: true,
      maxAge: 0,
      httpOnly: true
    });

    res.status(200).json({
      success: true,
      message: 'User logged out successfully'
    })
  };

  /************
   * @GetUserProfile
   * @route /
   * @method Get
   * @description get the user profile
   */

  const getprofile = async(req, res, next)=>{
     try{
       const userId = req.user.id;
       const user = await userModel.findById(userId);
          
       console.log(user);
       res.status(200).json({
        success: true,
        message: 'User details',
        user
       });
     } catch(e){
      return next(new AppError('Failed to fetch profile',500));
     }
  };
/******************************************************
 * @FORGOTPASSWORD
 * @route /api/auth/forgotpassword
 * @method POST
 * @description get the forgot password token
 * @returns forgotPassword token
 ******************************************************/

const forgotPassword = async (req, res, next) => {
    const {email} = req.body;
    console.log(email);
    // return response with error message If email is undefined
    if (!email) {
      return next(new AppError('Email is required', 400));
    }

    // retrieve user using given email.
    const user = await userModel.findOne({
      email
    });
  
    // return response with error message user not found
    if(!user){
      return next(new AppError('user not found 🙅',400));
    }

    // generate reset password token with userSchema method getResetPasswordToken()
    const resetToken = await user. getForgotPasswordResetToken()
      await user.save();
  
      const resetPasswordUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
      console.log(resetPasswordUrl);

      const subject = 'Reset Password';
    const message = `You can reset your password by clicking <a href=${resetPasswordUrl} target="_blank">Reset your password</a>\nIf the above link does not work for some reason then copy paste this link in new tab ${resetPasswordUrl}.\n If you have not requested this, kindly ignore.`;

      try{
          await sendEmail(email, subject, message);
          return res.status(201).json({
         success: true,
         message: `Reset password token has been sent to ${email} successfully`
       })
       
      }
      catch(err){
        user.forgotPasswordExpiry = undefined;
           user.forgotPasswordToken = undefined;

           await user.save();
           return next(new AppError(err.message,500));
      }
    } 
  



  /******************************************************
   * @RESETPASSWORD
   * @route /api/auth/resetpassword/:token
   * @method POST
   * @description update password
   * @returns User Object
   ******************************************************/
  
  const resetPassword = async (req, res, next) => {
    const { resetToken } = req.params;
    const { password } = req.body;
  
    
    
    const forgotPasswordToken = crypto.createHash("sha256").update(token).digest("hex");
  
    try {
      const user = await userModel.findOne({
        forgotPasswordToken,
        forgotPasswordExpiryDate: {
          $gt: Date.now()
        }
      });
  
      // return the message if user not found
      if (!user) {
        return next(new AppError("Invalid Token or token is expired", 400))
      }
  
      user.password = password;
      user.forgotpasswordToken = undefined;
      user.forgotpasswordExpiry = undefined;
      
      user.save();
  
      return res.status(200).json({
        success: true,
        message: "successfully reset the password"
      });
    } catch (error) {
      return next(new AppError(err.message,400));
    }
  };
  
  
const changePassword = async(req, res, next)=>{
    
  const {oldPassword, newPassword} = req.body;

  const {id} = req.user;

  if(!oldPassword || !newPassword){
    return next(
      new AppError('All fields are mandatory', 400)
  )
  }

  const user = await userModel.findById(id).select('+password');

  if(!user){
    return next(
      new AppError('User does not exist', 400)
    )
}

const isPasswordValid = await user.comparePassword(oldPassword);

if(!isPasswordValid){
  return next(new AppError('Invalid old password', 400))
}
user.password = newPassword;

await user.save();

user.password = undefined;

res.status(200).json({
  success: true,
  message: 'password changed successfully!',
  
});
}

const updateUser = async(req, res, next)=>{
   const {fullName, role} = req.body;
   const id = req.user.id;

   const user = await userModel.findById(id);
     

   if(!user){
    return next(new AppError('User does not exist', 400))
   }
    
    // Update user data
    user.fullName = fullName;
    user.role = role;

  if(req.file){
    await cloudinary.v2.uploader.destroy(user.avatar.public_id);

    try{
      const result = await cloudinary.v2.uploader.upload(req.file.path, {
        folder: 'lms',
        width: 250,
        height: 250,
        gravity: 'faces',
        crop: 'fill'
      });
      if(result) {
        user.avatar.public_id = result.public_id;
        user.avatar.secure_url = result.secure_url;

        // Remove file from server
        fs.rm(`uploads/${req.file.filename}`)
          await user.save();
        }
        
   }
   catch(err){
    return next(
      new AppError(e || 'File not uploaded, please try again', 500)
  )
   }
}
await user.save();
console.log(user);
res.status(200).json({
  success: true,
  message: 'User details updated successfully!',
  user
});
} 

const getAllUser = async(req, res, next)=>{
    
  try{
    const users = await userModel.find();

    if(!users){
      return next(new AppError("No any user"),400)
    }
    console.log(users);
     res.status(200).json({
      success: true,
      message: "sucessfully fetched all users",
      users
    })
  }
  catch(err){
     return next(new AppError(err.message, 500))
  }
  
}
module.exports = {register,
                  login, 
                  logout,
                  getprofile,
                  forgotPassword,
                  resetPassword,
                  changePassword,
                  updateUser,
                  getAllUser              
                  
                  }