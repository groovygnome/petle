import { pool } from './pool.js'

async function getDaily(date) {
    const { rows } = await pool.query('SELECT * FROM dailies WHERE dt = ($1)', [date]);
    return rows;
}

async function deleteDailies() {
    await pool.query('DELETE FROM dailies');
}

async function newDaily(date, answer) {
    await pool.query('INSERT INTO dailies (dt, answer) VALUES ($1, $2)', [date, answer]);
}

export default { getDaily, deleteDailies, newDaily }
