import multer from "multer";
import path from 'path'


const storage = multer.memoryStorage()
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

const upload = multer({
    storage:storage,
    fileFilter:fileFilter,
    limit:{
        fileSize:1024 * 1024 * 5
    }
}).single('profileImg')


export {upload}
