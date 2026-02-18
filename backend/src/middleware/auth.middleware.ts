// src/middleware/auth.middleware.ts
import type { Request, Response, NextFunction } from 'express';
import type { AuthRequest } from '../models/authRequest.interface.js';
import jwt from 'jsonwebtoken';

// The Token Verifier
export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const rawAuthHeader = (req.get && req.get('authorization')) || req.headers['authorization'];
  const authHeader = typeof rawAuthHeader === 'string' ? rawAuthHeader : Array.isArray(rawAuthHeader) ? rawAuthHeader[0] : undefined;
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) return res.status(500).json({ error: 'Server misconfigured: JWT secret missing' });
    
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next(); 
  } catch (err: any) {
    if (err?.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired. Please log in again.' });
    }
    res.status(403).json({ error: 'Invalid token.' });
  }
};

// The Admin Check
export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {

  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admins only.' });
  }
  next();
};