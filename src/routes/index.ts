import express from 'express'
import userRoutes from './userRoutes'
import productRoutes from './productRoutes'
import categoryRoutes from './categoryRoutes'
import favoriteProductsRoutes from './favoriteProductsRoutes'
import shoppingCartRoutes from './shoppingCartRoutes'

const router = express.Router()

router.use('/users', userRoutes)
router.use('/products', productRoutes)
router.use('/categories', categoryRoutes)
router.use('/favorites', favoriteProductsRoutes)
router.use('/cart', shoppingCartRoutes)

export default router
