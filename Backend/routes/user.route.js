import express from 'express'
import { loginUser, logout, profile, refreshToken, registerUser, verifyOtp, verifyUser } from '../controllers/user.controllers.js';
import { isAuth } from '../middlewares/isAuth.middleware.js';



const userRouter = express.Router()

userRouter.post('/register',registerUser)
userRouter.post('/register/verify/:token',verifyUser)
userRouter.post('/login',loginUser)
userRouter.post('/login/verify/otp',verifyOtp)
userRouter.get('/profile',isAuth,profile)
userRouter.post('/refresh',refreshToken)
userRouter.post('/logout',isAuth,logout)


export default userRouter;