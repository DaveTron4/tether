// backend/src/index.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Allow Angular (port 4200) to talk to Express (port 3000)
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Server is running!');
});

// Mock Data Route (We will replace this with DB data later)
app.get('/api/clients', (req, res) => {
  res.json([
    { id: 1, name: 'John Doe', status: 'Paid', nextPayment: '2026-02-01' },
    { id: 2, name: 'Jane Smith', status: 'Pending', nextPayment: '2026-02-01' }
  ]);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});