import { User } from '../models/User'
import { ProductOrder, ProductOrderType } from '../models/ProductOrder'
import { Cart } from '../models/Cart'
import { CartItem } from '../models/CartItem'
import { PurchaseHistory } from '../models/PurchaseHistory'
import { DatabaseError, NotFoundError, ValidationError } from '../utils/errors'
import { ProductListing } from '../models/ProductListing'
import { OrderStatus } from '@prisma/client'

export const createOrder = async (userId: string): Promise<ProductOrderType[]> => {
  const cart = await Cart.findUnique({
    where: { userId },
    include: { items: { include: { productListing: true } } }
  })

  if ((cart == null) || cart.items.length === 0) {
    throw new ValidationError('Cart is empty or does not exist')
  }

  const user = await User.findUnique({ where: { id: userId } })
  if (user == null) {
    throw new NotFoundError('User not found')
  }

  const orders: ProductOrderType[] = []

  try {
    let purchaseHistory = await PurchaseHistory.findFirst({
      where: { buyerId: userId }
    })

    if (purchaseHistory == null) {
      purchaseHistory = await PurchaseHistory.create({
        data: {
          buyerId: userId,
          orders: {
            create: []
          }
        }
      })
    }

    const createdOrders = await Promise.all(
      cart.items.map(async (cartItem) => {
        const {
          productListing,
          quantity
        } = cartItem
        if (productListing == null) {
          throw new NotFoundError('Associated product listing not found')
        }

        const order = await ProductOrder.create({
          data: {
            productListingId: productListing.id,
            quantity,
            status: OrderStatus.PROCESSING,
            purchaseDate: new Date()
          }
        })

        orders.push(order)
        return order
      })
    )

    await PurchaseHistory.update({
      where: { id: purchaseHistory.id },
      data: {
        orders: {
          connect: createdOrders.map(order => ({ id: order.id }))
        }
      }
    })

    await CartItem.deleteMany({
      where: { cartId: cart.id }
    })

    return orders
  } catch (error) {
    throw new DatabaseError('Failed to create order')
  }
}

export const updateOrderStatus = async (
  orderId: string,
  sellerId: string,
  status: OrderStatus
): Promise<ProductOrderType> => {
  const order = await ProductOrder.findUnique({
    where: { id: orderId },
    include: {
      productListing: {
        include: {
          sellerProducts: true
        }
      }
    }
  })

  if (order == null) {
    throw new NotFoundError('Order not found')
  }

  if (order.productListing.sellerProducts.sellerId !== sellerId) {
    throw new ValidationError('Seller not authorized to modify this order')
  }

  try {
    if (status === OrderStatus.CONFIRMED) {
      const productListing = order.productListing
      if (productListing != null) {
        await ProductListing.update({
          where: { id: productListing.id },
          data: {
            stock: {
              decrement: order.quantity
            }
          }
        })
      }
    }

    return await ProductOrder.update({
      where: { id: orderId },
      data: { status }
    })
  } catch (error) {
    throw new DatabaseError('Failed to update order status')
  }
}

export const cancelOrder = async (orderId: string, userId: string): Promise<void> => {
  const order = await ProductOrder.findUnique({
    where: { id: orderId },
    include: { purchaseHistory: true }
  })

  if (order == null) {
    throw new NotFoundError('Order not found')
  }

  if (order.purchaseHistory == null) {
    throw new NotFoundError('Purchase history not found')
  }

  if (order.purchaseHistory.buyerId !== userId) {
    throw new ValidationError('User not authorized to cancel this order')
  }

  try {
    await ProductOrder.update({
      where: { id: orderId },
      data: { status: OrderStatus.CANCELED }
    })
  } catch (error) {
    throw new DatabaseError('Failed to cancel order')
  }
}

export const cancelAllPendingOrders = async (userId: string): Promise<void> => {
  const pendingOrders = await ProductOrder.findMany({
    where: {
      status: OrderStatus.PROCESSING,
      purchaseHistory: {
        buyerId: userId
      }
    },
    include: { purchaseHistory: true }
  })

  console.log({ pendingOrders })

  if (pendingOrders.length === 0) {
    throw new NotFoundError('No pending orders found for this user')
  }

  try {
    await Promise.all(
      pendingOrders.map(async order =>
        await ProductOrder.update({
          where: { id: order.id },
          data: { status: OrderStatus.CANCELED }
        })
      )
    )
  } catch (error) {
    throw new DatabaseError('Failed to cancel orders')
  }
}

export const getUserOrders = async (userId: string): Promise<ProductOrderType[]> => {
  const orders = await ProductOrder.findMany({
    where: {
      purchaseHistory: {
        buyerId: userId
      }
    },
    include: { productListing: true }
  })

  if (orders.length === 0) {
    console.log('No orders found for the user')
    return []
  }

  return orders
}
