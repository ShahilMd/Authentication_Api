import express from 'express'
import { registerUser, verifyUser } from '../controllers/user.controllers.js';


const userRouter = express.Router()

userRouter.post('/register',registerUser)
userRouter.post('/register/verify:token',verifyUser)


export default userRouter;