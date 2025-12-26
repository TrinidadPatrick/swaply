import express, { Request, Response, NextFunction } from 'express'
import routes from './routes.js'

interface WebError extends Error {
  statusCode?: number;
}

const app = express()

app.use(express.json())

app.get('/', (req, res) => {
  res.json({ message: 'Welcome To Swaply Initial Server' });
});

app.use('/api', routes)

app.use((err: WebError, req: Request, res: Response, next: NextFunction) => {
    const code = err.statusCode || 500;
    
    res.status(code).json({
        message: err.message || "Internal Server Error"
    });
});

export default app