import { ProductListingType } from '../models/ProductListing'
import { ProductType } from '../models/Product'

export interface CreateProductInput {
  name: string
  description: string
  categoryId: string
}

export interface UpdateProductInput {
  name?: string
  description?: string
  categoryId?: string
}

export interface ProductWithListings extends ProductType {
  listings: ProductListingType[]
}
