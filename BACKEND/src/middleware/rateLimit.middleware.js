import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';
import { failure } from '../utils/apiResponse.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

const handler = (req, res) =>
  failure(
    res,
    'Too many requests, please try again later',
    ERROR_CODES.RATE_LIMITED,
    HTTP_STATUS.TOO_MANY_REQUESTS
  );

// General limiter — apply to all /api routes
export const generalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});

// Strict limiter — apply to auth endpoints only
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});