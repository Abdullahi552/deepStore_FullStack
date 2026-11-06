import { asyncHandler } from '../utils/asyncHandler.js';
import { success } from '../utils/apiResponse.js';
import * as userService from '../services/user.service.js';

export const getMe = asyncHandler(async (req, res) => {
  const user = await userService.getProfile(req.user.id);

  return success(res, user, 'Profile retrieved');
});

export const updateMe = asyncHandler(async (req, res) => {
  const user = await userService.updateProfile(req.user.id, req.body);

  return success(res, user, 'Profile updated');
});

export const changePassword = asyncHandler(async (req, res) => {
  await userService.changePassword(req.user.id, req.body);

  return success(res, null, 'Password updated');
});