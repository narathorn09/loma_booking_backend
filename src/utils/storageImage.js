import multer from 'multer';

const storage = multer.memoryStorage();

const upload = multer({ storage }).single('image');  // Use shorthand for storage

export default upload;
