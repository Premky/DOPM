import express from "express";
import pool from "../utils/db3.js";
import { logAudit } from "../services/auditService.js";
import verifyToken from '../middlewares/verifyToken.js';
import { param } from "express-validator";

const router = express.Router();

router.post( "/restore1/:auditId", verifyToken, async ( req, res ) => {
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

        // const oldData = JSON.parse( log.old_data );
        const oldData = log.old_data;

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

router.post( "/restore2/:auditId", verifyToken, async ( req, res ) => {
    try {
        const auditId = req.params.auditId;
        const userId = req.user.username;

        // Fetch audit entry
        const [rows] = await pool.query(
            `SELECT * FROM audit_logs WHERE id=?`,
            [auditId]
        );

        if ( !rows.length ) {
            return res.status( 404 ).json( { message: "Audit record not found" } );
        }

        const log = rows[0];
        const table = log.table_name;
        const recordId = log.record_id;

        if ( !log.old_data ) {
            return res.status( 400 ).json( {
                message: "No old data available for restore",
            } );
        }

        // old_data is already JSON (no need to JSON.parse)
        const oldData = log.old_data;

        // 🔥 FIELDS WE SHOULD NEVER RESTORE
        const IGNORE_FIELDS = [
            "id",
            "created_at",
            "updated_at",
            "created_by",
            "updated_by",
            "deleted_at",
            "deleted_by"
        ];

        // Fields that must be DATE (YYYY-MM-DD)
        const dateOnlyFields = [
            "dob",
            "dob_ad",
            "enrollment_date_ad",
            "enrollment_date_bs",
            "release_date_ad",
            "release_date_bs"
        ];

        // Filter oldData to remove restricted fields
        const restoredData = {};
        for ( const key of Object.keys( oldData ) ) {
            if ( !IGNORE_FIELDS.includes( key ) ) {
                restoredData[key] = oldData[key];
            }
        }

        if ( Object.keys( restoredData ).length === 0 ) {
            return res.status( 400 ).json( {
                message: "No valid fields to restore",
            } );
        }

        // Build SQL SET clause
        const columns = Object.keys( restoredData )
            .map( col => `${ col }=?` )
            .join( "," );

        const values = Object.values( restoredData );

        // Perform update
        await pool.query(
            `UPDATE ${ table } SET ${ columns } WHERE id=?`,
            [...values, recordId]
        );

        // Log "restore" action
        await logAudit( {
            tableName: table,
            recordId,
            action: "restore",
            oldData: null,   // After restore, oldData = null
            newData: restoredData,
            userId
        } );

        res.json( { status: true, message: "Record Restored Successfully" } );

    } catch ( err ) {
        console.error( "Restore error:", err );
        res.status( 500 ).json( { message: "Restore Failed", error: err } );
    }
} );

router.post( "/restore/:auditId", verifyToken, async ( req, res ) => {
    try {
        const auditId = req.params.auditId;
        const userId = req.user.username;

        // Fetch audit entry
        const [rows] = await pool.query( `
            SELECT 
                a.*,
                COALESCE(tl.display_name, a.table_name) AS display_table_name
            FROM audit_logs a
            LEFT JOIN table_labels tl
                ON a.table_name = tl.table_name
            WHERE a.id=?
        `, [auditId] );

        // const [rows] = await pool.query(
        //     `SELECT * FROM audit_logs WHERE id=?`, [auditId]
        // );

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

        const oldData = log.old_data;  // Already parsed JSON

        // Fields to skip restoring
        const skipFields = [
            "created_at",
            "updated_at",
            "entry_datetime",
            "release_datetime"
        ];

        // Fields that must be DATE (YYYY-MM-DD)
        const dateOnlyFields = [
            "dob",
            "dob_ad",
            "enrollment_date_ad",
            "enrollment_date_bs",
            "release_date_ad",
            "release_date_bs"
        ];

        // Clean & format values
        const filteredOldData = {};

        for ( let key in oldData ) {
            if ( skipFields.includes( key ) ) continue;

            let value = oldData[key];

            // Convert ISO timestamps to DATE only
            if ( dateOnlyFields.includes( key ) && value ) {
                value = value.toString().split( "T" )[0];
            }

            filteredOldData[key] = value;
        }

        // Build SQL
        const columns = Object.keys( filteredOldData )
            .map( col => `${ col }=?` )
            .join( "," );

        const values = Object.values( filteredOldData );

        await pool.query(
            `UPDATE ${ table } SET ${ columns } WHERE id=?`,
            [...values, recordId]
        );

        // Log restore
        await logAudit( {
            tableName: table,
            recordId,
            action: "restore",
            oldData: null,
            newData: filteredOldData,
            userId
        } );

        res.json( { status: true, message: "Record Restored Successfully" } );

    } catch ( err ) {
        console.error( "Restore error:", err );
        res.status( 500 ).json( { message: "Restore Failed", error: err } );
    }
} );


router.get( "/logs", verifyToken, async ( req, res ) => {
    const active_user = req.user.username;
    const active_user_role = req.user.role_name;
    const active_office = req.user.office_id;

    // console.log(active_user)
    // console.log(active_user_role)

    const { table, recordId, action } = req.query;

    // let sql = `SELECT * FROM audit_logs WHERE 1=1`;
    let sql =  `
            SELECT 
                a.*,
                COALESCE(tl.display_name, a.table_name) AS display_table_name
            FROM audit_logs a
            LEFT JOIN table_labels tl ON a.table_name = tl.table_name
            LEFT JOIN users u ON a.changed_by = u.user_login_id
            WHERE 1=1
        `;

    const params = [];

    if(active_user_role==='office_admin'){
        sql += `AND u.office_id = ?`;
        params.push(active_office);
    }

    if(active_user_role==='clerk'){
        sql += `AND a.changed_by=?`;
        params.push(active_user);
    }

    if ( table ) {
        sql += ` AND (a.table_name=? OR tl.display_name=?)`;
        params.push( table );
        params.push( table );
    }

    if ( recordId ) {
        sql += ` AND a.record_id=?`;
        params.push( recordId );
    }

    if ( action ) {
        sql += ` AND a.action=?`;
        params.push( action );
    }

    sql += " ORDER BY a.changed_at DESC LIMIT 200";
    const [rows] = await pool.query( sql, params );
    res.json( rows );
} );

router.get( "/log/:id", verifyToken, async ( req, res ) => {
    const auditId = req.params.id;
    const isAdmin = req.user.role === "admin";

    try {
        // 1 Fetch main audit record
        const [rows] = await pool.query( `
            SELECT 
                a.*,
                COALESCE(tl.display_name, a.table_name) AS display_table_name
            FROM audit_logs a
            LEFT JOIN table_labels tl
                ON a.table_name = tl.table_name
            WHERE a.id=?
        `, [auditId] );

        if ( !rows.length ) {
            return res.status( 404 ).json( { message: "Audit log not found" } );
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
        labels.forEach( ( l ) => {
            labelMap[l.column_name] = {
                display: l.display_name,
                visible: l.visible_to_users,
            };
        } );

        // 3 DO NOT PARSE — already JS objects
        const oldData = audit.old_data || {};
        const newData = audit.new_data || {};

        // 4 Merge keys
        const fields = {};
        const allKeys = new Set( [
            ...Object.keys( oldData ),
            ...Object.keys( newData ),
        ] );

        allKeys.forEach( ( key ) => {
            const label = labelMap[key];

            // hide invisible fields for normal users
            if ( !isAdmin && label && label.visible === 0 ) return;

            fields[key] = {
                label: label ? label.display : key,
                old: oldData[key] ?? "-",
                new: newData[key] ?? "-",
            };
        } );

        // Final response
        res.json( {
            ...audit,
            fields,
        } );
    } catch ( err ) {
        console.error( "Audit log fetch error:", err );
        res.status( 500 ).json( { message: "Server Error" } );
    }
} );

export { router as auditRouter };