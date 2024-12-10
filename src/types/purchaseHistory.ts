import { OrderStatus } from './productOrder'

export interface CreatePurchaseHistoryInput {
  buyerId: string
}

export interface AddOrderInput {
  orderId: string
  status: OrderStatus
}

export interface UpdateOrderStatusInput {
  orderId: string
  status: OrderStatus
}
