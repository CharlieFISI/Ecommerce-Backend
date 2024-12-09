import { Request, Response } from 'express'
import * as shoppingCartService from './../services/shoppingCartService'
import { NotFoundError, ValidationError, DatabaseError } from '../utils/errors'

// Add a product to the cart
export const addToCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id
    const {
      productId,
      sellerId,
      quantity
    } = req.body

    if (userId == null) {
      res.status(401).json({ message: 'User not authenticated' })
      return
    }

    if (productId == null || sellerId == null || quantity == null) {
      res.status(400).json({ message: 'Product ID, seller ID, and quantity are required' })
      return
    }

    const cartItem = await shoppingCartService.addToCart(userId, productId, sellerId, quantity)
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

// View the user's cart
export const viewCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id

    if (userId == null) {
      res.status(401).json({ message: 'User not authenticated' })
      return
    }

    const cartItems = await shoppingCartService.viewCart(userId)
    res.status(200).json(cartItems)
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

// Update the quantity of a cart item
export const updateCartItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id
    const {
      productId,
      sellerId,
      quantity
    } = req.body

    if (userId == null) {
      res.status(401).json({ message: 'User not authenticated' })
      return
    }

    if (productId == null || sellerId == null || quantity == null) {
      res.status(400).json({ message: 'Product ID, seller ID, and quantity are required' })
      return
    }

    const updatedCartItem = await shoppingCartService.updateCartItem(productId, userId, sellerId, quantity)
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

// Delete a cart item
export const deleteCartItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id
    const {
      productId,
      sellerId
    } = req.body

    if (userId == null) {
      res.status(401).json({ message: 'User not authenticated' })
      return
    }

    if (productId == null || sellerId == null) {
      res.status(400).json({ message: 'Product ID and seller ID are required' })
      return
    }

    await shoppingCartService.deleteCartItem(productId, userId, sellerId)
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
