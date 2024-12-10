import { Prisma, Role } from '@prisma/client'

export type Address = Prisma.AddressGetPayload<{}>

export { Role }

export interface CreateUserInput {
  firstName: string
  lastName: string
  email: string
  password: string
  role: Role
  phone?: string
  address?: Address
}

export interface UpdateUserInput {
  firstName?: string
  lastName?: string
  email?: string
  password?: string
  role?: Role
  phone?: string
  address?: Address
}
