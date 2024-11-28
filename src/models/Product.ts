import { PrismaClient, Product as PrismaProduct } from '@prisma/client'

const prisma = new PrismaClient()

export const Product = prisma.product
export type ProductType = PrismaProduct
