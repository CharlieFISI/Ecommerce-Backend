import { SellerProductsType } from '../models/SellerProducts'
import { UserType } from '../models/User'
import { ProductListingType } from '../models/ProductListing'
import { ListingProducts } from './productListing'

export interface CreateSellerProductsInput {
  sellerId: string
  products: ListingProducts []
}

export interface SellerProductsWithRelations extends SellerProductsType {
  seller: UserType
  listings: ProductListingType[]
}
