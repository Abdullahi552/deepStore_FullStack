import { ApiError } from '../utils/ApiError.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

export const notFound = (req, res, next) => {
  next(
    ApiError.notFound(
      `Route not found: ${req.method} ${req.originalUrl}`,
      ERROR_CODES.NOT_FOUND
    )
  );
};