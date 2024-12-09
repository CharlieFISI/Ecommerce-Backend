import { Request, Response } from 'express'
import * as cartService from './../services/shoppingCartService'
import { NotFoundError, ValidationError, DatabaseError } from '../utils/errors'

/**
 * Get the shopping cart of a user
 */
export const getCartByUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id

    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' })
      return
    }

    const cart = await cartService.getCartByUser(userId)
    res.status(200).json(cart)
  } catch (error) {
    if (error instanceof NotFoundError) {
      res.status(404).json({ message: error.message })
    } else if (error instanceof DatabaseError) {
      res.status(500).json({ message: error.message })
    } else {
      res.status(500).json({ message: 'An unexpected error occurred' })
    }
  }
}

/**
 * Add a product to the shopping cart
 */
export const addProductToCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id

    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' })
      return
    }

    const {
      productId,
      quantity
    } = req.body

    if (!productId || quantity == null) {
      res.status(400).json({ message: 'Product ID and quantity are required' })
      return
    }

    const cartItem = await cartService.addProductToCart(userId, productId, quantity)
    res.status(201).json(cartItem)
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof ValidationError) {
      res.status(400).json({ message: error.message })
    } else if (error instanceof DatabaseError) {
      res.status(500).json({ message: error.message })
    } else {
      res.status(500).json({ message: 'An unexpected error occurred' })
    }
  }
}

/**
 * Update the quantity of a product in the cart
 */
export const updateCartItemQuantity = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id

    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' })
      return
    }

    const {
      productId,
      quantity
    } = req.body

    if (!productId || quantity == null) {
      res.status(400).json({ message: 'Product ID and quantity are required' })
      return
    }

    const updatedCartItem = await cartService.updateCartItemQuantity(userId, productId, quantity)
    res.status(200).json(updatedCartItem)
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof ValidationError) {
      res.status(400).json({ message: error.message })
    } else if (error instanceof DatabaseError) {
      res.status(500).json({ message: error.message })
    } else {
      res.status(500).json({ message: 'An unexpected error occurred' })
    }
  }
}

/**
 * Remove a product from the shopping cart
 */
export const removeProductFromCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id

    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' })
      return
    }

    const { productId } = req.body

    if (!productId) {
      res.status(400).json({ message: 'Product ID is required' })
      return
    }

    await cartService.removeProductFromCart(userId, productId)
    res.status(204).end()
  } catch (error) {
    if (error instanceof NotFoundError) {
      res.status(404).json({ message: error.message })
    } else if (error instanceof DatabaseError) {
      res.status(500).json({ message: error.message })
    } else {
      res.status(500).json({ message: 'An unexpected error occurred' })
    }
  }
}
