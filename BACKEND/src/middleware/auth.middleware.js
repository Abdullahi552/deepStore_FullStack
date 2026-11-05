import { ApiError } from '../utils/ApiError.js';
import { verifyAccessToken } from '../utils/jwt.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

export const authenticate = (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
      throw ApiError.unauthorized(
        'Missing or malformed Authorization header',
        ERROR_CODES.UNAUTHORIZED
      );
    }

    const token = header.slice(7); // strip "Bearer "
    const payload = verifyAccessToken(token);

    // req.user is the single source of truth for the current user
    req.user = {
      id: payload.sub,
      role: payload.role,
    };

    next();
  } catch (err) {
    next(err);
  }
};