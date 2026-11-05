export const ORDER_STATUS = Object.freeze({
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
});

export const ORDER_STATUS_VALUES = Object.freeze(Object.values(ORDER_STATUS));

// Section 9 of the proposal:
// pending → confirmed → processing → shipped → delivered
// Cancellation allowed only from pending or confirmed.
export const ALLOWED_TRANSITIONS = Object.freeze({
  [ORDER_STATUS.PENDING]: [ORDER_STATUS.CONFIRMED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.CONFIRMED]: [ORDER_STATUS.PROCESSING, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.PROCESSING]: [ORDER_STATUS.SHIPPED],
  [ORDER_STATUS.SHIPPED]: [ORDER_STATUS.DELIVERED],
  [ORDER_STATUS.DELIVERED]: [],
  [ORDER_STATUS.CANCELLED]: [],
});

export const canTransition = (from, to) =>
  ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;

export const isCancellable = (status) =>
  ALLOWED_TRANSITIONS[status]?.includes(ORDER_STATUS.CANCELLED) ?? false;