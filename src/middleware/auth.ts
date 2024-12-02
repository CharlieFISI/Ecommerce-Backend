import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { Session, SessionType } from '../models/Session'
import { Role } from '../types/user'
import { User, UserType } from '../models/User'

const JWT_SECRET: string = process.env.JWT_SECRET

export const generateToken = (user: UserType): string => {
  return jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' })
}

export const authenticateJWT = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization

  if (authHeader == null) {
    res.status(401).json({ message: 'Authorization header is missing' })
    return
  }

  const [bearer, token] = authHeader.split(' ')

  if (bearer.toLowerCase() !== 'bearer' || token == null) {
    res.status(401).json({ message: 'Invalid authorization header format' })
    return
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload & { role: Role }

    const session = await Session.findUnique({
      where: { token },
      include: { user: true }
    })

    if (session == null) {
      res.status(401).json({ message: 'Invalid session' })
      return
    }

    req.user = session.user
    req.sessionId = session.id
    req.userRole = decoded.role
    next()
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(403).json({ message: 'Invalid token' })
    } else if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ message: 'Token expired' })
    } else {
      res.status(500).json({ message: 'An error occurred while processing the token' })
    }
  }
}

export const authorizeRole = (roles: Role | Role[]): (req: Request, res: Response, next: NextFunction) => void => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if ((req.user == null) || req.userRole == null) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }

    const authorizedRoles = Array.isArray(roles) ? roles : [roles]

    if (authorizedRoles.includes(req.userRole)) {
      next()
    } else {
      res.status(403).json({ message: 'Forbidden: Insufficient permissions' })
    }
  }
}

export const login = async (user: UserType): Promise<string> => {
  const token = generateToken(user)
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
  try {
    await Session.create({
      data: {
        token,
        userId: user.id,
        expiresAt
      }
    })
    return token
  } catch (error) {
    throw new Error('Failed to create session')
  }
}

export const logout = async (token: string): Promise<void> => {
  await Session.delete({ where: { token } })
}

export const refreshToken = async (token: string, userId: string): Promise<SessionType> => {
  try {
    const user = await User.findUnique({
      where: { id: userId }
    })

    if (user == null) {
      throw new Error('User not found')
    }

    const newToken = generateToken(user)

    const session = await Session.findUnique({
      where: { token },
      include: { user: true }
    })

    if (session == null) {
      throw new Error('Invalid session')
    }

    const updatedSession = await Session.update({
      where: { id: session.id },
      data: {
        token: newToken,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      },
      include: { user: true }
    })

    return updatedSession
  } catch (error) {
    throw new Error('Failed to refresh token')
  }
}
