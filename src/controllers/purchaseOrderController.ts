import { Request, Response } from 'express'
import * as purchaseOrderService from './../services/purchaseOrderService'
import { NotFoundError, ValidationError, DatabaseError } from '../utils/errors'
import { OrderStatus } from '@prisma/client'

export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id

    if (userId == null) {
      res.status(401).json({ message: 'User not authenticated' })
      return
    }

    const orders = await purchaseOrderService.createOrder(userId)
    res.status(201).json(orders)
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

export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id

    if (userId == null) {
      res.status(401).json({ message: 'User not authenticated' })
      return
    }

    const {
      orderId,
      status
    } = req.body as ({ orderId: string, status: OrderStatus })
    console.log({
      orderId,
      status,
      pepe: 'the frog 🐸',
      body: req.body
    })

    if (orderId == null) {
      res.status(400).json({ message: 'Order ID is required' })
      return
    }
    if (status == null) {
      res.status(400).json({ message: 'Status is required' })
      return
    }

    const updatedOrder = await purchaseOrderService.updateOrderStatus(orderId, userId, status)
    res.status(200).json(updatedOrder)
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

export const cancelOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id
    const { orderId } = req.body

    if (userId == null) {
      res.status(401).json({ message: 'User not authenticated' })
      return
    }

    if (orderId == null) {
      res.status(400).json({ message: 'Order ID is required' })
      return
    }

    await purchaseOrderService.cancelOrder(orderId, userId)
    res.status(204).end()
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

export const cancelAllPendingOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id

    if (userId == null) {
      res.status(401).json({ message: 'User not authenticated' })
      return
    }

    // Llamada al servicio para cancelar todas las órdenes pendientes del usuario
    await purchaseOrderService.cancelAllPendingOrders(userId)
    res.status(204).end()
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

export const getUserOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id

    if (userId == null) {
      res.status(401).json({ message: 'User not authenticated' })
      return
    }

    const orders = await purchaseOrderService.getUserOrders(userId)
    if (orders.length === 0) {
      res.status(404).json({ message: 'No orders found for the user' })
    } else {
      res.status(200).json(orders)
    }
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
