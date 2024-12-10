import { PrismaClient, ProductOrder as PrismaProductOrder } from '@prisma/client'

const prisma = new PrismaClient()

export const ProductOrder = prisma.productOrder
export type ProductOrderType = PrismaProductOrder
