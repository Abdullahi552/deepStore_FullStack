import { HTTP_STATUS } from '../constants/httpStatus.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

// Success: { success: true, message, data }
export const success = (
  res,
  data = null,
  message = 'Success',
  statusCode = HTTP_STATUS.OK
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

// Created: 201 with the same shape as success
export const created = (res, data = null, message = 'Resource created') => {
  return success(res, data, message, HTTP_STATUS.CREATED);
};

// No content: 204 with no body
export const noContent = (res) => {
  return res.status(HTTP_STATUS.NO_CONTENT).send();
};

// Paginated: { success: true, data, pagination }
export const paginated = (res, data, { page, limit, total }, message = 'Success') => {
  const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;
  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message,
    data,
    pagination: { page, limit, total, totalPages },
  });
};

// Error: { success: false, message, error: { code, details? } }
export const failure = (
  res,
  message,
  code = ERROR_CODES.INTERNAL_ERROR,
  statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR,
  details = null
) => {
  const error = { code };
  if (details) error.details = details;

  return res.status(statusCode).json({
    success: false,
    message,
    error,
  });
};