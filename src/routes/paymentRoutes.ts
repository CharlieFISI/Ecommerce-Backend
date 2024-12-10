import express from 'express'
import * as stripeController from '../controllers/paymentController'

const router = express.Router()

router.get('/publishable-key', stripeController.getPublishableKey)
router.post('/create-payment-intent', stripeController.createPaymentIntent)
router.post('/create-checkout-session', stripeController.createCheckoutSession)

export default router
