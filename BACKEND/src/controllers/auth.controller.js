import { asyncHandler } from '../utils/asyncHandler.js';
import { success, created, noContent } from '../utils/apiResponse.js';
import * as authService from '../services/auth.service.js';

export const register = asyncHandler(async (req, res) => {
  const user = await authService.register(req.body);

  return created(res, user, 'User registered');
});

export const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);

  return success(res, result, 'Login successful');
});

export const refresh = asyncHandler(async (req, res) => {
  const token = req.body?.refreshToken || req.cookies?.refreshToken;
  const result = await authService.refresh(token);

  return success(res, result, 'Token refreshed');
});

export const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user.id);

  return noContent(res);
});

export const me = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user.id);

  return success(res, user, 'Profile retrieved');
});