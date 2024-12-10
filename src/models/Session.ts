import { PrismaClient, Session as PrismaSession } from '@prisma/client'

const prisma = new PrismaClient()

export const Session = prisma.session
export type SessionType = PrismaSession
