// Wraps an async route handler so any rejected promise is forwarded
// to Express's error middleware via next().
//
// Usage:
//   router.get('/', asyncHandler(async (req, res) => { ... }))
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};