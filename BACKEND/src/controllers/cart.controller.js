import { asyncHandler } from '../utils/asyncHandler.js';
import { success, noContent } from '../utils/apiResponse.js';
import * as cartService from '../services/cart.service.js';

// ---------------------------------------------------------------
// All cart endpoints require an authenticated user.
// req.user.id is set by the authenticate middleware.
// ---------------------------------------------------------------

export const getCart = asyncHandler(async (req, res) => {
  const cart = await cartService.getCart(req.user.id);

  return success(res, cart, 'Cart retrieved');
});

export const addItem = asyncHandler(async (req, res) => {
  const cart = await cartService.addItem(req.user.id, req.body);

  return success(res, cart, 'Item added to cart');
});

export const updateItem = asyncHandler(async (req, res) => {
  const cart = await cartService.updateItemQuantity(
    req.user.id,
    req.params.productId,
    req.body.quantity
  );

  return success(res, cart, 'Cart item updated');
});

export const removeItem = asyncHandler(async (req, res) => {
  const cart = await cartService.removeItem(req.user.id, req.params.productId);

  return success(res, cart, 'Item removed from cart');
});

export const clearCart = asyncHandler(async (req, res) => {
  const cart = await cartService.clearCart(req.user.id);

  return success(res, cart, 'Cart cleared');
});