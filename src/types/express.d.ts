import { UserType } from '../models/User'
import { Role } from './user'

declare global {
  namespace Express {
    interface Request {
      user?: UserType
      sessionId?: string
      userRole?: Role
    }
  }
}
