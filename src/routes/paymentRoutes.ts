import express from 'express'
import * as stripeController from '../controllers/paymentController'
import { authenticateJWT } from '../middleware/auth'

const router = express.Router()

router.get('/publishable-key', stripeController.getPublishableKey)
router.post('/create-payment-intent', stripeController.createPaymentIntent)
router.post('/create-checkout-session', authenticateJWT, stripeController.createCheckoutSession)

export default router
