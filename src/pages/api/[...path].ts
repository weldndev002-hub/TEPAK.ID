import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { APIRoute } from 'astro';

const app = new Hono().basePath('/api');

// Middleware untuk validasi context atau auth jika diperlukan
app.use('*', async (c, next) => {
  console.log(`[Hono] Request: ${c.req.method} ${c.req.url}`);
  await next();
});

// Hello route
app.get('/hello', (c) => {
  return c.json({
    message: 'Hello from Hono on Astro Edge!',
    timestamp: new Date().toISOString()
  });
});

// Example validation route
app.post(
  '/echo',
  zValidator(
    'json',
    z.object({
      message: z.string().min(1)
    })
  ),
  (c) => {
    const { message } = c.req.valid('json');
    return c.json({ echo: message });
  }
);

// Health check with Prisma/Supabase test
app.get('/health', async (c) => {
  try {
    return c.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    return c.json({ status: 'error', message: (error as Error).message }, 500);
  }
});

// Export handler for Astro
export const ALL: APIRoute = ({ request }) => app.fetch(request);
