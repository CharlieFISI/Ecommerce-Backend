import { PrismaClient, Cart as CartModel } from '@prisma/client';

const prisma = new PrismaClient();

export const Cart = prisma.cart; // Delegate
export type CartType = CartModel; // Modelo
