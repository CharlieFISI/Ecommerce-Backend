export {}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test'
      DATABASE_URL: string
      JWT_SECRET: string
      FRONTEND_URL: string
      MONGODB_URI: string
      PORT: string
    }
  }
}
