import sanitize from "mongo-sanitize";
import asyncHandler from "../middlewares/asyncHandler.js";
import { loginSchema, registerSchema } from "../config/zod.js";
import { redisClient } from "../index.js";
import { User } from "../models/User.js";
import bcrypt from "bcrypt";
import crypto from "crypto"
import sendMail from "../config/sendMail.js";
import { getOtpHtml, getVerifyEmailHtml } from "../config/html.js";
import { email } from "zod";
import { generateToken } from "../config/generateToken.js";



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
      message:"Too many requests, try again later",
    })
  }

  // then finding user with email is exist or not  in the data base 
  const existingUser = await User.findOne({email})

  // if it exist then we return response 
  if(existingUser){
    return res.status(400).json({
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
  res.json({
    message:"A verification link  send to your email it will expire in 5 minutes",
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

  const ratelimitKey = `login-rate-limit:${req.ip}:${email}`;

  if(await redisClient.get(ratelimitKey)){
    return res.status(400).json({
      message:"Too many requests, try again later",
    })
  }

  const user = await User.findOne({email})

  if(!user){
    return res.status(400).json({
      message:"Invalid Cradentials",
    })
  }

  const isPasswordMatch = await bcrypt.compare(password,user.password)

  if(!isPasswordMatch){
    return res.status(400).json({
      message:"Invalid Cradentials",
    })
  }

  const otp = Math.floor(100000 + Math.random()* 900000).toString();

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

  const user = await User.findOne({email})

  const {acessToken,refreshToken} = await generateToken(user._id,res)

  res.status(200).json({
    message:`Welcome ${user.name}`,
  })

})