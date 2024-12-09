import express from 'express'
import * as favoriteProductController from '../controllers/favoriteProductsController'
import { authenticateJWT } from '../middleware/auth'

const router = express.Router()

router.get('/', authenticateJWT, favoriteProductController.getFavoriteProductsByUser)
router.post('/', authenticateJWT, favoriteProductController.addProductToFavorites)
router.delete('/:productId', authenticateJWT, favoriteProductController.removeProductFromFavorites)

export default router
