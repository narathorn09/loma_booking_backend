import { Router } from 'express';
const router = Router();
import { getAllUsers, createUser, getUserById, updateUser, deleteUser } from '../controllers/userController.js'; 

// Define routes
router.route('/users')
  .get(getAllUsers)                          // Get all users
  .post(createUser)                          // Create user
router.route('/users/:id')
  .get(getUserById)                          // Get user by ID
  .put(updateUser)                           // Update user by ID
  .delete( deleteUser)                       // Delete user by ID


export default router;
