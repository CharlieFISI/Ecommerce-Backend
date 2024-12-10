export {}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test'
      DATABASE_URL: string
      JWT_SECRET: string
      LOCAL_DASHBOARD_FRONTEND_URL: string
      DASHBOARD_FRONTEND_URL: string
      LOCAL_MOBILE_FRONTEND_URL: string
      OTHER_MOBILE_FRONTEND_URL: string
      MOBILE_FRONTEND_URL: string
      STRIPE_PUBLISHABLE_KEY: string
      STRIPE_SECRET_KEY: string
      MONGODB_URI: string
      PORT: string
    }
  }
}
