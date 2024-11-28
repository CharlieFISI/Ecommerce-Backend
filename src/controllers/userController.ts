import { Request, Response } from 'express'
import * as userService from '../services/userService'
import { CreateUserInput, UpdateUserInput } from '../types/user'
import {
  AppError,
  AuthorizationError,
  DatabaseError,
  NotFoundError
} from '../utils/errors'

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const userData: CreateUserInput = req.body
    await userService.createUser(userData)
    res.status(201).json({
      message: 'Usuario registrado exitosamente'
    })
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message })
    } else {
      res
        .status(500)
        .json({ error: 'An unexpected error occurred during registration' })
    }
  }
}

export const changePassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body
    const userId = req.user?.id

    if (userId == null) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }

    await userService.changePassword(userId, currentPassword, newPassword)
    res.status(200).json({ message: 'Password changed successfully' })
  } catch (error) {
    if (error instanceof NotFoundError) {
      res.status(404).json({ message: error.message })
    } else if (error instanceof AuthorizationError) {
      res.status(401).json({ message: error.message })
    } else if (error instanceof DatabaseError) {
      res.status(500).json({ message: error.message })
    } else {
      res.status(500).json({ message: 'An unexpected error occurred' })
    }
  }
}

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body
    const { token } = await userService.loginUser(email, password)
    res.status(200).json({ token })
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message })
    } else {
      res
        .status(500)
        .json({ error: 'An unexpected error occurred during login' })
    }
  }
}

export const logoutUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (token == null) {
      res.status(401).json({ message: 'No token provided' })
      return
    }

    await userService.logoutUser(token)
    res.status(200).json({ message: 'Logout successful' })
  } catch (error) {
    if (error instanceof DatabaseError) {
      res.status(500).json({ message: error.message })
    } else {
      res
        .status(500)
        .json({ message: 'An unexpected error occurred during logout' })
    }
  }
}

export const verifySession = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (token == null) {
      res.status(401).json({ message: 'No token provided' })
      return
    }

    const { session } = await userService.verifySession(token)
    res.status(200).json({ message: 'Session is valid', session })
  } catch (error) {
    if (error instanceof AuthorizationError) {
      res.status(401).json({ message: error.message })
    } else if (error instanceof DatabaseError) {
      res.status(500).json({ message: error.message })
    } else {
      res.status(500).json({
        message: 'An unexpected error occurred during session verification'
      })
    }
  }
}

export const updateUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.params.id
    const userData: UpdateUserInput = req.body
    const updatedUser = await userService.updateUser(userId, userData)
    res.status(200).json(updatedUser)
  } catch (error) {
    if (error instanceof DatabaseError) {
      res.status(error.statusCode).json({ error: error.message })
    } else {
      res
        .status(500)
        .json({ error: 'An unexpected error occurred while updating user' })
    }
  }
}

export const getUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.id
    const user = await userService.getUserById(userId)
    res.status(200).json(user)
  } catch (error) {
    if (error instanceof DatabaseError) {
      res.status(error.statusCode).json({ error: error.message })
    } else {
      res
        .status(500)
        .json({ error: 'An unexpected error occurred while fetching user' })
    }
  }
}

export const getUserRole = async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.user == null || req.user.id == null) {
      res.status(401).json({ error: 'Unauthorized: User not authenticated' })
      return
    }

    const userId = req.user.id
    const role = await userService.getUserRole(userId)
    res.status(200).json({ role })
  } catch (error) {
    if (error instanceof NotFoundError) {
      res.status(404).json({ error: error.message })
    } else if (error instanceof DatabaseError) {
      res.status(500).json({ error: error.message })
    } else {
      res.status(500).json({ error: 'An unexpected error occurred while fetching user role' })
    }
  }
}
