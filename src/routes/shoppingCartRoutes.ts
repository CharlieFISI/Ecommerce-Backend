import express from 'express'
import * as shoppingCartController from '../controllers/shoppingCartController'
import { authenticateJWT } from '../middleware/auth'

const router = express.Router()

// Get all items in the shopping cart for a specific user
router.get('/', authenticateJWT, shoppingCartController.viewCart)

// Add a product to the shopping cart
router.post('/', authenticateJWT, shoppingCartController.addToCart)

// Remove a product from the shopping cart by product ID
router.delete('/', authenticateJWT, shoppingCartController.deleteCartItem)

// Update the quantity of a specific product in the shopping cart
router.put('/', authenticateJWT, shoppingCartController.updateCartItem)

export default router
