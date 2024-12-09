import express from 'express';
import * as favoriteProductController from '../controllers/favoriteProductsController';
import { authenticateJWT } from '../middleware/auth';

const router = express.Router();

// Route to get all favorite products for the authenticated user
router.get('/', authenticateJWT, favoriteProductController.getFavoriteProductsByUser);

// Route to add a product to the user's favorites
router.post('/', authenticateJWT, favoriteProductController.addProductToFavorites);

// Route to remove a product from the user's favorites
router.delete('/:productId', authenticateJWT, favoriteProductController.removeProductFromFavorites);

export default router;
