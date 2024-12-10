import express from 'express'
import * as shoppingCartController from '../controllers/shoppingCartController'
import { authenticateJWT } from '../middleware/auth'

const router = express.Router()

router.get('/', authenticateJWT, shoppingCartController.viewCart)
router.post('/', authenticateJWT, shoppingCartController.addToCart)
router.delete('/', authenticateJWT, shoppingCartController.deleteCartItem)
router.put('/', authenticateJWT, shoppingCartController.updateCartItem)

export default router
