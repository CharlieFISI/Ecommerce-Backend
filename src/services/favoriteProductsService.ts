import { Product, ProductType } from '../models/Product';
import { User } from '../models/User';
import { FavoriteProduct, FavoriteProductType } from '../models/FavoriteProduct';
import { NotFoundError, DatabaseError, ValidationError } from '../utils/errors';

/**
 * Get all favorite products for a specific user
 */
export const getFavoriteProductsByUser = async (
    userId: string
): Promise<ProductType[]> => {
    try {
        const user = await User.findUnique({ where: { id: userId } });
        if (!user) {
            throw new NotFoundError('User not found');
        }

        const favoriteProducts = await FavoriteProduct.findMany({
            where: { userId },
            include: { product: true },
        });

        return favoriteProducts.map((fav) => fav.product);
    } catch (error) {
        if (error instanceof NotFoundError) {
            throw error;
        }
        throw new DatabaseError('Failed to fetch favorite products');
    }
};

/**
 * Add a product to the user's favorites
 */
export const addProductToFavorites = async (
    userId: string,
    productId: string
): Promise<FavoriteProductType> => {
    try {
        const user = await User.findUnique({ where: { id: userId } });
        if (!user) {
            throw new NotFoundError('User not found');
        }

        const product = await Product.findUnique({ where: { id: productId } });
        if (!product) {
            throw new NotFoundError('Product not found');
        }

        const existingFavorite = await FavoriteProduct.findFirst({
            where: { userId, productId },
        });
        if (existingFavorite) {
            throw new ValidationError('Product is already in favorites');
        }

        return await FavoriteProduct.create({
            data: { userId, productId },
        });
    } catch (error) {
        if (error instanceof NotFoundError || error instanceof ValidationError) {
            throw error;
        }
        throw new DatabaseError('Failed to add product to favorites');
    }
};

/**
 * Remove a product from the user's favorites
 */
export const removeProductFromFavorites = async (
    userId: string,
    productId: string
): Promise<void> => {
    try {
        const favoriteProduct = await FavoriteProduct.findFirst({
            where: { userId, productId },
        });
        if (!favoriteProduct) {
            throw new NotFoundError('Favorite product not found');
        }

        await FavoriteProduct.delete({ where: { id: favoriteProduct.id } });
    } catch (error) {
        if (error instanceof NotFoundError) {
            throw error;
        }
        throw new DatabaseError('Failed to remove product from favorites');
    }
};
