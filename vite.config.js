import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const apiRoutes = {
  '/api/add-product': './api/add-product.js',
  '/api/admin-login': './api/admin-login.js',
  '/api/admin-session': './api/admin-session.js',
  '/api/admin-logout': './api/admin-logout.js',
  '/api/delete-product': './api/delete-product.js',
  '/api/store-data': './api/store-data.js',
  '/api/store-image': './api/store-image.js',
  '/api/update-product': './api/update-product.js',
};

const parseBody = async (req) => {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) return undefined;

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const rawBody = Buffer.concat(chunks).toString('utf8');

  if (!rawBody) return undefined;

  try {
    return JSON.parse(rawBody);
  } catch {
    return rawBody;
  }
};

const localApiPlugin = () => ({
  name: 'local-api-functions',
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      const pathname = req.url?.split('?')[0];
      const route = apiRoutes[pathname];

      if (!route) {
        next();
        return;
      }

      req.body = await parseBody(req);
      res.status = (statusCode) => {
        res.statusCode = statusCode;
        return res;
      };
      res.json = (data) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(data));
      };

      try {
        const apiModule = await import(route);
        await apiModule.default(req, res);
      } catch (error) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: error.message || 'Local API error.' }));
      }
    });
  },
});

export default defineConfig(({ mode }) => {
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''));

  return {
    plugins: [react(), localApiPlugin()],
  };
});
