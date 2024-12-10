import { PrismaClient, FavoriteProduct as PrismaFavoriteProduct } from '@prisma/client'

const prisma = new PrismaClient()

export const FavoriteProduct = prisma.favoriteProduct
export type FavoriteProductType = PrismaFavoriteProduct
