import express from 'express'
import {
    changePassword,
    editProfile,
    loginUser,
    logout,
    profile,
    refreshCSRFToken,
    refreshToken,
    registerUser,
    reSendOtp,
    verifyOtp,
    verifyUser
} from '../controllers/user.controllers.js';
import { isAuthenticated } from '../middlewares/isAuthenticated.js';
import {verifyCsrfToken} from "../config/csrfToken.js";
import {upload} from "../middlewares/upload.middleware.js";



const userRouter = express.Router()

userRouter.post('/register',registerUser)
userRouter.post('/register/verify/:token',verifyUser)
userRouter.post('/login',loginUser)
userRouter.post('/login/verify/otp',verifyOtp)
userRouter.post('/login/verify/resend/otp',reSendOtp)
userRouter.get('/profile',isAuthenticated,profile)
userRouter.post('/profile/edit',isAuthenticated,verifyCsrfToken,upload,editProfile)
userRouter.post('/profile/change/password',isAuthenticated,verifyCsrfToken,changePassword)
userRouter.post('/refresh',refreshToken)
userRouter.post('/logout',isAuthenticated,verifyCsrfToken,logout)
userRouter.post('/refresh/csrf',isAuthenticated, refreshCSRFToken)


export default userRouter;