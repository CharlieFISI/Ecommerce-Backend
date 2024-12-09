import { PrismaClient, FavoriteProduct as FavoriteProductModel } from '@prisma/client';

const prisma = new PrismaClient();

export const FavoriteProduct = prisma.favoriteProduct; // Delegate
export type FavoriteProductType = FavoriteProductModel; // Modelo
