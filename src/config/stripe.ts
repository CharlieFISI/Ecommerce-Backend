import Stripe from 'stripe'

if (process.env.STRIPE_SECRET_KEY === undefined) {
  throw new Error('STRIPE_SECRET_KEY must be defined in environment variables')
}

if (process.env.STRIPE_PUBLISHABLE_KEY === undefined) {
  throw new Error('STRIPE_PUBLISHABLE_KEY must be defined in environment variables')
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia'
})

export const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY

export default stripe
