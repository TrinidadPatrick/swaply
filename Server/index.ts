import express from 'express'
import routes from './routes.ts'

const app = express()

app.use(express.json())

app.use('/api', routes)

app.get('/', (req, res) => {
  res.json({ message: 'Hello from Express on Vercel!' });
});

export default app