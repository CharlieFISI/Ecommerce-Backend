import { Category, CategoryType } from '../models/Category'
import { Product, ProductType } from '../models/Product'
import { ProductListing, ProductListingType } from '../models/ProductListing'
import { ProductOrder, ProductOrderType } from '../models/ProductOrder'
import {
  PurchaseHistory,
  PurchaseHistoryType
} from '../models/PurchaseHistory'
import { SellerProducts, SellerProductsType } from '../models/SellerProducts'
import { User } from '../models/User'
import { CreateCategoryInput, UpdateCategoryInput } from '../types/category'
import { CreateProductInput, UpdateProductInput } from '../types/product'
import {
  ListingProducts,
  SimplifiedProductListing
} from '../types/productListing'
import { OrderStatus } from '../types/productOrder'
import { CreateSellerProductsInput } from '../types/sellerProducts'
import {
  NotFoundError,
  DatabaseError,
  ValidationError,
  isPrismaError
} from '../utils/errors'

export const getAllProducts = async (): Promise<ProductType[]> => {
  try {
    return await Product.findMany()
  } catch (error) {
    throw new DatabaseError('Failed to fetch products')
  }
}

export const getProductById = async (id: string): Promise<ProductType> => {
  try {
    const product = await Product.findUnique({ where: { id } })
    if (product == null) {
      throw new NotFoundError('Product not found')
    }
    return product
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error
    }
    throw new DatabaseError('Failed to fetch product')
  }
}

export const searchProducts = async (name: string): Promise<ProductType[]> => {
  try {
    const searchTerms = name
      .toLowerCase()
      .split(' ')
      .filter((term) => term.length > 0)

    if (searchTerms.length === 0) {
      return []
    }

    const products = await Product.findMany({
      where: {
        OR: searchTerms.map((term) => ({
          name: {
            contains: term,
            mode: 'insensitive'
          }
        }))
      },
      take: 5
    })

    const filteredProducts = products.filter((product) => {
      const productNameWords = product.name.toLowerCase().split(' ')
      return searchTerms.every((term) =>
        productNameWords.some((word) => word.includes(term))
      )
    })

    return filteredProducts
  } catch (error) {
    console.error('Error searching products:', error)
    throw new DatabaseError('Failed to search products')
  }
}

export const createProduct = async (
  data: CreateProductInput
): Promise<ProductType> => {
  try {
    return await Product.create({ data })
  } catch (error) {
    if (isPrismaError(error) && error.code === 'P2002') {
      throw new ValidationError('Product with this name already exists')
    }
    throw new DatabaseError('Failed to create product')
  }
}

export const updateProduct = async (
  id: string,
  data: UpdateProductInput
): Promise<ProductType> => {
  try {
    return await Product.update({
      where: { id },
      data
    })
  } catch (error) {
    if (isPrismaError(error) && error.code === 'P2025') {
      throw new NotFoundError('Product not found')
    }
    throw new DatabaseError('Failed to update product')
  }
}

export const deleteProduct = async (productId: string): Promise<void> => {
  try {
    const productListings = await ProductListing.findMany({
      where: { productId }
    })

    if (productListings.length > 0) {
      throw new ValidationError(
        'Cannot delete product. It exists in one or more ProductListings'
      )
    }

    await Product.delete({
      where: { id: productId }
    })
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error
    }
    throw new DatabaseError('Failed to delete product')
  }
}

export const createCategory = async (
  data: CreateCategoryInput
): Promise<CategoryType> => {
  try {
    return await Category.create({ data })
  } catch (error) {
    if (isPrismaError(error) && error.code === 'P2002') {
      throw new ValidationError('Category with this name already exists')
    }
    throw new DatabaseError('Failed to create category')
  }
}

export const getAllCategories = async (): Promise<CategoryType[]> => {
  try {
    return await Category.findMany()
  } catch (error) {
    throw new DatabaseError('Failed to fetch categories')
  }
}

export const getCategoryById = async (id: string): Promise<CategoryType> => {
  try {
    const category = await Category.findUnique({ where: { id } })
    if (category == null) {
      throw new NotFoundError('Category not found')
    }
    return category
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error
    }
    throw new DatabaseError('Failed to fetch category')
  }
}

export const updateCategory = async (
  id: string,
  data: UpdateCategoryInput
): Promise<CategoryType> => {
  try {
    return await Category.update({
      where: { id },
      data
    })
  } catch (error) {
    if (isPrismaError(error) && error.code === 'P2025') {
      throw new NotFoundError('Category not found')
    }
    throw new DatabaseError('Failed to update category')
  }
}

export const deleteCategory = async (id: string): Promise<void> => {
  try {
    await Category.delete({
      where: { id }
    })
  } catch (error) {
    if (isPrismaError(error) && error.code === 'P2025') {
      throw new NotFoundError('Category not found')
    }
    throw new DatabaseError('Failed to delete category')
  }
}

export const getProductListings = async (
  productId: string
): Promise<ProductListingType[]> => {
  try {
    const product = await Product.findUnique({
      where: { id: productId },
      include: { listings: true }
    })

    if (product == null) {
      throw new NotFoundError('Product not found')
    }

    return product.listings
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error
    }
    throw new DatabaseError('Failed to fetch product listings')
  }
}

export const getProductListingsByUser = async (
  userId: string
): Promise<SimplifiedProductListing[]> => {
  try {
    const user = await User.findUnique({
      where: { id: userId },
      include: { sellerProducts: true }
    })

    if (user == null) {
      throw new NotFoundError('User not found')
    }

    if (user.role !== 'SELLER') {
      throw new NotFoundError('User is not a seller')
    }

    if (user.sellerProducts == null) {
      return []
    }

    const productListings = await ProductListing.findMany({
      where: { sellerProductsId: user.sellerProducts.id },
      include: {
        product: {
          include: {
            category: true
          }
        }
      }
    })

    const simplifiedListings: SimplifiedProductListing[] = productListings.map(
      (listing) => ({
        productId: listing.productId,
        name: listing.product.name,
        description: listing.product.description,
        category: listing.product.category.name,
        price: listing.price,
        stock: listing.stock
      })
    )

    return simplifiedListings
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error
    }
    throw new DatabaseError('Failed to fetch product listings for the user')
  }
}

export const createSellerProducts = async (
  data: CreateSellerProductsInput
): Promise<SellerProductsType & { listings: ProductListingType[] }> => {
  try {
    const user = await User.findUnique({
      where: { id: data.sellerId }
    })

    if (user == null) {
      throw new NotFoundError('User not found')
    }

    if (user.role !== 'SELLER') {
      throw new ValidationError('User is not a seller')
    }

    let sellerProducts = await SellerProducts.findUnique({
      where: { sellerId: data.sellerId }
    })

    if (sellerProducts == null) {
      sellerProducts = await SellerProducts.create({
        data: {
          sellerId: data.sellerId
        }
      })
    }

    const listings = await createOrUpdateProductListings(
      sellerProducts.id,
      data.products
    )

    return {
      ...sellerProducts,
      listings
    }
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof ValidationError) {
      throw error
    }
    throw new DatabaseError('Failed to create or update seller products')
  }
}

export const createOrUpdateProductListings = async (
  sellerProductsId: string,
  listings: ListingProducts[]
): Promise<ProductListingType[]> => {
  try {
    const updatedListings = await Promise.all(
      listings.map(async (listing) => {
        const product = await Product.findUnique({
          where: { id: listing.productId }
        })

        if (product == null) {
          throw new NotFoundError(
            `Product with id ${listing.productId} not found`
          )
        }

        const existingListing = await ProductListing.findFirst({
          where: {
            productId: listing.productId,
            sellerProductsId
          }
        })

        if (existingListing != null) {
          return await ProductListing.update({
            where: { id: existingListing.id },
            data: { stock: listing.stock, price: listing.price }
          })
        } else {
          return await ProductListing.create({
            data: {
              productId: listing.productId,
              sellerProductsId,
              stock: listing.stock,
              price: listing.price
            }
          })
        }
      })
    )

    return updatedListings
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error
    }
    throw new DatabaseError('Failed to create or update product listings')
  }
}

export const removeProductFromSellerListing = async (
  sellerId: string,
  productId: string
): Promise<void> => {
  try {
    const sellerProducts = await SellerProducts.findUnique({
      where: { sellerId }
    })

    if (sellerProducts == null) {
      throw new NotFoundError('SellerProducts not found for this seller')
    }

    const productListing = await ProductListing.findFirst({
      where: {
        sellerProductsId: sellerProducts.id,
        productId
      }
    })

    if (productListing == null) {
      throw new NotFoundError('ProductListing not found')
    }

    await ProductListing.delete({
      where: { id: productListing.id }
    })
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error
    }
    throw new DatabaseError('Failed to remove product from seller listing')
  }
}

export const createPurchaseHistory = async (
  buyerId: string
): Promise<PurchaseHistoryType> => {
  try {
    const buyer = await User.findUnique({ where: { id: buyerId } })
    if (buyer == null) {
      throw new NotFoundError('Buyer not found')
    }

    return await PurchaseHistory.create({
      data: { buyerId }
    })
  } catch (error) {
    if (error instanceof NotFoundError) throw error
    throw new DatabaseError('Failed to create purchase history')
  }
}

export const getPurchaseHistoryByBuyerId = async (
  buyerId: string
): Promise<PurchaseHistoryType | null> => {
  try {
    const purchaseHistory = await PurchaseHistory.findUnique({
      where: { buyerId },
      include: { orders: true }
    })
    return purchaseHistory
  } catch (error) {
    throw new DatabaseError('Failed to fetch purchase history')
  }
}

export const createProductOrder = async (
  purchaseHistoryId: string,
  productListingId: string,
  quantity: number,
  status: OrderStatus
): Promise<ProductOrderType> => {
  try {
    const purchaseHistory = await PurchaseHistory.findUnique({
      where: { id: purchaseHistoryId }
    })
    if (purchaseHistory == null) {
      throw new NotFoundError('Purchase history not found')
    }

    const product = await Product.findUnique({
      where: { id: productListingId }
    })
    if (product == null) {
      throw new NotFoundError('Product not found')
    }

    const productOrder = await ProductOrder.create({
      data: {
        purchaseHistoryId,
        productListingId,
        quantity,
        status
      }
    })
    return productOrder
  } catch (error) {
    if (error instanceof NotFoundError) throw error
    throw new DatabaseError('Failed to create product order')
  }
}

export const getProductOrderById = async (
  orderId: string
): Promise<ProductOrderType | null> => {
  try {
    const productOrder = await ProductOrder.findUnique({
      where: { id: orderId },
      include: { productListing: true, purchaseHistory: true }
    })
    return productOrder
  } catch (error) {
    throw new DatabaseError('Failed to fetch product order')
  }
}

export const updateProductOrderStatus = async (
  orderId: string,
  status: OrderStatus
): Promise<ProductOrderType> => {
  try {
    const order = await ProductOrder.findUnique({ where: { id: orderId } })
    if (order == null) {
      throw new NotFoundError('Product order not found')
    }

    const updatedOrder = await ProductOrder.update({
      where: { id: orderId },
      data: { status }
    })
    return updatedOrder
  } catch (error) {
    if (error instanceof NotFoundError) throw error
    throw new DatabaseError('Failed to update product order status')
  }
}

export const deleteProductOrder = async (orderId: string): Promise<void> => {
  try {
    const order = await ProductOrder.findUnique({ where: { id: orderId } })
    if (order == null) {
      throw new NotFoundError('Product order not found')
    }

    await ProductOrder.delete({ where: { id: orderId } })
  } catch (error) {
    if (error instanceof NotFoundError) throw error
    throw new DatabaseError('Failed to delete product order')
  }
}

export const getOrdersByDateRange = async (
  startDate: Date,
  endDate: Date
): Promise<ProductOrderType[]> => {
  try {
    const orders = await ProductOrder.findMany({
      where: {
        purchaseDate: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        productListing: true,
        purchaseHistory: { include: { buyer: true } }
      }
    })
    return orders
  } catch (error) {
    throw new DatabaseError('Failed to fetch orders by date range')
  }
}

// export const getTopSellingProducts = async (limit: number = 10): Promise<Array<{ product: ProductType, totalQuantity: number }>> => {
//   try {
//     const topProducts = await ProductOrder.groupBy({
//       by: ['productId'],
//       _sum: {
//         quantity: true
//       },
//       orderBy: {
//         _sum: {
//           quantity: 'desc'
//         }
//       },
//       take: limit
//     })

//     return await Promise.all(topProducts.map(async (item) => {
//       const product = await Product.findUnique({ where: { id: item.productId } })
//       if (product == null) throw new NotFoundError(`Product with id ${item.productId} not found`)
//       return {
//         product,
//         totalQuantity: item._sum.quantity || 0
//       }
//     }))
//   } catch (error) {
//     if (error instanceof NotFoundError) throw error
//     throw new DatabaseError('Failed to fetch top selling products')
//   }
// }
