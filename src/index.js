import express from 'express';
import pkg from 'body-parser';
import userRoutes from './routes/userRoutes.js'; 

const { json } = pkg;
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(json());

// Use user routes
app.use('/api', userRoutes); 

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});