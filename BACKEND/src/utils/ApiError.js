import { HTTP_STATUS } from '../constants/httpStatus.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

export class ApiError extends Error {
  constructor(statusCode, code, message, details = null) {
    super(message);

    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }

  // 400 — malformed request
  static badRequest(message = 'Bad request', code = ERROR_CODES.VALIDATION_ERROR, details = null) {
    return new ApiError(HTTP_STATUS.BAD_REQUEST, code, message, details);
  }

  // 401 — not logged in / bad credentials
  static unauthorized(message = 'Authentication required', code = ERROR_CODES.UNAUTHORIZED) {
    return new ApiError(HTTP_STATUS.UNAUTHORIZED, code, message);
  }

  // 403 — logged in but not allowed
  static forbidden(message = 'Not authorized', code = ERROR_CODES.FORBIDDEN) {
    return new ApiError(HTTP_STATUS.FORBIDDEN, code, message);
  }

  // 404 — resource missing
  static notFound(message = 'Resource not found', code = ERROR_CODES.NOT_FOUND) {
    return new ApiError(HTTP_STATUS.NOT_FOUND, code, message);
  }

  // 409 — duplicate / conflict
  static conflict(message = 'Resource conflict', code = ERROR_CODES.VALIDATION_ERROR) {
    return new ApiError(HTTP_STATUS.CONFLICT, code, message);
  }

  // 422 — validation failed
  static validation(message = 'Validation failed', details = null) {
    return new ApiError(
      HTTP_STATUS.UNPROCESSABLE_ENTITY,
      ERROR_CODES.VALIDATION_ERROR,
      message,
      details
    );
  }

  // 500 — bug
  static internal(message = 'Something went wrong') {
    return new ApiError(
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_CODES.INTERNAL_ERROR,
      message
    );
  }
}