import express from 'express';
import { matchRouter } from './routes/matches.js';

const app = express();
const PORT = 8000;

// Middleware
app.use(express.json());

app.use('/matches', matchRouter)
// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Sports Socket API! 🚀' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
