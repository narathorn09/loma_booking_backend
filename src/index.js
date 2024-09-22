import express from 'express';
import pkg from 'body-parser';
import cors from 'cors'; // Import CORS
import userRoutes from './routes/userRoutes.js';

const { json } = pkg;
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['https://loma-booking-frontend.vercel.app', 'http://localhost:3000'], // Array of allowed origins
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed methods
}));

app.use(json());

app.get("/", (req, res) => {
  res.send("Hello from Express.js server!!");
});

app.use('/api', userRoutes); 

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
