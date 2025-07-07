import 'express';
import { User } from '../../src/models/User';

declare module 'express' {
  export interface Request {
    user?: User;
  }
} 