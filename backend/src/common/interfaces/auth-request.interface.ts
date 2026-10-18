import { Request } from 'express';

export interface AuthRequest extends Request {
  user: {
    sub: string;
    email: string;
    role: string;
    companyId: string;
    status: string;
  };
}