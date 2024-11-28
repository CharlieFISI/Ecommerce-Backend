import { Request, Response } from 'express'
import * as productService from '../services/productService'
import { NotFoundError, ValidationError, DatabaseError } from '../utils/errors'
import { CreateSellerProductsInput } from '../types/sellerProducts'

export const createSellerProductsWithListings = async (req: Request, res: Response): Promise<void> => {
  try {
    if ((req.user == null) || req.user.id == null) {
      throw new ValidationError('User not authenticated')
    }

    const { products } = req.body as CreateSellerProductsInput

    if ((req.user == null) || req.user.id == null) {
      throw new ValidationError('User not authenticated')
    }

    const sellerId = req.user?.id

    if (sellerId == null || sellerId.trim() === '') {
      throw new ValidationError('Invalid sellerId')
    }

    if (products == null || !Array.isArray(products) || products.length === 0) {
      throw new ValidationError('Invalid products data')
    }

    const sellerProductsWithListings = await productService.createSellerProducts({
      sellerId,
      products
    })

    res.status(201).json(sellerProductsWithListings)
  } catch (error) {
    if (error instanceof NotFoundError) {
      res.status(404).json({ message: error.message })
    } else if (error instanceof ValidationError) {
      res.status(400).json({ message: error.message })
    } else if (error instanceof DatabaseError) {
      res.status(500).json({ message: error.message })
    } else {
      res.status(500).json({ message: 'An unexpected error occurred' })
    }
  }
}

export const removeProductFromSellerListing = async (req: Request, res: Response): Promise<void> => {
  try {
    const productId = req.params.id

    if ((req.user == null) || req.user.id == null) {
      throw new ValidationError('User not authenticated')
    }

    const sellerId = req.user?.id

    if (sellerId == null || sellerId.trim() === '') {
      throw new ValidationError('Invalid sellerId')
    }

    await productService.removeProductFromSellerListing(sellerId, productId)

    res.status(200).json({ message: 'Product removed from seller listing successfully' })
  } catch (error) {
    if (error instanceof NotFoundError) {
      res.status(404).json({ message: error.message })
    } else if (error instanceof DatabaseError) {
      res.status(500).json({ message: error.message })
    } else {
      res.status(500).json({ message: 'An unexpected error occurred while removing the product from seller listing' })
    }
  }
}
