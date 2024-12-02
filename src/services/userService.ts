import { User, UserType } from '../models/User'
import { CreateUserInput, UpdateUserInput } from '../types/user'
import {
  NotFoundError,
  DatabaseError,
  AuthorizationError
} from '../utils/errors'
import bcrypt from 'bcryptjs'
import { login, logout, refreshToken } from '../middleware/auth'
import { Session, SessionType } from '../models/Session'

export const createUser = async (data: CreateUserInput): Promise<UserType> => {
  try {
    const hashedPassword = await bcrypt.hash(data.password, 10)
    const user = await User.create({
      data: {
        ...data,
        password: hashedPassword
      }
    })

    return user
  } catch (error) {
    throw new DatabaseError('Failed to create user')
  }
}

export const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<boolean> => {
  try {
    const user = await User.findUnique({
      where: { id: userId },
      select: { id: true, password: true }
    })

    if (user == null) {
      throw new NotFoundError('User not found')
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    )
    if (!isPasswordValid) {
      throw new AuthorizationError('Current password is incorrect')
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10)

    await User.update({
      where: { id: userId },
      data: { password: hashedNewPassword }
    })

    return true
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof AuthorizationError) {
      throw error
    }
    throw new DatabaseError('Failed to change password')
  }
}

export const loginUser = async (
  email: string,
  password: string
): Promise<{ user: Omit<UserType, 'password'>, token: string }> => {
  try {
    const user = await User.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        password: true,
        phone: true,
        address: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (user === null) {
      throw new NotFoundError('User not found')
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      throw new AuthorizationError('Invalid credentials')
    }

    const { password: _, ...userWithoutPassword } = user
    const token = await login(user)

    return { user: userWithoutPassword, token }
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof AuthorizationError) {
      throw error
    }
    throw new Error('An unexpected error occurred during login')
  }
}

export const logoutUser = async (token: string): Promise<void> => {
  try {
    await logout(token)
  } catch (error) {
    throw new DatabaseError('Failed to logout user')
  }
}

export const verifySession = async (
  token: string
): Promise<{ session: SessionType }> => {
  try {
    const session = await Session.findUnique({
      where: { token }
    })

    if (session == null) {
      throw new AuthorizationError('Invalid or expired session')
    }

    if (session.expiresAt < new Date()) {
      await Session.delete({ where: { id: session.id } })
      throw new AuthorizationError('Session has expired')
    }

    const refreshedSession = await refreshToken(token, session.userId)

    return { session: refreshedSession }
  } catch (error) {
    if (error instanceof AuthorizationError) {
      throw error
    }
    throw new DatabaseError('Failed to verify session')
  }
}

export const updateUser = async (
  id: string,
  data: UpdateUserInput
): Promise<UserType> => {
  try {
    return await User.update({
      where: { id },
      data
    })
  } catch (error) {
    throw new DatabaseError('Failed to update user')
  }
}

export const getUserById = async (id: string): Promise<UserType> => {
  try {
    const user = await User.findUnique({
      where: { id }
    })
    if (user === null) {
      throw new NotFoundError('User not found')
    }
    return user
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error
    }
    throw new DatabaseError('Failed to fetch user')
  }
}

export const getUserRole = async (userId: string): Promise<string> => {
  try {
    const user = await User.findUnique({
      where: { id: userId },
      select: { role: true }
    })

    if (user === null) {
      throw new NotFoundError('User not found')
    }

    return user.role
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error
    }
    throw new DatabaseError('Failed to fetch user role')
  }
}

export const getUserData = async (
  userId: string
): Promise<
Pick<UserType, 'firstName' | 'lastName' | 'email' | 'phone' | 'address'>
> => {
  try {
    const user = await User.findUnique({
      where: { id: userId },
      select: {
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        address: true
      }
    })

    if (user === null) {
      throw new NotFoundError('User not found')
    }

    return user
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error
    }
    throw new DatabaseError('Failed to fetch user role')
  }
}
