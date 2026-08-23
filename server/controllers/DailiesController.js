import db from '../db/dailies.js';

async function getDaily(req, res) {
  const ans = await db.getDaily(req.params.db, req.params.date);
  res.json(ans);
}

async function deleteDailies(req, res) {
  await db.deleteDailies(req.params.db);
}

async function newDaily(req, res) {
  const ans = await db.newDaily(req.params.db, req.params.date, req.params.answer);
  res.json(ans);
}

export default { getDaily, deleteDailies, newDaily }
