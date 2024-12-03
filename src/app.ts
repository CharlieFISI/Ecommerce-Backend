import express from 'express'
import cors from 'cors'
import routes from './routes'
import path from 'path'

const app = express()
app.use(express.json())

const corsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true,
  optionsSuccessStatus: 200
}
app.use(cors(corsOptions))
app.options('*', cors(corsOptions))

app.use(express.static(path.join(__dirname, '../public')))

app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to the API! This is a test message for the /api route.' })
})

app.use('/api', routes)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'))
})

export default app
