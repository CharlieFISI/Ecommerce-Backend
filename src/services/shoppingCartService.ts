import { User } from '../models/User'
import { DatabaseError, NotFoundError, ValidationError } from '../utils/errors'
import { ProductListing, ProductListingType } from '../models/ProductListing'
import { Cart } from '../models/Cart'
import { CartItem, CartItemType } from '../models/CartItem'

const getProductListing = async (
  productId: string,
  sellerId: string
): Promise<ProductListingType> => {
  const listing = await ProductListing.findFirst({
    where: {
      productId,
      sellerProducts: { sellerId }
    }
  })

  if (listing == null) {
    throw new NotFoundError('Product listing not found')
  }

  return listing
}

export const addToCart = async (userId: string, productId: string, sellerId: string, quantity: number): Promise<CartItemType> => {
  const user = await User.findUnique({ where: { id: userId } })
  if (user == null) {
    throw new NotFoundError('User not found')
  }
  try {
    const listing = await getProductListing(productId, sellerId)

    let cart = await Cart.findFirst({
      where: { userId }
    })

    if (cart == null) {
      cart = await Cart.create({
        data: { userId }
      })
    }

    let existingCartItem = await CartItem.findFirst({
      where: {
        cartId: cart.id,
        productListingId: listing.id
      }
    })

    if (existingCartItem == null) {
      existingCartItem = await CartItem.create({
        data: {
          cartId: cart.id,
          productListingId: listing.id,
          quantity
        }
      })
      existingCartItem.productId = productId
      return existingCartItem
    }
    existingCartItem.quantity += quantity
    await CartItem.update({
      where: { id: existingCartItem.id },
      data: { quantity: existingCartItem.quantity }
    })
    existingCartItem.productId = productId
    return existingCartItem
  } catch (error) {
    throw new DatabaseError('Failed to add product to cart')
  }
}

export const viewCart = async (userId: string): Promise<CartItemType[]> => {
  const user = await User.findUnique({ where: { id: userId } })
  if (user == null) {
    throw new NotFoundError('User not found')
  }
  try {
    const cart = await Cart.findUnique({
      where: { userId },
      include: { items: { include: { productListing: true } } }
    })

    if (cart == null || cart.items.length === 0) {
      console.log({ message: 'No cart found' })
      return []
    }

    return cart.items
  } catch (error) {
    throw new DatabaseError('Failed to fetch cart items')
  }
}

export const updateCartItem = async (
  productId: string,
  buyerId: string,
  sellerId: string,
  quantity: number
): Promise<CartItemType> => {
  if (quantity <= 0) {
    throw new ValidationError('Quantity must be greater than zero')
  }

  const user = await User.findUnique({ where: { id: buyerId } })
  if (user == null) {
    throw new NotFoundError('User not found')
  }

  const cartItem = await CartItem.findFirst({
    where: {
      productListing: {
        productId,
        sellerProducts: { sellerId }
      },
      cart: {
        user: {
          id: buyerId
        }
      }
    },
    include: {
      productListing: true
    }
  })

  if (cartItem == null) {
    throw new NotFoundError('Cart item not found')
  }

  const { productListing } = cartItem
  if (productListing == null) {
    throw new NotFoundError('Associated product listing not found')
  }

  if (quantity > productListing.stock) {
    throw new ValidationError(
      `Cannot update quantity to ${quantity}. Only ${productListing.stock as number} items are available in stock.`
    )
  }

  try {
    const item = await CartItem.update({
      where: { id: cartItem.id },
      data: { quantity }
    })
    item.productId = productId
    return item
  } catch (error) {
    throw new DatabaseError('Failed to update cart item quantity')
  }
}

export const deleteCartItem = async (
  productId: string,
  buyerId: string,
  sellerId: string
): Promise<void> => {
  const user = await User.findUnique({ where: { id: buyerId } })
  if (user == null) {
    throw new NotFoundError('User not found')
  }

  const cartItem = await CartItem.findFirst({
    where: {
      productListing: {
        productId,
        sellerProducts: { sellerId }
      },
      cart: {
        user: {
          id: buyerId
        }
      }
    },
    include: {
      productListing: true
    }
  })

  if (cartItem == null) {
    throw new NotFoundError('Cart item not found')
  }

  try {
    await CartItem.delete({
      where: {
        id: cartItem.id
      }
    })
  } catch (error) {
    throw new DatabaseError('Failed to delete cart item')
  }
}
