import express from 'express'
import * as productController from '../controllers/productController'
import * as sellerProductsController from '../controllers/sellerProductsController'
import { authenticateJWT, authorizeRole } from '../middleware/auth'
import { Role } from '../types/user'

const router = express.Router()

router.get('/', productController.getAllProducts)
router.get('/search', productController.searchProducts)
router.get('/:id', productController.getProduct)
router.post('/', authenticateJWT, authorizeRole(Role.SELLER), productController.createProduct)
router.put('/:id', authenticateJWT, authorizeRole(Role.SELLER), productController.updateProduct)
router.delete('/:id', authenticateJWT, authorizeRole(Role.SELLER), productController.deleteProduct)

router.get('/seller/listings', authenticateJWT, productController.getProductListingsByUser)
router.get('/:id/listings', productController.getProductListings)
router.post('/seller', authenticateJWT, authorizeRole(Role.SELLER), sellerProductsController.createSellerProductsWithListings)
router.delete('/seller/:id', authenticateJWT, authorizeRole(Role.SELLER), sellerProductsController.removeProductFromSellerListing)

export default router
