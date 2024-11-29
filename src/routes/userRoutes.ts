import express from 'express'
import * as userController from '../controllers/userController'
import { authenticateJWT } from '../middleware/auth'

const router = express.Router()

router.post('/register', userController.register)
router.post('/changepassword', authenticateJWT, userController.changePassword)
router.post('/login', userController.login)
router.post('/logout', authenticateJWT, userController.logoutUser)
router.get('/verify', userController.verifySession)

router.get('/:id', authenticateJWT, userController.getUser)
router.get('/user/role', authenticateJWT, userController.getUserRole)
router.put('/', authenticateJWT, userController.updateUser)

export default router
