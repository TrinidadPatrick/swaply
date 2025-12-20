import express from 'express'
import { c_verifyToken } from '../controllers/user.auth.controller'

const router = express.Router()

router.post('/verifyToken', c_verifyToken)

export default router