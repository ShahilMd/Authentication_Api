import  jwt from "jsonwebtoken"
import { redisClient } from "../index.js";



export const generateToken =async (id, res) => {
  const acessToken = jwt.sign({id},process.env.JWT_SECRET,{
    expiresIn:'1m'
  });

  const refreshToken = jwt.sign({id},process.env.JWT_REFRESH_SECRET,{
    expiresIn:'7d'
  });

  const refreshTokenKey = `refreshToken:${id}`

  await redisClient.setEx(refreshTokenKey,60*60*24*7,refreshToken)

  res.cookie("acessToken",acessToken,{
    httpOnly:true,
    // secure:true,
    sameSite:"Strict",
    maxAge:1*60*1000
  })
  res.cookie("refreshToken",refreshToken,{
    httpOnly:true,
    sameSite:"Strict",
    maxAge:60*60*24*7*1000})

  return {acessToken,refreshToken};
}