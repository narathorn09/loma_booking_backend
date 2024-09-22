import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/');  // Folder where images will be saved
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));  // Save with a unique name
    }
});

const upload = multer({ storage }).single('image');  // Use shorthand for storage

export default upload;
