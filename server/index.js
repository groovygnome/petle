import express from 'express'
import db from './db/dailies.js'

const app = express();

app.use(express.urlencoded({ extended: true }));

app.get('/api/dailies/:date', async (req, res) => {
  const result = await db.getDaily(req.params.date);
  res.json(result);
});

app.get('/api/track/:trackId', async (req, res) => {
  const result = await fetch(`https://api.deezer.com/track/${req.params.trackId}`);
  const data = await result.json();
  res.json(data);
});

app.delete('/api/dailies/delete', async (req, res) => {
  await db.deleteDailies();
  res.json({ ok: true });
});

app.post('/api/dailies/:date/:answer', async (req, res) => {
  const check = await db.getDaily(req.params.date);
  if (check.length === 0) {
    await db.newDaily(req.params.date, req.params.answer);
    const result = await db.getDaily(req.params.date);
    res.json(result);
  } else return res.json(check);
});

const PORT = 3001;
app.listen(PORT, (error) => {

  if (error) {
    throw error;
  }
  console.log(`petle db, listening on port ${PORT}`);
});
