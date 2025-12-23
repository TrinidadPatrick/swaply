import express from 'express'
import { c_forgotPassword, c_verifyAccount } from '../controllers/user.auth.controller'

const router = express.Router()

router.post('/verify-account', c_verifyAccount)
router.post('/forgot-password', c_forgotPassword)

export default router