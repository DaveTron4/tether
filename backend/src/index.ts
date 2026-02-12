import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import routes from './routes/index.route.js';

// Load environment from repository root (one level above `backend`)
dotenv.config({ path: path.resolve(process.cwd(), '..', '.env') });

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Tether API Server',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      clients: '/api/clients',
      paymentHistories: '/api/payment-histories'
    }
  });
});

// API Routes
app.use('/api', routes);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});