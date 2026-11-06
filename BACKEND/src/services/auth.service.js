import bcrypt from 'bcryptjs';

import { User } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';
import { ERROR_CODES } from '../constants/errorCodes.js';
import { ROLES } from '../constants/roles.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt.js';

const SALT_ROUNDS = 10;

// Strip secrets before a user object is sent to the client
const toPublicUser = (user) => {
  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj.passwordHash;
  delete obj.refreshToken;
  return obj;
};

// ---------------------------------------------------------------
// Registration
// ---------------------------------------------------------------

export const register = async ({ name, email, password }) => {
  const existing = await User.findOne({ email });
  if (existing) {
    throw ApiError.conflict(
      'A user with this email already exists',
      ERROR_CODES.EMAIL_ALREADY_EXISTS
    );
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await User.create({
    name,
    email,
    passwordHash,
    role: ROLES.CUSTOMER,
  });

  return toPublicUser(user);
};

// ---------------------------------------------------------------
// Login
// ---------------------------------------------------------------

export const login = async ({ email, password }) => {
  // passwordHash and refreshToken are select:false — request them explicitly
  const user = await User.findOne({ email }).select('+passwordHash +refreshToken');

  if (!user) {
    throw ApiError.unauthorized(
      'Invalid email or password',
      ERROR_CODES.INVALID_CREDENTIALS
    );
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    throw ApiError.unauthorized(
      'Invalid email or password',
      ERROR_CODES.INVALID_CREDENTIALS
    );
  }

  const payload = { sub: user._id.toString(), role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  // Persist the refresh token so logout can revoke it
  user.refreshToken = refreshToken;
  await user.save();

  return { user: toPublicUser(user), accessToken, refreshToken };
};

// ---------------------------------------------------------------
// Refresh
// ---------------------------------------------------------------

export const refresh = async (token) => {
  if (!token) {
    throw ApiError.unauthorized(
      'Refresh token is required',
      ERROR_CODES.TOKEN_INVALID
    );
  }

  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw ApiError.unauthorized(
        'Refresh token has expired',
        ERROR_CODES.TOKEN_EXPIRED
      );
    }
    throw ApiError.unauthorized(
      'Invalid refresh token',
      ERROR_CODES.TOKEN_INVALID
    );
  }

  // Token must match the one stored at login — otherwise it was revoked
  const user = await User.findById(payload.sub).select('+refreshToken');
  if (!user || user.refreshToken !== token) {
    throw ApiError.unauthorized(
      'Refresh token is no longer valid',
      ERROR_CODES.TOKEN_INVALID
    );
  }

  const accessToken = signAccessToken({
    sub: user._id.toString(),
    role: user.role,
  });

  return { accessToken };
};

// ---------------------------------------------------------------
// Logout — revoke the stored refresh token
// ---------------------------------------------------------------

export const logout = async (userId) => {
  const user = await User.findById(userId).select('+refreshToken');
  if (!user) {
    throw ApiError.notFound('User not found', ERROR_CODES.USER_NOT_FOUND);
  }

  user.refreshToken = null;
  await user.save();
};

// ---------------------------------------------------------------
// Current user
// ---------------------------------------------------------------

export const getMe = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.notFound('User not found', ERROR_CODES.USER_NOT_FOUND);
  }
  return user;
};