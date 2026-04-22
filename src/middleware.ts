import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async ({ locals, next }) => {
  // PURE PASSTHROUGH TEST
  return next();
});
