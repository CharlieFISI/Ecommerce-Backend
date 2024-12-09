import { PrismaClient, CartItem as CartItemModel } from '@prisma/client';

const prisma = new PrismaClient();

export const CartItem = prisma.cartItem; // Delegate
export type CartItemType = CartItemModel; // Modelo
