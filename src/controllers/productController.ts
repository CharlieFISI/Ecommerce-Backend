import { Request, Response } from 'express'
import * as productService from '../services/productService'
import { CreateProductInput, UpdateProductInput } from '../types/product'
import { NotFoundError, ValidationError, DatabaseError, AuthorizationError } from '../utils/errors'
import { CreateCategoryInput, UpdateCategoryInput } from '../types/category'

export const getProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const productId = req.params.id
    const product = await productService.getProductById(productId)
    res.status(200).json(product)
  } catch (error) {
    if (error instanceof NotFoundError) {
      res.status(404).json({ message: error.message })
    } else {
      res.status(500).json({ message: 'An unexpected error occurred' })
    }
  }
}

export const searchProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name } = req.query
    if (typeof name !== 'string') {
      res.status(400).json({ message: 'Invalid search query' })
      return
    }
    const products = await productService.searchProducts(name)
    res.status(200).json(products)
  } catch (error) {
    if (error instanceof DatabaseError) {
      res.status(500).json({ message: error.message })
    } else {
      res.status(500).json({ message: 'An unexpected error occurred' })
    }
  }
}

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const productData: CreateProductInput = req.body
    const product = await productService.createProduct(productData)
    res.status(201).json(product)
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({ message: error.message })
    } else if (error instanceof DatabaseError) {
      res.status(500).json({ message: error.message })
    } else {
      res.status(500).json({ message: 'An unexpected error occurred' })
    }
  }
}

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const productId = req.params.id
    const productData: UpdateProductInput = req.body
    const updatedProduct = await productService.updateProduct(productId, productData)
    res.status(200).json(updatedProduct)
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

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const productId = req.params.id

    const product = await productService.getProductById(productId)
    if (product == null) {
      res.status(404).json({ message: 'Product not found' })
      return
    }

    await productService.deleteProduct(productId)

    res.status(200).json({ message: 'Product deleted successfully' })
  } catch (error) {
    if (error instanceof NotFoundError) {
      res.status(404).json({ message: error.message })
    } else if (error instanceof ValidationError) {
      res.status(400).json({ message: error.message })
    } else if (error instanceof DatabaseError) {
      res.status(500).json({ message: error.message })
    } else {
      res.status(500).json({ message: 'An unexpected error occurred while deleting the product' })
    }
  }
}

export const getAllProducts = async (_req: Request, res: Response): Promise<void> => {
  try {
    const products = await productService.getAllProducts()
    res.status(200).json(products)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch products' })
  }
}

export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const categoryData: CreateCategoryInput = req.body
    const category = await productService.createCategory(categoryData)
    res.status(201).json(category)
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({ message: error.message })
    } else if (error instanceof DatabaseError) {
      res.status(500).json({ message: error.message })
    } else {
      res.status(500).json({ message: 'Failed to create category' })
    }
  }
}

export const getCategoryById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const category = await productService.getCategoryById(id)
    res.json(category)
  } catch (error) {
    if (error instanceof NotFoundError) {
      res.status(404).json({ message: error.message })
    } else {
      res.status(500).json({ message: 'Failed to fetch category' })
    }
  }
}

export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const categoryData: UpdateCategoryInput = req.body
    const updatedCategory = await productService.updateCategory(id, categoryData)
    res.json(updatedCategory)
  } catch (error) {
    if (error instanceof NotFoundError) {
      res.status(404).json({ message: error.message })
    } else if (error instanceof ValidationError) {
      res.status(400).json({ message: error.message })
    } else {
      res.status(500).json({ message: 'Failed to update category' })
    }
  }
}

export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    await productService.deleteCategory(id)
    res.status(204).end()
  } catch (error) {
    if (error instanceof NotFoundError) {
      res.status(404).json({ message: error.message })
    } else {
      res.status(500).json({ message: 'Failed to delete category' })
    }
  }
}

export const getAllCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await productService.getAllCategories()
    res.json(categories)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch categories' })
  }
}

export const getProductListings = async (req: Request, res: Response): Promise<void> => {
  try {
    const productId = req.params.id
    const listings = await productService.getProductListings(productId)
    res.status(200).json(listings)
  } catch (error) {
    if (error instanceof NotFoundError) {
      res.status(404).json({ message: error.message })
    } else {
      res.status(500).json({ message: 'Failed to fetch product listings' })
    }
  }
}

export const getProductListingsByUser = async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.user == null) {
      res.status(401).json({ success: false, message: 'User not authenticated' })
      return
    }

    const userId = req.user.id

    if (req.user.role !== 'SELLER') {
      throw new AuthorizationError('User is not authorized to view product listings')
    }

    const productListings = await productService.getProductListingsByUser(userId)

    res.status(200).json({
      success: true,
      data: productListings
    })
  } catch (error) {
    if (error instanceof NotFoundError) {
      res.status(404).json({
        success: false,
        message: error.message
      })
    } else if (error instanceof DatabaseError) {
      res.status(500).json({
        success: false,
        message: 'An error occurred while fetching product listings'
      })
    } else if (error instanceof AuthorizationError) {
      res.status(403).json({
        success: false,
        message: error.message
      })
    } else {
      res.status(500).json({
        success: false,
        message: 'An unexpected error occurred'
      })
    }
  }
}
