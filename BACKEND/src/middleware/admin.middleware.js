import { ApiError } from '../utils/ApiError.js';
import { ROLES } from '../constants/roles.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return next(
      ApiError.unauthorized(
        'Authentication required',
        ERROR_CODES.UNAUTHORIZED
      )
    );
  }

  if (req.user.role !== ROLES.ADMIN) {
    return next(
      ApiError.forbidden(
        'Admin access required',
        ERROR_CODES.FORBIDDEN
      )
    );
  }

  next();
};