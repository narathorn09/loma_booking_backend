import express from 'express';
import pkg from 'body-parser';
import cors from 'cors'; // Import CORS
import userRoutes from './routes/userRoutes.js';

const { json } = pkg;
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', 'https://loma-booking-frontend.vercel.app'); //หรือใส่แค่เฉพาะ domain ที่ต้องการได้
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});


app.use(cors({
  origin: ['https://loma-booking-frontend.vercel.app', 'http://localhost:3000'], // Array of allowed origins
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed methods
  credentials: true
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
