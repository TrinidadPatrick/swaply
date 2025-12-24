import express from 'express'
import routes from './routes'

const app = express()

app.use(express.json())

app.use('/api', routes)

app.get('/', (req, res) => {
  res.json({ message: 'Hello from Express on Vercel!' });
});

app.listen(3000, (data) => {
    console.log(`🚀 Server running on port ${3000}`);
})

export default app