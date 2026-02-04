// src/middleware/auth.middleware.ts
import type { Request, Response, NextFunction } from 'express';
import type { AuthRequest } from '../models/authRequest.interface.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// The Token Verifier
export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.get('authorization');
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next(); 
  } catch (err) {
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