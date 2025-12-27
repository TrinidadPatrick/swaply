import express, { Request, Response, NextFunction } from 'express'
import routes from './routes.js'
import { Prisma } from './generated/prisma/client.js';
import { prisma } from './lib/prisma.js';

interface WebError extends Error {
  statusCode?: number;
}

const app = express()

app.use(express.json())

try {
  await prisma.$connect();
  console.log('Database connected');
} catch (error) {
  if (error instanceof Prisma.PrismaClientInitializationError) {
    console.error('Failed to connect to database (Please try again after a few minutes)');
    console.error(error.message);
  } else {
    console.error('Unexpected error during startup', error);
  }
  process.exit(1);
}

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