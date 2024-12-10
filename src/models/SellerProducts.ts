import { PrismaClient, SellerProducts as PrismaSellerProducts } from '@prisma/client'

const prisma = new PrismaClient()

export const SellerProducts = prisma.sellerProducts
export type SellerProductsType = PrismaSellerProducts
