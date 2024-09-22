import db from '../db/dbConnection.js';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

function getIdFromImgurLink(link) {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:imgur\.com\/)(.+?)(?:\.(?:png|jpg|jpeg|gif))?$/;
    const match = link.match(regex);
    return match ? match[1] : null;
}

const getAccessToken = async () => {
    try {
        const response = await axios.post(process.env.IMGUR_TOKEN_URL,
            {
                grant_type: 'refresh_token',
                refresh_token: process.env.IMGUR_REFRESH_TOKEN,
                client_id: process.env.IMGUR_CLIENT_ID,
                client_secret: process.env.IMGUR_CLIENT_SECRET,
            },
        );

        const { access_token, expires_in } = response.data;

        // Here you might want to save the new access token and expiration time
        console.log('New Access Token:', access_token);
        console.log('Expires In:', expires_in, 'seconds');

        return access_token;
    } catch (error) {
        console.error('Error fetching new access token:', error.response ? error.response.data : error.message);
        throw error; // rethrow the error after logging
    }
};

// CREATE: Add a new user with image upload
export const createUser = async (req, res) => {
    // Check if an image file was uploaded
    const imgData = req.file ? req.file.buffer.toString('base64') : null;

    const response = await axios.post('https://api.imgur.com/3/image', {
        image: imgData,
        type: 'base64',
    }, {
        headers: {
            Authorization: `Bearer ${await getAccessToken()}`,
        },
    });

    // Extract user details from the request body
    const { username, email, password_hash, verified_email } = req.body;

    // SQL query to insert the new user
    const sql = `
    INSERT INTO users (username, email, password_hash, verified_email, image_path)
    VALUES (?, ?, ?, ?, ?)`;

    // Execute the SQL query
    db.query(sql, [username, email, password_hash, verified_email, response.data.data.link], (err, result) => {
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
export const updateUser = async (req, res) => {
    const { id } = req.params;
    const { email, verified_email } = req.body;

    // Get the user's current image path from the database
    const getUserSql = 'SELECT image_path FROM users WHERE id = ?';
    db.query(getUserSql, [id], async (err, result) => {
        if (err) {
            console.error('Error fetching user: ', err);
            return res.status(500).json({ message: 'Failed to fetch user', error: err });
        }

        const oldImageUrl = result[0].image_path;
        const oldImageId = getIdFromImgurLink(oldImageUrl);

        // Delete old image from Imgur if a new image is uploaded
        if (req.file) {
            if (oldImageId) {
                try {
                    await axios.delete(`https://api.imgur.com/3/image/${oldImageId}`, {
                        headers: {
                            Authorization: `Bearer ${await getAccessToken()}`,
                        },
                    });
                } catch (error) {
                    console.error('Error deleting old image: ', error.response ? error.response.data : error.message);
                    return res.status(500).json({ message: 'Failed to delete old image', error: error.response.data });
                }
            }

            // Upload the new image to Imgur
            const imgData = req.file.buffer.toString('base64');
            try {
                const response = await axios.post('https://api.imgur.com/3/image', {
                    image: imgData,
                    type: 'base64',
                }, {
                    headers: {
                        Authorization: `Bearer ${await getAccessToken()}`,
                    },
                });

                // Update the user's image_path with the new image URL
                const newImageUrl = response.data.data.link;
                const sql = 'UPDATE users SET email = ?, verified_email = ?, image_path = ? WHERE id = ?';
                db.query(sql, [email, verified_email, newImageUrl, id], (err, result) => {
                    if (err) {
                        console.error('Error updating user: ', err);
                        return res.status(500).json({ message: 'Failed to update user', error: err });
                    }
                    res.send('User updated successfully!');
                });
            } catch (error) {
                console.error('Error uploading new image: ', error.response ? error.response.data : error.message);
                return res.status(500).json({ message: 'Failed to upload new image', error: error.response.data });
            }
        } else {
            // Update user without changing the image
            const sql = 'UPDATE users SET email = ?, verified_email = ? WHERE id = ?';
            db.query(sql, [email, verified_email, id], (err, result) => {
                if (err) {
                    console.error('Error updating user: ', err);
                    return res.status(500).json({ message: 'Failed to update user', error: err });
                }
                res.send('User updated successfully!');
            });
        }
    });
};

// DELETE: Delete a user by ID
export const deleteUser = async (req, res) => {
    const { id } = req.params;

    // Get the user's current image path from the database
    const getUserSql = 'SELECT image_path FROM users WHERE id = ?';
    db.query(getUserSql, [id], async (err, result) => {
        if (err) {
            console.error('Error fetching user: ', err);
            return res.status(500).json({ message: 'Failed to fetch user', error: err });
        }

        const imageUrl = result[0].image_path;
        const imageId = getIdFromImgurLink(imageUrl);

        // Delete the user from the database
        const sql = 'DELETE FROM users WHERE id = ?';
        db.query(sql, [id], async (err, result) => {
            if (err) {
                console.error('Error deleting user: ', err);
                return res.status(500).json({ message: 'Failed to delete user', error: err });
            }

            // Delete the image from Imgur
            if (imageId) {
                try {
                    await axios.delete(`https://api.imgur.com/3/image/${imageId}`, {
                        headers: {
                            Authorization: `Bearer ${await getAccessToken()}`,
                        },
                    });
                } catch (error) {
                    console.error('Error deleting image from Imgur: ', error.response ? error.response.data : error.message);
                    return res.status(500).json({ message: 'Failed to delete image from Imgur', error: error.response.data });
                }
            }

            res.send('User and associated image deleted successfully!');
        });
    });
};
