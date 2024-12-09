import { Cart, CartType } from '../models/Cart'
import { CartItem, CartItemType } from '../models/CartItem'
import { Product } from '../models/Product'
import { User } from '../models/User'
import { NotFoundError, DatabaseError, ValidationError } from '../utils/errors'

/**
 * Get the user's shopping cart
 */
export const getCartByUser = async (userId: string): Promise<CartType> => {
  try {
    const user = await User.findUnique({ where: { id: userId } })
    if (user == null) {
      throw new NotFoundError('User not found')
    }

    const cart = await Cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } }
    })

    if (cart == null) {
      throw new NotFoundError('Cart not found for the user')
    }

    return cart
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error
    }
    throw new DatabaseError('Failed to fetch the cart')
  }
}

/**
 * Add a product to the user's cart
 */
export const addProductToCart = async (
  userId: string,
  productId: string,
  quantity: number
): Promise<CartItemType> => {
  try {
    const user = await User.findUnique({ where: { id: userId } })
    if (user == null) {
      throw new NotFoundError('User not found')
    }

    const product = await Product.findUnique({ where: { id: productId } })
    if (product == null) {
      throw new NotFoundError('Product not found')
    }

    if (quantity <= 0) {
      throw new ValidationError('Quantity must be greater than 0')
    }

    const cart = await Cart.upsert({
      where: { userId },
      create: { userId },
      update: {}
    })

    const existingCartItem = await CartItem.findFirst({
      where: { cartId: cart.id, productId }
    })

    if (existingCartItem != null) {
      return await CartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: existingCartItem.quantity + quantity }
      })
    }

    return await CartItem.create({
      data: { cartId: cart.id, productId, quantity }
    })
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof ValidationError) {
      throw error
    }
    throw new DatabaseError('Failed to add product to cart')
  }
}

/**
 * Update product quantity in the user's cart
 */
export const updateCartItemQuantity = async (
  userId: string,
  productId: string,
  quantity: number
): Promise<CartItemType> => {
  try {
    const [user] = await Promise.all([User.findUnique({ where: { id: userId } })])
    if (user == null) {
      throw new NotFoundError('User not found')
    }

    const cart = await Cart.findUnique({ where: { userId } })
    if (cart == null) {
      throw new NotFoundError('Cart not found')
    }

    const cartItem = await CartItem.findFirst({
      where: { cartId: cart.id, productId }
    })
    if (cartItem == null) {
      throw new NotFoundError('Product not found in cart')
    }

    if (quantity <= 0) {
      await CartItem.delete({ where: { id: cartItem.id } })
      return cartItem
    }

    return await CartItem.update({
      where: { id: cartItem.id },
      data: { quantity }
    })
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof ValidationError) {
      throw error
    }
    throw new DatabaseError('Failed to update product quantity in cart')
  }
}

/**
 * Remove a product from the user's cart
 */
export const removeProductFromCart = async (
  userId: string,
  productId: string
): Promise<void> => {
  try {
    const user = await User.findUnique({ where: { id: userId } })
    if (user == null) {
      throw new NotFoundError('User not found')
    }

    const cart = await Cart.findUnique({ where: { userId } })
    if (cart == null) {
      throw new NotFoundError('Cart not found')
    }

    const cartItem = await CartItem.findFirst({
      where: { cartId: cart.id, productId }
    })
    if (cartItem == null) {
      throw new NotFoundError('Product not found in cart')
    }

    await CartItem.delete({ where: { id: cartItem.id } })
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error
    }
    throw new DatabaseError('Failed to remove product from cart')
  }
}
