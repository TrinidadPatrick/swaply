import express from 'express'
import { c_forgotPassword, c_login, c_me, c_resetPassword, c_verifyAccount } from '../controllers/user.auth.controller.js'

const router = express.Router()

router.post('/verify-account', c_verifyAccount)
router.post('/forgot-password', c_forgotPassword) //Fot sending otp only
router.patch('/reset-password', c_resetPassword) //Fot resetting only
router.post('/login', c_login)

export default router