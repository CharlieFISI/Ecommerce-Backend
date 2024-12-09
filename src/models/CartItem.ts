import { PrismaClient, CartItem as PrismaCartItem } from '@prisma/client'

const prisma = new PrismaClient()

export const CartItem = prisma.cartItem
export type CartItemType = PrismaCartItem
