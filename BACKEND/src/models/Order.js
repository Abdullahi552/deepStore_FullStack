import mongoose from 'mongoose';
import { ORDER_STATUS, ORDER_STATUS_VALUES } from '../constants/orderStatus.js';

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true, // reference for analytics / re-order, but NOT the source of truth
    },
    // Snapshot — copied at checkout, immutable thereafter
    name: { type: String, required: true },
    image: { type: String, default: '' },
    price: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: 'Order item price must be an integer',
      },
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: Number.isInteger,
        message: 'Order item quantity must be an integer',
      },
    },
  },
  { _id: false }
);

const shippingAddressSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    street: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true, default: 'Nigeria' },
    postalCode: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: 'Order must contain at least one item',
      },
    },
    shippingAddress: {
      type: shippingAddressSchema,
      required: true,
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
      validate: { validator: Number.isInteger, message: 'subtotal must be an integer' },
    },
    shippingFee: {
      type: Number,
      required: true,
      min: 0,
      validate: { validator: Number.isInteger, message: 'shippingFee must be an integer' },
    },
    total: {
      type: Number,
      required: true,
      min: 0,
      validate: { validator: Number.isInteger, message: 'total must be an integer' },
    },
    status: {
      type: String,
      enum: ORDER_STATUS_VALUES,
      default: ORDER_STATUS.PENDING,
      index: true,
    },
  },
  { timestamps: true }
);

// Generate order number before first save if not set
orderSchema.pre('validate', function (next) {
  if (!this.orderNumber) {
    const ts = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    this.orderNumber = `DS-${ts}-${rand}`;
  }
  next();
});

export default mongoose.model('Order', orderSchema);