import express from 'express';

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', project: 'glicemia' });
});

app.listen(PORT, () => {
  console.log(`[glicemia] server running on port ${PORT}`);
});
