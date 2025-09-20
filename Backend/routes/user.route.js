import express from 'express'
import { loginUser, registerUser, verifyUser } from '../controllers/user.controllers.js';


const userRouter = express.Router()

userRouter.post('/register',registerUser)
userRouter.post('/register/verify/:token',verifyUser)
userRouter.post('/login',loginUser)
userRouter.post('/login/verify/otp',loginUser)


export default userRouter;