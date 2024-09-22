import db from '../db/dbConnection.js'; 

// CREATE: Add a new user
export function createUser(req, res) {
  const { username, email, password_hash, verified_email } = req.body;
  const sql = `INSERT INTO users (username, email, password_hash, verified_email)
               VALUES (?, ?, ?, ?)`;
  db.query(sql, [username, email, password_hash, verified_email], (err, result) => {
    if (err) throw err;
    res.send('User added successfully!');
  });
}

// READ: Get all users
export function getAllUsers(req, res) {
  const sql = 'SELECT * FROM users';
  db.query(sql, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
}

// READ: Get a specific user by ID
export function getUserById(req, res) {
  const { id } = req.params;
  const sql = 'SELECT * FROM users WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) throw err;
    res.json(result);
  });
}

// UPDATE: Update a user's email and verification status
export function updateUser(req, res) {
  const { id } = req.params;
  const { email, verified_email } = req.body;
  const sql = 'UPDATE users SET email = ?, verified_email = ? WHERE id = ?';
  db.query(sql, [email, verified_email, id], (err, result) => {
    if (err) throw err;
    res.send('User updated successfully!');
  });
}

// DELETE: Delete a user by ID
export function deleteUser(req, res) {
  const { id } = req.params;
  const sql = 'DELETE FROM users WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) throw err;
    res.send('User deleted successfully!');
  });
}
