import sanitize from "mongo-sanitize";
import asyncHandler from "../middlewares/asyncHandler.js";
import { loginSchema, registerSchema } from "../config/zod.js";
import { redisClient } from "../index.js";
import { User } from "../models/User.js";
import bcrypt from "bcrypt";
import crypto from "crypto"
import sendMail from "../config/sendMail.js";
import { getOtpHtml, getVerifyEmailHtml } from "../config/html.js";
import { generateAccessToken, generateToken, revokeRefreshToken, verifyRefresh } from "../config/generateToken.js";
import { read } from "fs";
import {generateCsrfToken, refreshCsrfToken, revokeCsrfToken} from "../config/csrfToken.js";
import cloudinary from "../config/cloudinary.js";
import DataURIParser from "datauri/parser.js";
import path from "path";
import {getBuffer} from "../config/getBuffer.js";
import { success } from "zod";






export const registerUser = asyncHandler(async(req,res) => {
  //1. We senitize our request body to make sure no SQL injection make no impact on mr server
  const senitizeBody = sanitize(req.body);

  // 2nd step we validate data with help of zod 
  const validation = registerSchema.safeParse(senitizeBody);

  // 3rd step we check if validation is not success then we prepare coustome response with help of zod and send in response 
  if(!validation.success){
    let zodError = validation?.error
    let firstError = 'Validation Failed'
    let allError =[]
    
    if(zodError?.issues && Array.isArray(zodError.issues)){
      allError = zodError.issues.map((issue) => (
        {
          field:issue?.path.join('.'),
          message:issue?.message || firstError,
          code:issue
          .code
        }
      )) 
      firstError = allError[0]?.message || 'Validation failed'
    } 
    return res.status(400).json({
      success:false,
      message:firstError,
      errors:allError
    })
  }

  // extracting data from zod validated data 
  const {name,email,password} = validation.data;


  // make ratelimitKey for rate limiting with ip and email 
  const reteLimitKey = `register-rate-limit:${req.ip}:${email}`;

  // checking if ratelimit key is present in redis and its true then send response 
  if(await redisClient.get(reteLimitKey)){
    return res.status(400).json({
      success:false,
      message:"Too many requests, try again later",
    })
  }

  // then finding user with email is exist or not  in the data base 
  const existingUser = await User.findOne({email})

  // if it exist then we return response 
  if(existingUser){
    return res.status(400).json({
      success:false,
      message:"User already exist",
    })
  }

  // then we hash password 
  const hashPassword = await bcrypt.hash(password,10);

  // and create  a verification token 
  const verifyToken = crypto.randomBytes(32).toString('hex');

  // and also make a verify key for redis 
  const verfyKey = `verify:${verifyToken}`;

  // then preparre a data that store in redis 
  const dataStore = JSON.stringify({
    name,
    email,
    password:hashPassword,
  })

  // set data in redis
  await redisClient.set(verfyKey,dataStore,{
    EX:300
  })

  // create subject for send mail to user 
  const subject = 'verify your email for Account creation';

  // create html for mail 
  const html = getVerifyEmailHtml(email,verifyToken); 

  // send mail
  await sendMail({
    email,
    subject,
    html
  })

  // and now after sending the mail we set ratelimit key to redis for 60 second.
  await redisClient.set(reteLimitKey,'true',{
    EX:70
  })
  
  // sending response 
  res.status(200).json({
    success:true,
    message:"Verification link sent to your email, Please verify your email",
  })
})

export const verifyUser = asyncHandler(async(req,res) => {
  const {token} = req.params

  if(!token){
    res.status(400).json({
      message:"Verification token is required"
    })
  }
  const verifyKey = `verify:${token}`;

  const userDataJson = await redisClient.get(verifyKey)

  if(!userDataJson){
    return res.status(400).json({
      message:'Verification link is expire'
    })
  }

  await redisClient.del(verifyKey)

  const userData = await JSON.parse(userDataJson)

  const isExist = await User.findOne({email:userData.email})
  if(isExist){
    return res.status(400).json({
      message:"User already exist please login"
    })
  }

  const newUser = User.create({
    name:userData.name,
    email:userData.email,
    password:userData.password
  })

  res.status(201).json({
    message:"Email verified sucessfully your accout has been created",
    user:{
      _id:(await newUser)._id,
      name:(await newUser).name,
      email:(await newUser).email,
      role:(await newUser).role,
    }
  })
})

export const loginUser = asyncHandler(async(req,res) => {
  const senitizeBody = sanitize(req.body)

  const validate = loginSchema.safeParse(senitizeBody)

  if(!validate.success){
    let zodError = validate?.error
    let firstError = 'Validation Error';
    let allError = []
    if(zodError?.issues && Array.isArray(zodError.issues)){
      allError = zodError.issues.map((issue)=>(
        {
          field:issue.path?.join('.'),
          message:issue.message || firstError,
          code:issue.code 
        }
      ))
      firstError = allError[0].message || "Validation Error"
      
    }
    return res.status(400).json({
      message : firstError,
      errors : allError
    })
  }

  const {email , password} = validate.data
  console.log(email,password);
  

  const ratelimitKey = `login-rate-limit:${req.ip}:${email}`;

  if(await redisClient.get(ratelimitKey)){
    return res.status(400).json({
      message:"Too many requests, try again later",
    })
  }

  const user = await User.findOne({email})
  console.log(user);
  

  if(!user){
    return res.status(400).json({
      message:"Invalid Cradentials",
    })
  }

  const isPasswordMatch = await bcrypt.compare(password,user.password)
  console.log('isPassword Match',isPasswordMatch);
  

  if(!isPasswordMatch){
    return res.status(400).json({
      message:"Invalid Cradentials",
    })
  }

  const otp = Math.floor(100000 + Math.random()* 900000).toString();
  console.log(otp);
  

  const otpKey = `otp:${email}`;
  await redisClient.set(otpKey,JSON.stringify(otp),{
    EX:300
  })

  const subject = "Otp for validation";
  const html = getOtpHtml(otp);

  await sendMail({
      email,
      subject,
      html
  })


  

  await redisClient.set(ratelimitKey,'true',{
    EX:60
  })
  res.json({
    message:"Otp send to your email, it will be valid for 5 minutes"
  })
})

export const reSendOtp = asyncHandler(async(req,res) => {
  const email  =req.body.email
  console.log(email);
  

  await redisClient.del(`otp:${email}`)

  const otp = Math.floor(100000 + Math.random()* 900000).toString();

  const ratelimitKey = `login-rate-limit:${req.ip}:${email}`;
  const otpKey = `otp:${email}`;
  await redisClient.set(otpKey,JSON.stringify(otp),{
    EX:300
  })
    const subject = "Otp for validation";
  const html = getOtpHtml(otp);

  await sendMail({
    email,
    subject,
    html
  })

  await redisClient.set(ratelimitKey,'true',{
    EX:60
  })
  res.json({
    message:"Otp send to your email, it will be valid for 5 minutes"
  })
})

export const verifyOtp = asyncHandler(async(req,res) => {
  const {email,otp} = req.body
  if(!email ||!otp){
    return res.status(400).json({
      message:"Otp is required"
    })
  }

  const otpkey = `otp:${email}`
  const storedOtpString = await redisClient.get(otpkey)

  if(!storedOtpString){
    return res.status(400).json({
      message:"Otp is expire"
    })
  }
  const storeOtp = await JSON.parse(storedOtpString)

  if(storeOtp !== otp){
    return res.status(400).json({
      message:"Invalid Otp"
    })
  }

  await redisClient.del(otpkey)

  const user = await User.findOne({email}).select('-password');

 await generateToken(user._id,res)
 await redisClient.set(`user:${user._id}`,JSON.stringify(user))

  res.status(200).json({
    message:`Welcome ${user.name}`,
    user:user
  })

})

export const profile = asyncHandler(async(req,res) =>{

  const user = req.user;

  if(!user){
    return res.status(400).json({
      message:"User not found"
    })
  }
  return res.status(200).json({
    user:user
  })
})

export const editProfile = asyncHandler(async (req, res) => {
    const name = req.body.name;
    const profileImg = req.file
    const user = req.user;

    const dbUser = await  User.findOne({email:user.email})
    if(!dbUser){
        return res.status(400).json({
            message:"User not found"
        })
    }
    await  redisClient.del(`user:${dbUser._id}`)
    try {
        if(name){
            dbUser.name = name
        }
        if(profileImg){
            const formatData = getBuffer(profileImg)
            if(!formatData || !formatData.content){
                return res.status(400).json({
                    message:"Invalid Profile Image or error while uploading"
                })
            }
            const result = await cloudinary.uploader.upload(formatData.content,{
                folder: "/profileImg",
                resource_type: "image"
            })
            dbUser.profileImg = result.secure_url
            dbUser.publicId = result.public_id
        }
        await dbUser.save()
        await redisClient.set(`user:${dbUser._id}`,JSON.stringify(dbUser))

        return res.status(200).json({
            message:"Profile updated successfully",
            user:dbUser
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message:"Internal server error"
        })
    }

})

export const changePassword  = asyncHandler(async(req,res) => {
  const {oldPassword,newPassword} = req.body;
  if(!oldPassword || !newPassword){
    return res.status(400).json({
      success:false,
      message:'Old password and new password is required'
    })
  }
  if(oldPassword === newPassword){
    return res.status(400).json({
      success:false,
      message:'Old password and new password can not be same'
    })
  }

  if(newPassword.length < 8 || typeof newPassword !== 'string'){
    return res.status(400).json({
      success:false,
      message:'Password must be a string andat least 8 characters long'
    })
  }

  const user = req.user;

  const dbUser = await User.findById(user._id);

  if(!dbUser){
    return res.status(400).json({
      success:false,
      message:"User not found"
    })
  }

  await redisClient.del(`user:${dbUser._id}`)

  const isMatch = await bcrypt.compare(oldPassword,dbUser.password)

  if(!isMatch){
    return res.status(400).json({
      success:false,
      mesage:'Password not matched please enter correct password'
    })
  }

  const hashNewPassword = await bcrypt.hash(newPassword,10)
  dbUser.password = hashNewPassword;
  await dbUser.save();

  const userObj = dbUser.toObject()
  delete userObj.password

  await redisClient.set(`user:${dbUser._id}`,JSON.stringify(userObj))

  return res.status(200).json({
    success:true,
    message:"Password changed successfully"
  }) 
})

export const refreshToken =asyncHandler(async(req,res)=> {

  const refreshToken = req.cookies.refreshToken

  if(!refreshToken){
    return res.status(401).json({
      message:"No token found please login"
    })
  }
  const decode = await verifyRefresh(refreshToken)

  if(!decode){
    return res.status(401).json({
      message:"Invalid Refresh Token"
    })
  }

  generateAccessToken(decode.id,res)
  return res.status(200).json({
    message:"token Refresh"
  })
})

export const logout = asyncHandler(async(req,res) => {

  const userId = req.user._id

  await revokeRefreshToken(userId)
  await revokeCsrfToken(userId)

  res.clearCookie('accessToken')
  res.clearCookie('refreshToken')
  res.clearCookie('csrfToken')
  await redisClient.del(`user:${userId}`)
  return res.status(200).json({
    message:"Logout Successfully"
  })

})


export const refreshCSRFToken = asyncHandler(async(req,res) => {
    const userId = req.user._id
    console.log(userId)

    const newCsrfToken = await refreshCsrfToken(userId,res)

    return res.status(200).json({
        message:"CSRF token refresh",
        csrfToken: newCsrfToken
    })
})