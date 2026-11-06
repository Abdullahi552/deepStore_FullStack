import bcrypt from 'bcryptjs';

import { User } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

const SALT_ROUNDS = 10;

// ---------------------------------------------------------------
// Reads
// ---------------------------------------------------------------

export const getProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.notFound('User not found', ERROR_CODES.USER_NOT_FOUND);
  }
  return user;
};

// ---------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------

export const updateProfile = async (userId, { name, email }) => {
  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.notFound('User not found', ERROR_CODES.USER_NOT_FOUND);
  }

  if (email !== undefined && email !== user.email) {
    const taken = await User.findOne({ email });
    if (taken) {
      throw ApiError.conflict(
        'A user with this email already exists',
        ERROR_CODES.EMAIL_ALREADY_EXISTS
      );
    }
    user.email = email;
  }

  if (name !== undefined) {
    user.name = name;
  }

  await user.save();
  return user;
};

export const changePassword = async (userId, { currentPassword, newPassword }) => {
  // passwordHash is select:false — request it explicitly for comparison
  const user = await User.findById(userId).select('+passwordHash');
  if (!user) {
    throw ApiError.notFound('User not found', ERROR_CODES.USER_NOT_FOUND);
  }

  const passwordMatches = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!passwordMatches) {
    throw ApiError.unauthorized(
      'Current password is incorrect',
      ERROR_CODES.INVALID_CREDENTIALS
    );
  }

  user.passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await user.save();

  return user;
};