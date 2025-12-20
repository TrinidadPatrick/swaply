import { Router } from "express"
import userRouter from './routes/user.routes'
import authRouter from './routes/user.auth.routes'
import authMiddleware from "./middlewares/auth.middleware"

const router = Router()

router.use('/user', authMiddleware, userRouter )
router.use('/auth', authRouter )

export default router