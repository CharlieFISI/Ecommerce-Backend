import { PrismaClient, Category as PrismaCategory } from '@prisma/client'

const prisma = new PrismaClient()

export const Category = prisma.category
export type CategoryType = PrismaCategory
