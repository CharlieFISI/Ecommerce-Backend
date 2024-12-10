import { PrismaClient, ProductListing as PrismaProductListing } from '@prisma/client'

const prisma = new PrismaClient()

export const ProductListing = prisma.productListing
export type ProductListingType = PrismaProductListing
