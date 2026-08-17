import express from 'express';
const app = express();
import dailyRoute from './routes/dailies.js';

app.use(express.urlencoded({ extended: true }));

app.use('/deezer/:trackId', async (req, res) => {
  const result = await fetch(`https://api.deezer.com/track/${req.params.trackId}`);
  const data = await result.json();
  res.json(data);
});

app.use('/api', dailyRoute);

const PORT = 3001;
app.listen(PORT, (error) => {
  if (error) {
    throw error;
  }
  console.log(`petle db, listening on port ${PORT}`);
});
