import { CategoryType } from '../models/Category'

export interface CreateCategoryInput {
  name: string
}

export interface UpdateCategoryInput {
  name?: string
}

export interface CategoryWithProductsCount extends CategoryType {
  _count: {
    products: number
  }
}
