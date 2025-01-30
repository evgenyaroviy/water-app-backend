import multer from "multer";

import { TEMP_UPLOAD_DIR } from "../constants/index.js";

const storage = multer.diskStorage({
    destination: TEMP_UPLOAD_DIR,
    filename: (req, file, cb) => {
        const uniquePrefix = `${Date.now()}_${Math.round(Math.random() * 1E9)}`; 
        const filename = `${uniquePrefix}_${file.originalname}`;
        cb(null, filename);
    },
});
    
const limits = { 
    fileSize: 5 * 1024 * 1024,
};

const fileFilter = (req, file, cb) => {
    const extension = file.originalname.split('.').pop(); 
    if (extension === 'exe') {
        return cb(new Error('exe files are not allowed'), false); 
    }
    cb(null, true); 
};

export const upload = multer({
    storage,
    fileFilter,
    limits, 
});