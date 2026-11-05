import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';

import { env } from './config/env.js';
import { swaggerSpec } from './config/swagger.js';
import routes from './routes/index.js';

import { notFound } from './middleware/notFound.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';
import { generalLimiter } from './middleware/rateLimit.middleware.js';

// Import models once so Mongoose registers them globally
import './models/index.js';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// --- Trust proxy (for correct IP behind reverse proxies on Render/Heroku/etc.) ---
app.set('trust proxy', 1);

// --- Security headers ---
app.use(helmet());

// --- CORS: only allow the configured frontend origin ---
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  })
);

// --- Body parsers ---
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// --- Cookie parser (refresh token may live in an httpOnly cookie) ---
app.use(cookieParser());

// --- Request logging (skip in tests to keep output clean) ---
if (env.NODE_ENV !== 'test') {
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}
app.use('/public', express.static(path.join(__dirname, '../public')));
// --- Rate limiting on all API routes ---
app.use('/api', generalLimiter);

// --- API documentation ---
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// --- Versioned API ---
app.use('/api/v1', routes);

// --- 404 handler (must come after all routes, before error handler) ---
app.use(notFound);

// --- Central error handler (must be LAST, 4-arg signature) ---
app.use(errorHandler);

export default app;