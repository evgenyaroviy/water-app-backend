import { v2 as cloudinary } from 'cloudinary';
import { unlink } from 'node:fs/promises';

import { getEnvVar } from '../utils/getEnvVar.js';

const cloud_name = getEnvVar('CLOUDINARY_NAME');
const api_key = getEnvVar('CLOUDINARY_KEY');
const api_secret = getEnvVar('CLOUDINARY_SECRET');

cloudinary.config({
    cloud_name,
    api_key,
    api_secret,
});



export const saveFileToCloud = async file => {
    const response = await cloudinary.uploader.upload(file.path, {
        folder: 'photo',
    });
    await unlink(file.path);
    return response.secure_url;
};