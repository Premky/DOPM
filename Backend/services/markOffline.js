import cron from 'node-cron';
// import con from '../db/connection.js'; // update if your DB connection file path is different
import con from '../utils/db.js';
import { promisify } from 'util';
const queryAsync = promisify( con.query ).bind( con );
const beginTransactionAsync = promisify( con.beginTransaction ).bind( con );
const commitAsync = promisify( con.commit ).bind( con );
const rollbackAsync = promisify( con.rollback ).bind( con );
const query = promisify( con.query ).bind( con );

// Runs every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  try {
    const sql = `
      UPDATE users
      SET is_online = 0
      WHERE last_seen < NOW() - INTERVAL 3 MINUTE
    `;
    await con.query(sql);
    console.log("🔴 Marked inactive users as offline");
  } catch (err) {
    console.error("❌ Error in offline marking:", err);
  }
});
