import { JwtPayload as BaseJwtPayload } from 'jsonwebtoken'
import { Role } from './user'

declare module 'jsonwebtoken' {
  export interface JwtPayload extends BaseJwtPayload {
    userId: string
    role: Role
  }
}
