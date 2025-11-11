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

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and user management APIs
 */

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user and send verification email
 *     description: This endpoint registers a new user, validates input, sends a verification email, and applies rate limiting.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: MyStrongPassword@123
 *     responses:
 *       200:
 *         description: Verification email sent successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Verification link sent to your email, Please verify your email
 *
 *       400:
 *         description: Validation failed, user exists, or too many requests
 *         content:
 *           application/json:
 *             examples:
 *               ValidationError:
 *                 summary: Input validation failed
 *                 value:
 *                   success: false
 *                   message: Validation failed
 *                   errors:
 *                     - field: email
 *                       message: Invalid email address
 *                       code: invalid_string
 *               UserExists:
 *                 summary: Email already registered
 *                 value:
 *                   success: false
 *                   message: User already exist
 *               RateLimit:
 *                 summary: Too many registration attempts
 *                 value:
 *                   success: false
 *                   message: Too many requests, try again later
 *
 *       500:
 *         description: Internal server error (mail not sent)
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Failed to send verification email. Please try again.
 */

userRouter.post('/register', registerUser);

/**
 * @swagger
 * /api/v1/register/verify/{token}:
 *   post:
 *     summary: Verify a user's email with token
 *     description: The API endpoint is used to verify a user's email by accessing the verification token (token) included in the path variable.        When the user clicks on the email verification link provided to them, this API is invoked to validate their email address.  By including the verification token in the URL path, the endpoint confirms the authenticity of the token and marks the user's email as verified.
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: Verification token sent via email
 *     responses:
 *       201:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid or expired token
 */
userRouter.post('/register/verify/:token', verifyUser);

/**
 * @swagger
 * /api/v1/login:
 *   post:
 *     summary: Login user and send OTP to email.
 *     description: This API endpoint check user cradentials if it was correct then send otp to the user mail id and apply ratelimiting 
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: strongpassword123
 *     responses:
 *       200:
 *         description: OTP sent to user email
 *       400:
 *         description: Invalid credentials or too many requests
 */
userRouter.post('/login', loginUser);

/**
 * @swagger
 * /api/v1/login/verify/otp:
 *   post:
 *     summary: Verify OTP and log in user. 
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid or expired OTP
 */
userRouter.post('/login/verify/otp', verifyOtp);

/**
 * @swagger
 * /api/v1/login/verify/resend/otp:
 *   post:
 *     summary: Resend OTP to user email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: john@example.com
 *     responses:
 *       200:
 *         description:Otp send to your email, it will be valid for 5 minutes
 */
userRouter.post('/login/verify/resend/otp', reSendOtp);

/**
 * @swagger
 * /api/v1/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns user profile
 *       401:
 *         description: Unauthorized or invalid token
 */
userRouter.get('/profile', isAuthenticated, profile);

/**
 * @swagger
 * /api/v1/profile/edit:
 *   post:
 *     summary: Edit user profile (name, profile image)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Updated
 *               profileImg:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Validation error
 */
userRouter.post('/profile/edit', isAuthenticated, upload, editProfile);

/**
 * @swagger
 * /api/v1/profile/change/password:
 *   post:
 *     summary: Change user password
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 example: oldpass123
 *               newPassword:
 *                 type: string
 *                 example: newpass123
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Validation or authentication error
 */
userRouter.post('/profile/change/password', isAuthenticated, changePassword);

/**
 * @swagger
 * /api/v1/refresh:
 *   post:
 *     summary: Refresh access token using refresh token
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       401:
 *         description: Invalid or missing refresh token
 */
userRouter.post('/refresh', refreshToken);

/**
 * @swagger
 * /api/v1/logout:
 *   post:
 *     summary: Logout user and clear tokens
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: Unauthorized
 */
userRouter.post('/logout', isAuthenticated, verifyCsrfToken, logout);

/**
 * @swagger
 * /api/v1/refresh/csrf:
 *   post:
 *     summary: Refresh CSRF token for authenticated user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: CSRF token refreshed successfully
 *       401:
 *         description: Unauthorized
 */
userRouter.post('/refresh/csrf', isAuthenticated, refreshCSRFToken);



export default userRouter;