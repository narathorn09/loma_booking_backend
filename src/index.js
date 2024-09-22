import express from 'express';
import cors from 'cors'; // Import CORS
import userRoutes from './routes/userRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['https://loma-booking-frontend.vercel.app', 'http://localhost:3000'], // Allowed origins
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Specify allowed headers
  credentials: true, // Allow cookies and credentials
  preflightContinue: false // Automatically handle OPTIONS requests
}));

// Use built-in express.json middleware for parsing JSON request bodies
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello from Express.js server!!");
});

app.use('/api', userRoutes); 

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
