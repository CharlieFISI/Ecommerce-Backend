export interface CartItemWithProductListing {
  id: string
  quantity: number
  productListing: {
    id: string
    price: number
    stock: number
    productId: string
  }
}
