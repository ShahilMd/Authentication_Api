import crypto from 'crypto';
import {redisClient} from "../index.js";


export const generateCsrfToken = async(userId,res)=>{
  const token = crypto.randomBytes(32).toString('hex');

  const csrfKey = `csrf:${userId}`
    await redisClient.setEx(csrfKey,3600,token)
    res.cookie('csrfToken',token,{
        httpOnly:false,
        secure:true,
        sameSite:'None',
        maxAge:60*60*1000
    })

    return token;
}

export const verifyCsrfToken =async (req,res,next) => {
   try {
       if(req.method === 'GET'){
            return next()
       }
       const userId = req.user._id
       if(!userId){
           return res.status(401).json({
               message:"Unauthorized access User not authenticated from userId"
           })
       }

       const clientToken = req.headers['x-csrf-token']
           ||req.headers['x-xsrf-token']
           || req.headers['csrf-token'];

       if(!clientToken){
           return res.status(403).json({
               message:'CSRF token missing please refresh page',
               code:'CSRF_TOKEN_MISSING'
           })
       }
       const csrfKey = `csrf:${userId}`
       const storedToken= await  redisClient.get(csrfKey)

       if(!storedToken){
        return res.status(403).json({
            message:'CSRF token expired please try again',
            code:'CSRF_TOKEN_EXPIRED'
        })
       }
       if(storedToken !== clientToken ){
           return res.status(403).json({
               message:'Invalid CSRF token Please refresh page',
               code:'CSRF_TOKEN_INVALID'
           })
       }

       next()
   } catch (error) {
       console.error("CSRF verification error",error);
       return  res.status(500).json({
           message:'CSRF verification failed',
           code:'CSRF_VERIFICATION_FAILED'
       })
   }

}

export const revokeCsrfToken = async (userId) => {
    const csrfKey = `csrf:${userId}`
    await redisClient.del(csrfKey)
}

export const refreshCsrfToken = async(userId,res) => {
    await revokeCsrfToken(userId)

    const token = await  generateCsrfToken(userId,res)
    return token;
}