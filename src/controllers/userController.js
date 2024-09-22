import db from '../db/dbConnection.js';

// CREATE: Add a new user with image upload
export const createUser = (req, res) => {
  // Check if an image file was uploaded
  const imagePath = req.file ? req.file.path : null;

  // Extract user details from the request body
  const { username, email, password_hash, verified_email } = req.body;

  // SQL query to insert the new user
  const sql = `
    INSERT INTO users (username, email, password_hash, verified_email, image_path)
    VALUES (?, ?, ?, ?, ?)`;

  // Execute the SQL query
  db.query(sql, [username, email, password_hash, verified_email, imagePath], (err, result) => {
    if (err) {
      console.error('Error inserting user: ', err);
      return res.status(500).json({ message: 'Failed to add user', error: err });
    }
    res.status(201).json({ message: 'User added successfully', userId: result.insertId });
  });
};

// READ: Get all users
export const getAllUsers = (req, res) => {
  const sql = 'SELECT * FROM users';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching users: ', err);
      return res.status(500).json({ message: 'Failed to fetch users', error: err });
    }
    res.json(results);
  });
};

// READ: Get a specific user by ID
export const getUserById = (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM users WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error fetching user: ', err);
      return res.status(500).json({ message: 'Failed to fetch user', error: err });
    }
    res.json(result);
  });
};

// UPDATE: Update a user's email, verification status, and image path
export const updateUser = (req, res) => {
  const { id } = req.params;
  const { email, verified_email } = req.body;
  const imagePath = req.file ? req.file.path : null;

  const sql = 'UPDATE users SET email = ?, verified_email = ?, image_path = ? WHERE id = ?';
  db.query(sql, [email, verified_email, imagePath, id], (err, result) => {
    if (err) {
      console.error('Error updating user: ', err);
      return res.status(500).json({ message: 'Failed to update user', error: err });
    }
    res.send('User updated successfully!');
  });
};

// DELETE: Delete a user by ID
export const deleteUser = (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM users WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error deleting user: ', err);
      return res.status(500).json({ message: 'Failed to delete user', error: err });
    }
    res.send('User deleted successfully!');
  });
};
