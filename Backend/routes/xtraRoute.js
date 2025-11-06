import express from 'express';
import con from '../utils/db.js';
import pool from '../utils/db3.js';
import { promisify } from 'util';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import NepaliDate from 'nepali-datetime';

import { calculateBSDate } from '../utils/dateCalculator.js';
import verifyToken from '../middlewares/verifyToken.js';


const router = express.Router();
// const query = promisify(con.query).bind(con);
const __filename = fileURLToPath( import.meta.url );
const __dirname = path.dirname( __filename );

const fy = new NepaliDate().format( 'YYYY' ); //Support for filter
const fy_date = fy + '-04-01';

const query = promisify( con.query ).bind( con );

import translate from "google-translate-api-x";

async function translateNames(batchSize = 5) {
  try {
    while (true) {
      const [rows] = await pool.query(
        "SELECT id, bandi_name FROM bandi_person WHERE (bandi_name_en IS NULL OR bandi_name_en = '') LIMIT ?",
        [batchSize]
      );

      if (rows.length === 0) {
        console.log("✅ All names translated!");
        break;
      }

      for (const row of rows) {
        try {
          const res = await translate(row.bandi_name, { from: "ne", to: "en" });
          const translated = res.text;

          await pool.query(
            "UPDATE bandi_person SET bandi_name_en = ? WHERE id = ?",
            [translated, row.id]
          );

          console.log(`✅ ${row.bandi_name} → ${translated}`);
          await new Promise((r) => setTimeout(r, 500)); // small delay
        } catch (err) {
          console.error(`❌ Error translating ID ${row.id}:`, err.message);
        }
      }
    }
  } catch (err) {
    console.error("Main error:", err);
  } finally {
    pool.end();
  }
}

// translateNames();

async function translateEscapedNames(limit = 100) {
  try {
    const [rows] = await pool.query(`
      SELECT bp.id, bp.bandi_name
      FROM bandi_person bp
      INNER JOIN bandi_escape_details be ON bp.office_bandi_id = be.office_bandi_id
      WHERE (bp.bandi_name_en IS NULL OR bp.bandi_name_en = '')
      LIMIT ?
    `, [limit]);

    if (rows.length === 0) {
      console.log("✅ No names left to translate.");
      return;
    }

    console.log(`Translating ${rows.length} escaped prisoner names...\n`);

    for (const row of rows) {
      try {
        const { text: translated } = await translate(row.bandi_name, { from: "ne", to: "en" });

        await pool.query(
          "UPDATE bandi_person SET bandi_name_en = ? WHERE id = ?",
          [translated, row.id]
        );

        console.log(`✅ ${row.bandi_name} → ${translated}`);
        await new Promise((r) => setTimeout(r, 400)); // small delay
      } catch (err) {
        console.error(`❌ Error translating ID ${row.id}:`, err.message);
      }
    }

    console.log("\n✅ Translation completed for this batch!");
  } catch (err) {
    console.error("Main error:", err);
  } finally {
    pool.end();
  }
}
router.get("/", (req, res) => {
  res.send("xtraRoute is working ✅");
  translateEscapedNames();
});

export { router as xtraRouter };