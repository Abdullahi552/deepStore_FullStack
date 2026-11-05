import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { failure } from '../utils/apiResponse.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

export const errorHandler = (err, req, res, next) => {
  // If headers already sent, defer to Express's default handler
  if (res.headersSent) return next(err);

  // Known operational error — safe to expose
  if (err instanceof ApiError) {
    return failure(res, err.message, err.code, err.statusCode, err.details);
  }

  // Mongoose: bad ObjectId format
  if (err.name === 'CastError') {
    return failure(
      res,
      `Invalid ${err.path}: ${err.value}`,
      ERROR_CODES.VALIDATION_ERROR,
      HTTP_STATUS.BAD_REQUEST
    );
  }

  // Mongoose: schema validation failed
  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return failure(
      res,
      'Validation failed',
      ERROR_CODES.VALIDATION_ERROR,
      HTTP_STATUS.UNPROCESSABLE_ENTITY,
      details
    );
  }

  // Mongo: duplicate key (e.g. unique email or unique cart.user)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue ?? {})[0] ?? 'field';
    return failure(
      res,
      `Duplicate value for ${field}`,
      ERROR_CODES.VALIDATION_ERROR,
      HTTP_STATUS.CONFLICT
    );
  }

  // JWT errors that bubbled up uncaught
  if (err.name === 'TokenExpiredError') {
    return failure(
      res,
      'Token expired',
      ERROR_CODES.TOKEN_EXPIRED,
      HTTP_STATUS.UNAUTHORIZED
    );
  }
  if (err.name === 'JsonWebTokenError') {
    return failure(
      res,
      'Invalid token',
      ERROR_CODES.TOKEN_INVALID,
      HTTP_STATUS.UNAUTHORIZED
    );
  }

  // Unknown error — log it, hide details in production
  console.error('💥 Unhandled error:', err);

  const message =
    env.NODE_ENV === 'production' ? 'Something went wrong' : err.message;

  return failure(
    res,
    message,
    ERROR_CODES.INTERNAL_ERROR,
    HTTP_STATUS.INTERNAL_SERVER_ERROR
  );
};