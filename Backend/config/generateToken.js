import  jwt from "jsonwebtoken"
import { redisClient } from "../index.js";
import {generateCsrfToken, revokeCsrfToken} from "./csrfToken.js";



export const generateToken =async (id, res) => {
  const accessToken = jwt.sign({id},process.env.JWT_SECRET,{
    expiresIn:'15m'
  });

  const refreshToken = jwt.sign({id},process.env.JWT_REFRESH_SECRET,{
    expiresIn:'7d'
  });

  const refreshTokenKey = `refreshToken:${id}`

  await redisClient.setEx(refreshTokenKey,60*60*24*7,refreshToken)

  res.cookie("accessToken",accessToken,{
    httpOnly:true,
    secure:true,
    sameSite:"none",
    maxAge:15*60*1000
  })
  res.cookie("refreshToken",refreshToken,{
    httpOnly:true,
    secure:true,
    sameSite:"none",
    maxAge:60*60*24*7*1000})

    const csrfToken = await  generateCsrfToken(id,res)

  return {accessToken ,refreshToken,csrfToken};
}

export const verifyRefresh = async(token)=>{

  try {
    const decode = jwt.verify(token,process.env.JWT_REFRESH_SECRET);

    const cachedRefresh = await redisClient.get(`refreshToken:${decode.id}`)

    if(cachedRefresh === token){
      return decode
    }

    return null
    
  } catch (error) {
    return null
  }

}

export const generateAccessToken = (id,res) => {

  const accessToken = jwt.sign({id},process.env.JWT_SECRET,{
    expiresIn:"15m"
  })

   return res.cookie("accessToken",accessToken,{
    httpOnly:true,
    secure:true,
    sameSite:"none",
    maxAge:15*60*1000
  })
}

export const revokeRefreshToken = async (id) => {
  
    await redisClient.del(`refreshToken:${id}`)
    await revokeCsrfToken(id)
}
