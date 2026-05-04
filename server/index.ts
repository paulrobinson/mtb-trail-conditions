import express from 'express';
import path from 'path';
import weatherRouter from './routes.js';

const PORT   = Number(process.env.PORT ?? 3001);
const isProd = process.env.NODE_ENV === 'production';

const app = express();
app.use(express.json());

app.use('/api', weatherRouter);

if (isProd) {
  const clientDist = path.resolve(process.cwd(), 'dist/client');
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT} (${isProd ? 'production' : 'development'})`);
});
