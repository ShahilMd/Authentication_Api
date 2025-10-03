import express from 'express'
import { loginUser, logout, profile, refreshToken, registerUser, reSendOtp, verifyOtp, verifyUser } from '../controllers/user.controllers.js';
import { isAuthenticated } from '../middlewares/isAuthenticated.js';



const userRouter = express.Router()

userRouter.post('/register',registerUser)
userRouter.post('/register/verify/:token',verifyUser)
userRouter.post('/login',loginUser)
userRouter.post('/login/verify/otp',verifyOtp)
userRouter.post('/login/verify/resend/otp',reSendOtp)
userRouter.get('/profile',isAuthenticated,profile)
userRouter.post('/refresh',refreshToken)
userRouter.post('/logout',isAuthenticated,logout)


export default userRouter;