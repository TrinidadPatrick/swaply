import express from 'express'
import { c_createUser, c_deleteUser, c_getAllUsers, c_getUser } from '../controllers/user.controller'

const router = express.Router()

router.get('/', c_getAllUsers)
router.get('/:id', c_getUser)
router.post('/create', c_createUser)
router.delete('/delete/:id', c_deleteUser)

export default router