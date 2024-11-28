import express from 'express'
import * as productController from '../controllers/productController'
import { authenticateJWT, authorizeRole } from '../middleware/auth'
import { Role } from '../types/user'

const router = express.Router()

router.post('/', authenticateJWT, authorizeRole(Role.SELLER), productController.createCategory)
router.get('/', authenticateJWT, authorizeRole(Role.SELLER), productController.getAllCategories)
router.get('/:id', authenticateJWT, authorizeRole(Role.SELLER), productController.getCategoryById)
router.put('/:id', authenticateJWT, authorizeRole(Role.SELLER), productController.updateCategory)
router.delete('/:id', authenticateJWT, authorizeRole(Role.SELLER), productController.deleteCategory)

export default router
