import express from "express";
import pool from "../utils/db3.js";
import { logAudit } from "../services/auditService.js";
import verifyToken from '../middlewares/verifyToken.js';
import { param } from "express-validator";

const router = express.Router();

router.post( "/restore/:auditId", verifyToken, async ( req, res ) => {
    try {
        const auditId = req.params.auditId;
        const userId = req.user.username;

        //Fetch audit entry
        const [rows] = await pool.query(
            `SELECT * FROM audit_logs WHERE id=?`, [auditId]
        );

        if ( !rows.length ) {
            return res.status( 404 ).json( { message: "Audit record not found" } );
        }

        const log = rows[0];
        const table = log.table_name;
        const recordId = log.record_id;

        if ( !log.old_data ) {
            return res.status( 400 ).json( {
                message: "No old data available for restore"
            } );
        }

        const oldData = JSON.parse( log.old_data );

        //Restore SQL 
        const columns = Object.keys( oldData )
            .map( col => `${ col }=?` )
            .join( "," );

        const values = Object.values( oldData );

        await pool.query( `UPDATE ${ table } SET ${ columns } WHERE id=?`, [...values, recordId] );

        //audit log restore
        await logAudit( {
            tableName: table,
            recordId,
            action: "restore",
            oldData: null,
            newData: oldData,
            userId
        } );

        res.json( { status: true, message: "Record Restored Successfully" } );
    } catch ( err ) {
        console.error( "Restore error:", err );
        res.status( 500 ).json( { message: "Restore Failed", error: err } );
    }
} );

router.get( "/logs", verifyToken, async ( req, res ) => {
    const { table, recordId, action } = req.query;

    let sql = `SELECT * FROM audit_logs WHERE 1=1`;
    const params = [];

    if ( table ) {
        sql += ` AND table_name=?`;
        params.push( table );
    }

    if ( recordId ) {
        sql += ` AND record_id=?`;
        params.push( recordId );
    }

    if ( action ) {
        sql += ` AND action=?`;
        params.push( action );
    }

    sql += " ORDER BY changed_at DESC LIMIT 200";
    const [rows] = await pool.query( sql, params );
    res.json( rows );
} );

router.get("/log/:id", verifyToken, async (req, res) => {
  const auditId = req.params.id;
  const isAdmin = req.user.role === "admin";

  try {
    // 1 Fetch main audit record
    const [rows] = await pool.query(
      `SELECT * FROM audit_logs WHERE id=?`,
      [auditId]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Audit log not found" });
    }

    const audit = rows[0];

    // 2 Fetch column labels
    const [labels] = await pool.query(
      `SELECT column_name, display_name, visible_to_users 
       FROM column_labels 
       WHERE table_name=?`,
      [audit.table_name]
    );

    // Prepare label map
    const labelMap = {};
    labels.forEach((l) => {
      labelMap[l.column_name] = {
        display: l.display_name,
        visible: l.visible_to_users,
      };
    });

    // 3 DO NOT PARSE — already JS objects
    const oldData = audit.old_data || {};
    const newData = audit.new_data || {};

    // 4 Merge keys
    const fields = {};
    const allKeys = new Set([
      ...Object.keys(oldData),
      ...Object.keys(newData),
    ]);

    allKeys.forEach((key) => {
      const label = labelMap[key];

      // hide invisible fields for normal users
      if (!isAdmin && label && label.visible === 0) return;
      
      fields[key] = {
        label: label ? label.display : key,
        old: oldData[key] ?? "-",
        new: newData[key] ?? "-",
      };
    });

    // Final response
    res.json({
      ...audit,
      fields,
    });
  } catch (err) {
    console.error("Audit log fetch error:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

export { router as auditRouter };