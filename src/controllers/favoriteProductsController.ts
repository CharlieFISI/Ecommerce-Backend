import { Request, Response } from 'express';
import * as favoriteProductService from './../services/favoriteProductsService';
import { NotFoundError, ValidationError, DatabaseError } from '../utils/errors';

/**
 * Get all favorite products for a specific user
 */
export const getFavoriteProductsByUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ message: 'User not authenticated' });
            return;
        }

        const favoriteProducts = await favoriteProductService.getFavoriteProductsByUser(userId);
        res.status(200).json(favoriteProducts);
    } catch (error) {
        if (error instanceof NotFoundError) {
            res.status(404).json({ message: error.message });
        } else if (error instanceof DatabaseError) {
            res.status(500).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'An unexpected error occurred' });
        }
    }
};

/**
 * Add a product to the user's favorites
 */
export const addProductToFavorites = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ message: 'User not authenticated' });
            return;
        }

        const { productId } = req.body;

        if (!productId) {
            res.status(400).json({ message: 'Product ID is required' });
            return;
        }

        const favorite = await favoriteProductService.addProductToFavorites(userId, productId);
        res.status(201).json(favorite);
    } catch (error) {
        if (error instanceof NotFoundError || error instanceof ValidationError) {
            res.status(400).json({ message: error.message });
        } else if (error instanceof DatabaseError) {
            res.status(500).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'An unexpected error occurred' });
        }
    }
};

/**
 * Remove a product from the user's favorites
 */
export const removeProductFromFavorites = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ message: 'User not authenticated' });
            return;
        }

        const { productId } = req.params;

        if (!productId) {
            res.status(400).json({ message: 'Product ID is required' });
            return;
        }

        await favoriteProductService.removeProductFromFavorites(userId, productId);
        res.status(204).end();
    } catch (error) {
        if (error instanceof NotFoundError) {
            res.status(404).json({ message: error.message });
        } else if (error instanceof DatabaseError) {
            res.status(500).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'An unexpected error occurred' });
        }
    }
};
