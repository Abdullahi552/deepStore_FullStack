import { Cart, Product } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

// ---------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------

// Fetch the user's cart with product details populated.
// Creates an empty cart if none exists (one per user, per model constraint).
const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId }).populate(
    'items.product',
    'name slug price images stock isActive'
  );

  if (!cart) {
    await Cart.create({ user: userId, items: [] });
    cart = await Cart.findOne({ user: userId }).populate(
      'items.product',
      'name slug price images stock isActive'
    );
  }

  return cart;
};

// Verify a product exists, is active, and has enough stock.
// Throws appropriate ApiError.
const assertProductAvailable = async (productId, requestedQty) => {
  const product = await Product.findOne({ _id: productId, isActive: true });

  if (!product) {
    throw ApiError.notFound(
      'Product not found or inactive',
      ERROR_CODES.PRODUCT_NOT_FOUND
    );
  }

  if (product.stock < requestedQty) {
    throw ApiError.conflict(
      `Insufficient stock. Available: ${product.stock}, requested: ${requestedQty}`,
      ERROR_CODES.INSUFFICIENT_STOCK
    );
  }

  return product;
};

// ---------------------------------------------------------------
// Reads
// ---------------------------------------------------------------

export const getCart = async (userId) => {
  const cart = await getOrCreateCart(userId);
  return sanitizeCart(cart);
};

// ---------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------

export const addItem = async (userId, { productId, quantity = 1 }) => {
  const cart = await getOrCreateCart(userId);

  const existing = cart.items.find(
    (item) => item.product._id.toString() === productId
  );
  const newQuantity = existing ? existing.quantity + quantity : quantity;

  // Verify stock for the total quantity that would result
  await assertProductAvailable(productId, newQuantity);

  if (existing) {
    existing.quantity = newQuantity;
  } else {
    cart.items.push({ product: productId, quantity });
  }

  await cart.save();
  await cart.populate('items.product', 'name slug price images stock isActive');

  return sanitizeCart(cart);
};

export const updateItemQuantity = async (userId, productId, quantity) => {
  const cart = await getOrCreateCart(userId);

  const item = cart.items.find(
    (i) => i.product._id.toString() === productId
  );

  if (!item) {
    throw ApiError.notFound('Item not in cart', ERROR_CODES.CART_ITEM_NOT_FOUND);
  }

  await assertProductAvailable(productId, quantity);

  item.quantity = quantity;
  await cart.save();
  await cart.populate('items.product', 'name slug price images stock isActive');

  return sanitizeCart(cart);
};

export const removeItem = async (userId, productId) => {
  const cart = await getOrCreateCart(userId);

  const before = cart.items.length;
  cart.items = cart.items.filter(
    (i) => i.product._id.toString() !== productId
  );

  if (cart.items.length === before) {
    throw ApiError.notFound('Item not in cart', ERROR_CODES.CART_ITEM_NOT_FOUND);
  }

  await cart.save();
  await cart.populate('items.product', 'name slug price images stock isActive');

  return sanitizeCart(cart);
};

export const clearCart = async (userId) => {
  const cart = await getOrCreateCart(userId);
  cart.items = [];
  await cart.save();

  return sanitizeCart(cart);
};

// ---------------------------------------------------------------
// Response shaping
// ---------------------------------------------------------------

// Adds computed fields (lineTotal, subtotal) so the frontend
// doesn't have to do arithmetic. Prices come from the live product,
// never from any client-supplied value.
const sanitizeCart = (cart) => {
  const items = cart.items
    .filter((item) => item.product) // drop items whose product was deleted
    .map((item) => ({
      product: {
        _id: item.product._id,
        name: item.product.name,
        slug: item.product.slug,
        price: item.product.price,
        images: item.product.images,
        stock: item.product.stock,
      },
      quantity: item.quantity,
      lineTotal: item.product.price * item.quantity,
    }));

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);

  return {
    _id: cart._id,
    user: cart.user,
    items,
    subtotal,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    updatedAt: cart.updatedAt,
  };
};