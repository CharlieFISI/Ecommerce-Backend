import { PrismaClient, Cart as PrismaCart } from '@prisma/client'

const prisma = new PrismaClient()

export const Cart = prisma.cart
export type CartType = PrismaCart
