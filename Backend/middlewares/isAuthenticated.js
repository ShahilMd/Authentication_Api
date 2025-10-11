import  jwt  from "jsonwebtoken"
import { redisClient } from "../index.js"
import { generateToken } from "../config/generateToken.js"
import { User } from "../models/User.js"


export const isAuthenticated = async(req,res,next)=>{
  const accessToken = req.cookies.accessToken
  const refreshToken = req.cookies.refreshToken

  if(!accessToken){
    if(!refreshToken){
      return res.status(403).json({
        message:"Unauthorized access please login first"
      })
    }else{
      const decodeData = jwt.verify(refreshToken,process.env.JWT_REFRESH_SECRET)

      if(!decodeData){
        return res.status(400).json({
          message:'Token expired'
        })
      }

      const cacheUser = await redisClient.get(`user:${decodeData.id}`)
      const cachedUser = JSON.parse(cacheUser)

      
      if(cacheUser){        
        await redisClient.del(`refreshToken:${cachedUser._id}`)
        await generateToken(cachedUser._id,res)
        req.user = JSON.parse(cacheUser)
        next()
        return
      }

      const user = await User.findById(decodeData.id).select('-password')
      
      if(!user){
        return res.status(400).json({
          message:"User not found"
        })
      }
        await redisClient.del(`refreshToken:${user._id}`)
        await generateToken(user._id,res)
        req.user = user
        next()
        return

    }
  }else{
    const decodeData = jwt.verify(accessToken,process.env.JWT_SECRET)

    if(!decodeData){
      return res.status(400).json({
        message:'Token expired'
      })
    }

    const cachUser = await redisClient.get(`user:${decodeData.id}`)

    if(cachUser){      
      req.user = JSON.parse(cachUser)
      next()
      return
    }

    const user = await User.findById(decodeData.id).select('-password')

    if(!user){
      return res.status(400).json({
        message:"User not found"
      })
    }
      req.user = user
      next()
      return
  }
}