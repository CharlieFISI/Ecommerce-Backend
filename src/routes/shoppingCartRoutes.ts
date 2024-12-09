import express from 'express'
import * as controller from '../controllers/shoppingCartController'
import { authenticateJWT } from '../middleware/auth'

const router = express.Router()

// Route to get the user's shopping cart
router.get('/', authenticateJWT, controller.getCartByUser)

// Route to add a product to the user's cart
router.post('/', authenticateJWT, controller.addProductToCart)

// Route to update the quantity of a product in the user's cart
router.patch('/', authenticateJWT, controller.updateCartItemQuantity)

// Route to remove a product from the user's cart
router.delete('/', authenticateJWT, controller.removeProductFromCart)

export default router
