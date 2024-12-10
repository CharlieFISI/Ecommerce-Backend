import { Request, Response } from 'express'
import * as productService from '../services/productService'
import { NotFoundError, DatabaseError } from '../utils/errors'
import { OrderStatus } from '@prisma/client'

export const createPurchaseHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { buyerId } = req.body

    if (buyerId == null) {
      res.status(400).json({ message: 'Buyer ID is required' })
      return
    }

    const purchaseHistory = await productService.createPurchaseHistory(buyerId)
    res.status(201).json(purchaseHistory)
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

export const getPurchaseHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { buyerId } = req.params

    const purchaseHistory = await productService.getPurchaseHistoryByBuyerId(buyerId)
    if (purchaseHistory === null) {
      res.status(404).json({ message: 'Purchase history not found' })
      return
    }
    res.status(200).json(purchaseHistory)
  } catch (error) {
    if (error instanceof DatabaseError) {
      res.status(500).json({ message: error.message })
    } else {
      res.status(500).json({ message: 'An unexpected error occurred' })
    }
  }
}

export const createProductOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { purchaseHistoryId, productId, quantity, status } = req.body

    if (purchaseHistoryId == null || productId == null || quantity == null || status == null) {
      res.status(400).json({ message: 'Missing required fields' })
      return
    }

    const productOrder = await productService.createProductOrder(
      purchaseHistoryId,
      productId,
      quantity,
      status as OrderStatus
    )
    res.status(201).json(productOrder)
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

export const getProductOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params

    const productOrder = await productService.getProductOrderById(orderId)
    if (productOrder === null) {
      res.status(404).json({ message: 'Product order not found' })
      return
    }
    res.status(200).json(productOrder)
  } catch (error) {
    if (error instanceof DatabaseError) {
      res.status(500).json({ message: error.message })
    } else {
      res.status(500).json({ message: 'An unexpected error occurred' })
    }
  }
}

export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params
    const { status } = req.body

    if (status == null) {
      res.status(400).json({ message: 'Status is required' })
      return
    }

    const updatedOrder = await productService.updateProductOrderStatus(orderId, status as OrderStatus)
    res.status(200).json(updatedOrder)
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

export const deleteOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params

    await productService.deleteProductOrder(orderId)
    res.status(204).send()
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

export const getOrdersByDateRange = async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query

    if (startDate == null || endDate == null) {
      res.status(400).json({ message: 'Start date and end date are required' })
      return
    }

    const orders = await productService.getOrdersByDateRange(new Date(startDate as string), new Date(endDate as string))
    res.status(200).json(orders)
  } catch (error) {
    if (error instanceof DatabaseError) {
      res.status(500).json({ message: error.message })
    } else {
      res.status(500).json({ message: 'An unexpected error occurred' })
    }
  }
}
