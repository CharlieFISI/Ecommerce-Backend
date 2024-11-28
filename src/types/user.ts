import { Prisma, Role } from '@prisma/client'

export type Address = Prisma.AddressGetPayload<{}>

export { Role }

export interface CreateUserInput {
  name: string
  email: string
  password: string
  role: Role
  phone?: string
  address?: Address
}

export interface UpdateUserInput {
  name?: string
  email?: string
  password?: string
  role?: Role
  phone?: string
  address?: Address
}
