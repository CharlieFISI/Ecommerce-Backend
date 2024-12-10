import { ProductListingType } from '../models/ProductListing'
import { ProductType } from '../models/Product'
import { SellerProductsType } from '../models/SellerProducts'

export interface CreateProductListingInput {
  productId: string
  sellerProductsId: string
  stock: number
  price: number
}

export interface UpdateProductListingInput {
  id: string
  stock: number
  price: number
}

export interface ProductListingWithDetails extends ProductListingType {
  product: ProductType
  sellerProducts: SellerProductsType
}

export interface ListingProducts {
  productId: string
  stock: number
  price: number
}

export interface SimplifiedProductListing {
  name: string
  description: string
  category: string
  price: number
  stock: number
}
