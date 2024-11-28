import express from 'express'
import cors from 'cors'
import routes from './routes'
import path from 'path'

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.static(path.join(__dirname, '../public')))

app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to the API! This is a test message for the /api route.' })
})

app.use('/api', routes)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'))
})

export default app
