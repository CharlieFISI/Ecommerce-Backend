export interface CartItemWithProductListing {
  quantity: number
  productListing: {
    price: number
    productId: string
  }
}
