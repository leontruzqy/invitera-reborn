import { cors } from '@elysiajs/cors';
import { Elysia } from 'elysia';
import { HttpError } from './errors';
import { adminRoutes } from './routes/admin';
import { publicRoutes } from './routes/public';

const PORT = Number(process.env.PORT ?? 3000);

const corsOrigins = (process.env.CORS_ORIGINS ?? '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

export const app = new Elysia()
  .use(
    cors({
      origin:
        corsOrigins.length > 0
          ? (request: Request) => {
              const origin = request.headers.get('origin');
              return origin !== null && corsOrigins.includes(origin);
            }
          : true,
      methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }),
  )
  .onError(({ code, error, set }) => {
    if (error instanceof HttpError) {
      set.status = error.status;
      return { error: error.message };
    }
    if (code === 'VALIDATION') {
      set.status = 422;
      let details: unknown = error.message;
      try {
        details = JSON.parse(error.message);
      } catch {
        // keep raw message
      }
      return { error: 'Validation failed', details };
    }
    if (code === 'NOT_FOUND') {
      set.status = 404;
      return { error: 'Route not found' };
    }
    console.error(error);
    set.status = 500;
    return { error: 'Internal server error' };
  })
  .get('/', () => ({ name: 'Invitera API', status: 'ok' }))
  .get('/health', () => ({ status: 'ok', uptime: process.uptime() }))
  .use(publicRoutes)
  .use(adminRoutes)
  .listen(PORT);

console.log(`🦊 Invitera API running at http://${app.server?.hostname}:${app.server?.port}`);
