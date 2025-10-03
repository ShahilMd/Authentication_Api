import jwt from 'jsonwebtoken'
import { redisClient } from '../index.js';
import { User } from '../models/User.js';

export const isAuth = async(req,res,next)=>{
  try {
    
    const token = req.cookies.accessToken;
    if(!token){
      return res.status(403).json({
          message:"Unauthorized access please login first"
        }
      )
    }

    const decodedData =jwt.verify(token,process.env.JWT_SECRET)

    if(!decodedData){
      return res.status(400).json({
        message:"Token expired"
      })
    }

    const cachUser = await redisClient.get(`user:${decodedData.id}`)

    if(cachUser){
      // console.log('user from cache');
      req.user = JSON.parse(cachUser)
      next()
      return
    }

    const user = await User.findById(decodedData.id).select('-password')

    if(!user){
      return res.status(400).json({
        message:"User not found"
      })
    }

    await redisClient.setEx(`user:${user._id}`,60*60,JSON.stringify(user))

    // console.log("user from db");
    
    req.user = user

    next()

  } catch (error) {
    console.log(error.message);
    return res.status(500).json({message:error.message})
  }
}