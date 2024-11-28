import express from 'express'
import userRoutes from './userRoutes'
import productRoutes from './productRoutes'
import categoryRoutes from './categoryRoutes'

const router = express.Router()

router.use('/users', userRoutes)
router.use('/products', productRoutes)
router.use('/categories', categoryRoutes)

export default router
