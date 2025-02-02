import createHttpError from 'http-errors';

export const isValidateMonth = (req, res, next) => {
  const { date } = req.params;
  const dateRegex = /^\d{4}-(?:0[1-9]|1[0-2])$/;
  
  if (!dateRegex.test(date)) {
    next(createHttpError(400, 'Invalid date format. Use YYYY-MM'));
  }
  next();
}; 