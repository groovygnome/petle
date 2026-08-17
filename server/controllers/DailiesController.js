import db from '../db/dailies.js';

async function getDaily(req, res) {
  const ans = await db.getDaily(req.params.date);
  res.json(ans);
}

async function deleteDailies(req, res) {
  await db.deleteDailies();
}

async function newDaily(req, res) {
  const ans = await db.newDaily(req.params.date, req.params.answer);
  res.json(ans);
}

export default { getDaily, deleteDailies, newDaily }
