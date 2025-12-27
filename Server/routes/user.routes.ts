import express from 'express'
import { c_createUser, c_deleteUser, c_getAllUsers, c_getUser } from '../controllers/user.controller.js'
import { c_me } from '../controllers/user.auth.controller.js'
import authMiddleware from '../middlewares/auth.middleware.js'

const router = express.Router()

// Public User Routes
router.get('/', c_getAllUsers)
router.get('/:id', c_getUser)
router.post('/create', c_createUser)
router.delete('/delete/:id', c_deleteUser)

router.use(authMiddleware)

// Private User Routes
router.post('/me', c_me)

export default router