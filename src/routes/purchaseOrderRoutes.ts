import express from 'express'
import * as controller from '../controllers/purchaseOrderController'
import { authenticateJWT, authorizeRole } from '../middleware/auth'
import { Role } from '../types/user'

const router = express.Router()

router.get('/', authenticateJWT, controller.getUserOrders)
router.post('/', authenticateJWT, controller.createOrder)
router.put('/', authenticateJWT, authorizeRole(Role.SELLER), controller.updateOrderStatus)
router.delete('/', authenticateJWT, controller.cancelOrder)
router.delete('/all', authenticateJWT, controller.cancelAllPendingOrders)

export default router
