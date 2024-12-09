import { User } from '../models/User'
import { ProductOrder, ProductOrderType } from '../models/ProductOrder'
import { Cart } from '../models/Cart'
import { CartItem } from '../models/CartItem'
import { PurchaseHistory } from '../models/PurchaseHistory'
import { DatabaseError, NotFoundError, ValidationError } from '../utils/errors'
import { ProductListing } from '../models/ProductListing'
import { OrderStatus } from '@prisma/client'

export const createOrder = async (userId: string): Promise<ProductOrderType[]> => {
  // Retrieve the user's cart
  const cart = await Cart.findUnique({
    where: { userId },
    include: { items: { include: { productListing: true } } }
  })

  if ((cart == null) || cart.items.length === 0) {
    throw new ValidationError('Cart is empty or does not exist')
  }

  // Retrieve the user
  const user = await User.findUnique({ where: { id: userId } })
  if (user == null) {
    throw new NotFoundError('User not found')
  }

  const orders: ProductOrderType[] = []

  try {
    // Create a purchase history entry if it does not exist
    let purchaseHistory = await PurchaseHistory.findFirst({
      where: { buyerId: userId }
    })

    if (purchaseHistory == null) {
      purchaseHistory = await PurchaseHistory.create({
        data: {
          buyerId: userId,
          orders: {
            create: [] // We'll populate this with real data later
          }
        }
      })
    }

    // Create ProductOrder records from cart items first
    const createdOrders = await Promise.all(
      cart.items.map(async (cartItem) => {
        const {
          productListing,
          quantity
        } = cartItem
        if (productListing == null) {
          throw new NotFoundError('Associated product listing not found')
        }

        // Create the order
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

    // Associate the created orders with the purchase history
    await PurchaseHistory.update({
      where: { id: purchaseHistory.id },
      data: {
        orders: {
          connect: createdOrders.map(order => ({ id: order.id }))
        }
      }
    })

    // Clear the cart
    await CartItem.deleteMany({
      where: { cartId: cart.id }
    })

    return orders
  } catch (error) {
    throw new DatabaseError('Failed to create order')
  }
}

// Update order status
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

// Cancel order by user
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

// Cancel all pending orders by user
export const cancelAllPendingOrders = async (userId: string): Promise<void> => {
  // Buscar todas las órdenes con estado 'PROCESSING' que pertenecen al usuario
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
    // Actualizar todas las órdenes a estado 'CANCELED'
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

// View orders by user
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
