import express from 'express'
import cors, { CorsOptions } from 'cors'
import routes from './routes'
import path from 'path'

const app = express()
app.use(express.json())

// const allowedOrigins = [
//   process.env.DASHBOARD_FRONTEND_URL,
//   process.env.LOCAL_MOBILE_FRONTEND_URL,
//   process.env.OTHER_MOBILE_FRONTEND_URL,
//   process.env.MOBILE_FRONTEND_URL
// ].filter(Boolean)

// const corsOptions: CorsOptions = {
//   origin: function (
//     origin: string | undefined,
//     callback: (error: Error | null, allow?: boolean) => void
//   ) {
//     if (origin === undefined) {
//       callback(null, true)
//     } else if (allowedOrigins.includes(origin)) {
//       callback(null, true)
//     } else {
//       callback(new Error('Not allowed by CORS'), false)
//     }
//   },
//   credentials: true,
//   optionsSuccessStatus: 200
// }

const corsOptions: cors.CorsOptions = {
  origin: '*', // Esto permite cualquier origen
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
}

app.use(cors(corsOptions))
app.options('*', cors(corsOptions))

app.use(express.static(path.join(__dirname, '../public')))

app.get('/api', (req, res) => {
  res.json({
    message: 'Welcome to the API! This is a test message for the /api route.'
  })
})

app.use('/api', routes)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'))
})

// console.log('Allowed CORS origins:', allowedOrigins)

export default app
