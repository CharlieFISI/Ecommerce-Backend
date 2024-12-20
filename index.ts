import app from './src/app'

const PORT = process.env.PORT

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server')
  server.close(() => {
    console.log('HTTP server closed')
  })
})

export default app
