import { Request, Response } from 'express'
import * as stripeService from '../services/paymentService'

export const getPublishableKey = (req: Request, res: Response): void => {
  const publishableKey = stripeService.getPublishableKey()
  res.json({ publishableKey })
}

export const createPaymentIntent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { amount } = req.body
    const paymentIntent = await stripeService.createPaymentIntent(amount)
    res.json({ clientSecret: paymentIntent.client_secret })
  } catch (error) {
    res.status(500).json({ error: 'Error creating payment intent' })
  }
}

export const createCheckoutSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { items, successUrl, cancelUrl } = req.body
    const session = await stripeService.createCheckoutSession(items, successUrl, cancelUrl)
    res.json({ sessionId: session.id })
  } catch (error) {
    res.status(500).json({ error: 'Error creating checkout session' })
  }
}
