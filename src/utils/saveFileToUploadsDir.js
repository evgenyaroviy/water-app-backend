import * as fs from 'node:fs/promises';
import * as path from 'node:path';

import { UPLOAD_DIR } from '../constants/index.js';


export const saveFileToUploadsDir = async file => {
    const newPaths = path.join(UPLOAD_DIR, file.filename);
    await fs.rename(file.path, newPaths);
    return `/${file.filename}`;
};