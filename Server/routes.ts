import { Router } from "express"
import userRouter from './routes/user.routes.js'
import authRouter from './routes/user.auth.routes.js'
import authMiddleware from "./middlewares/auth.middleware.js"

const router = Router()

router.use('/user', authMiddleware, userRouter )
router.use('/auth', authMiddleware, authRouter )

export default router