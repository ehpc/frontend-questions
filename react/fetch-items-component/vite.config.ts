import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    {
      name: 'mock-api',
      configureServer(server) {
        server.middlewares.use('/api/items', (req, res, next) => {
          if (req.method !== 'GET') return next();
          res.setHeader('Content-Type', 'application/json');

          const body = JSON.stringify({
            result: {
              code: 200,
              items: [
                { id: 10001, name: 'Roses' },
                { id: 10002, name: 'Are' },
                { id: 10003, name: 'Red' },
              ],
            },
          });

          // 1s artificial delay, and guard against aborted requests
          const timer = setTimeout(() => {
            if (res.writableEnded || (req as any).aborted) return;
            res.end(body);
          }, 1000);

          req.on('close', () => clearTimeout(timer));
        });
      },
    },
  ],
});