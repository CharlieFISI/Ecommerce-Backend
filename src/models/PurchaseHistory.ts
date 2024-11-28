import { PrismaClient, PurchaseHistory as PrismaPurchaseHistory } from '@prisma/client'

const prisma = new PrismaClient()

export const PurchaseHistory = prisma.purchaseHistory
export type PurchaseHistoryType = PrismaPurchaseHistory
