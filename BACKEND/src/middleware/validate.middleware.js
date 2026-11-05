import { ApiError } from '../utils/ApiError.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

// Usage:
//   router.post('/', validate({ body: createProductSchema }), controller)
//   router.get('/:id', validate({ params: idParamSchema }), controller)
//   router.get('/', validate({ query: paginationSchema }), controller)
export const validate = (schemas) => (req, res, next) => {
  const errors = [];

  for (const [source, schema] of Object.entries(schemas)) {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      for (const issue of result.error.issues) {
        errors.push({
          source,
          field: issue.path.join('.') || '(root)',
          message: issue.message,
        });
      }
    } else {
      // Express 5: req.query is a getter-only property. Assigning to it throws.
      // Define a shadowing own-property so downstream code sees the parsed value.
      if (source === 'query') {
        Object.defineProperty(req, 'query', {
          value: result.data,
          writable: true,
          configurable: true,
          enumerable: true,
        });
      } else {
        req[source] = result.data;
      }
    }
  }

  if (errors.length > 0) {
    return next(ApiError.validation('Validation failed', errors));
  }

  next();
};