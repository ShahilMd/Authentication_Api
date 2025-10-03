import express from 'express'
import { loginUser, logout, profile, refreshToken, registerUser, reSendOtp, verifyOtp, verifyUser } from '../controllers/user.controllers.js';
import { isAuth } from '../middlewares/isAuth.middleware.js';



const userRouter = express.Router()

userRouter.post('/register',registerUser)
userRouter.post('/register/verify/:token',verifyUser)
userRouter.post('/login',loginUser)
userRouter.post('/login/verify/otp',verifyOtp)
userRouter.post('/login/verify/resend/otp',reSendOtp)
userRouter.get('/profile',isAuth,profile)
userRouter.post('/refresh',refreshToken)
userRouter.post('/logout',isAuth,logout)


export default userRouter;