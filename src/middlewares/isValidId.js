import { isValidObjectId } from 'mongoose';
import createHttpError from 'http-errors';

export const isValidId = (req, res, next) => {
    const { entryId } = req.params;
    if (!isValidObjectId(entryId)) {
        next(createHttpError(400, `${entryId} is not valid id`));
    }
    next();
};