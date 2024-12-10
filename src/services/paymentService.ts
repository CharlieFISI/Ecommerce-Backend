import Stripe from 'stripe'
import stripe, { STRIPE_PUBLISHABLE_KEY } from '../config/stripe'
import { Product } from '../models/Product'
import { CartItemWithProductListing } from '../types/cart'

export const getPublishableKey = (): string => {
  return STRIPE_PUBLISHABLE_KEY
}

export const createPaymentIntent = async (amount: number, currency: string = 'usd'): Promise<Stripe.PaymentIntent> => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency
    })
    return paymentIntent
  } catch (error) {
    console.error('Error creating payment intent:', error)
    throw error
  }
}

const getProductDetails = async (productId: string): Promise<{ name: string, imageUrl: string }> => {
  const product = await Product.findUnique({ where: { id: productId } })
  if (product == null) {
    throw new Error(`Product not found: ${productId}`)
  }
  return {
    name: product.name,
    imageUrl: product.imageUrl ?? ''
  }
}

export const createCheckoutSession = async (items: CartItemWithProductListing[], successUrl: string, cancelUrl: string): Promise<Stripe.Checkout.Session> => {
  try {
    const lineItems = await Promise.all(items.map(async (item) => {
      const productDetails = await getProductDetails(item.productListing.productId)
      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: productDetails.name,
            images: [productDetails.imageUrl]
          },
          unit_amount: Math.round(item.productListing.price * 100)
        },
        quantity: item.quantity
      }
    }))

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl
    })
    return session
  } catch (error) {
    console.error('Error creating checkout session:', error)
    throw error
  }
}
