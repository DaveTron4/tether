import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes/index.route.js';

dotenv.config();

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

// 404 for unknown routes
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// centralized error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err); // keep server-side logs, avoid leaking stack to clients in production
  const status = err.status || 500;
  const message = process.env.NODE_ENV === 'production' ? 'Internal Server Error' : (err.message || 'Internal Server Error');
  res.status(status).json({ error: message });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});