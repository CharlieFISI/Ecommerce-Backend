import { PrismaClient, User as PrismaUser } from '@prisma/client'

const prisma = new PrismaClient()

export const User = prisma.user
export type UserType = PrismaUser
