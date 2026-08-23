import { pool } from './pool.js'

async function getDaily(db, date) {
    const table = db;
    const { rows } = await pool.query(`SELECT * FROM ${db} WHERE dt = $1`, [date]);
    return rows[0]?.answer ?? null;
}

async function deleteDailies(db) {
    await pool.query(`DELETE FROM ${db}`);
}

async function newDaily(db, date, answer) {
    await pool.query(`INSERT INTO ${db} (dt, answer) VALUES ($1, $2)`, [date, answer]);
    return answer;
}

export default { getDaily, deleteDailies, newDaily }
