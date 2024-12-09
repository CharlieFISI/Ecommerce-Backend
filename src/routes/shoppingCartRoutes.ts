import express from 'express'
import * as controller from '../controllers/shoppingCartController'
import { authenticateJWT } from '../middleware/auth'

const router = express.Router()

router.get('/', authenticateJWT, controller.getCartByUser)
router.post('/', authenticateJWT, controller.addProductToCart)
router.patch('/', authenticateJWT, controller.updateCartItemQuantity)
router.delete('/', authenticateJWT, controller.removeProductFromCart)

export default router
