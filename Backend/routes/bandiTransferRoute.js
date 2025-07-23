import express from 'express';
import con from '../utils/db.js';
import pool from '../utils/db3.js';
import { promisify } from 'util';
import multer from 'multer';
import path from 'path';
import fs, { stat } from 'fs';
import { fileURLToPath } from 'url';
import NepaliDate from 'nepali-datetime';
import dateConverter from 'nepali-datetime/dateConverter';

import { calculateBSDate } from '../utils/dateCalculator.js';
import verifyToken from '../middlewares/verifyToken.js';


const router = express.Router();
// const query = promisify(con.query).bind(con);
const __filename = fileURLToPath( import.meta.url );
const __dirname = path.dirname( __filename );



import NepaliDateConverter from 'nepali-date-converter';
const current_date = new NepaliDate().format( 'YYYY-MM-DD' );
const fy = new NepaliDate().format( 'YYYY' ); //Support for filter
const fy_date = fy + '-04-01';

import { bs2ad } from '../utils/bs2ad.js';
import {
    getAllowedStatusesForRole,
    insertFinalTransferDetails,
    insertTransferDetails
} from '../services/bandiTransferService.js';
// console.log(current_date);
// console.log(fy_date)
// Approve
// metadata: {
//   id: 7,
//   transfer_id: 7,
//   to_user: '',
//   to_role: 'to_send',
//   remarks: '21',
//   final_to_office_id: 24
// }
// metadata: {
//   id: 7,
//   transfer_id: 7,
//   to_user: '',
//   to_role: 'headoffice_approver',
//   remarks: '21'
// }
router.get( '/get_transfer_bandi_ac_status', verifyToken, async ( req, res ) => {
    const active_office = req.user.office_id;
    const user_id = req.user.id;
    const user_role = req.user.role_name;
    // const [status] = await pool.query( `SELECT id FROM bandi_transfer_statuses WHERE role_required=?`, user_role );
    const [role] = await pool.query( `SELECT id FROM bandi_transfer_statuses WHERE role_required=?`, user_role );
    const statusKey = req.query.searchStatus || null;
    const roleKey = req.query.searchRoles || null;
    // console.log( role );
    const bandi_id = req.query.bandi_id || null;

    let connection;
    try {
        connection = await pool.getConnection();

        let queryFilter = ' WHERE bp.is_active = 1';
        const params = [];

        if ( active_office !== 1 && active_office !== 2 ) {
            queryFilter += ' AND bp.current_office_id = ?';
            params.push( active_office );
        }

        if ( bandi_id ) {
            queryFilter += ' AND bp.id = ?';
            params.push( bandi_id );
        }

        if ( roleKey ) {
            const [roleRow] = await connection.query(
                `SELECT id FROM bandi_transfer_statuses WHERE status_key = ?`,
                [roleKey]
            );
            if ( roleRow.length > 0 ) {
                queryFilter += ' AND bth.status_id = ?';
                params.push( roleRow[0].id );
            }
        } else {
            queryFilter += ' AND bth.status_id = ?';
            params.push( role[0].id );
        }

        if ( statusKey ) {
            const [statusRow] = await connection.query(
                `SELECT id FROM bandi_transfer_statuses WHERE role_required = ?`,
                [statusKey]
            );
            if ( statusRow.length > 0 ) {
                queryFilter += ' AND bth.status_id = ?';
                params.push( statusRow[0].id );
            }
        }

        const sql = `
            SELECT 
            bp.id AS bandi_id,
            bp.office_bandi_id, bp.bandi_type, bp.bandi_name, bp.dob,
            o.letter_address,
            bmd.mudda_id, m.mudda_name,
            bth.id AS transfer_id,
            bth.role_id,
            bth.status_id, bth.transfer_from_office_id, bth.recommended_to_office_id,
            bth.transfer_reason_id, bth.transfer_reason,
            bth.decision_date, bth.transfer_from_date, bth.transfer_to_date,
            bth.remarks,
            bkd.thuna_date_bs, bkd.release_date_bs,
            oo.letter_address AS transfer_from_office_name,
            ooo.letter_address AS recommended_to_office_name,
            oooo.letter_address AS final_to_office_name, 
            btr.transfer_reason_np
            FROM bandi_transfer_history bth
            LEFT JOIN bandi_person bp ON bth.bandi_id = bp.id
            LEFT JOIN bandi_kaid_details bkd ON bp.id = bkd.bandi_id
            LEFT JOIN offices o ON bp.current_office_id = o.id
            LEFT JOIN bandi_mudda_details bmd ON bp.id = bmd.bandi_id
            LEFT JOIN muddas m ON bmd.mudda_id = m.id
            LEFT JOIN offices oo ON bth.transfer_from_office_id = oo.id
            LEFT JOIN offices ooo ON bth.recommended_to_office_id = ooo.id
            LEFT JOIN offices oooo ON bth.final_to_office_id = oooo.id
            LEFT JOIN bandi_transfer_reasons btr ON bth.transfer_reason_id = btr.id            
            ${ queryFilter }
            ORDER BY bth.id DESC
        `;
        const [rows] = await connection.query( sql, params );
        const grouped = {};

        for ( const row of rows ) {
            const {
                bandi_id, mudda_id, mudda_name,
                transfer_id, office_bandi_id, bandi_type, bandi_name,
                letter_address, role_id, status_id, dob, transfer_from_office_id,
                recommended_to_office_id, recommended_to_office_name, final_to_office_name,
                transfer_reason_id, transfer_reason_np, transfer_reason,
                decision_date, transfer_from_date, transfer_to_date, remarks,
                thuna_date_bs, release_date_bs
            } = row;

            if ( !grouped[bandi_id] ) {
                grouped[bandi_id] = {
                    bandi_id,
                    transfer_id,
                    office_bandi_id,
                    bandi_type,
                    bandi_name,
                    letter_address,
                    recommended_to_office_id,
                    recommended_to_office_name,
                    final_to_office_name,
                    dob,
                    role_id,
                    status_id,
                    transfer_reason_np,
                    transfer_reason,
                    thuna_date_bs,
                    release_date_bs,
                    remarks,
                    muddas: [],
                    transfers: []
                };
            }

            // Push mudda if not already added
            if (
                mudda_id && mudda_name &&
                !grouped[bandi_id].muddas.some( m => m.mudda_id === mudda_id )
            ) {
                grouped[bandi_id].muddas.push( { mudda_id, mudda_name } );
            }

            // Push transfer record if not already added
            if (
                transfer_id &&
                !grouped[bandi_id].transfers.some( t => t.transfer_id === transfer_id )
            ) {
                grouped[bandi_id].transfers.push( {
                    transfer_id,
                    role_id,
                    status_id,
                    transfer_from_office_id,
                    transfer_from_office_name: row.transfer_from_office_name,
                    recommended_to_office_id,
                    recommended_to_office_name: row.recommended_to_office_name,
                    transfer_reason_id,
                    transfer_reason,
                    transfer_reason_np: row.transfer_reason_np,
                    decision_date,
                    transfer_from_date,
                    transfer_to_date,
                    remarks
                } );

            }
        }

        return res.json( {
            Status: true,
            Result: Object.values( grouped ),
            message: "बन्दी ट्रान्सफर विवरण सफलतापूर्वक प्राप्त भयो।"
        } );

    } catch ( error ) {
        console.error( "❌ Error fetching transfer bandi details:", error );
        return res.status( 500 ).json( {
            Status: false,
            Error: error.message,
            message: "सर्भर त्रुटि भयो, विवरण प्राप्त गर्न असफल।"
        } );
    } finally {
        if ( connection ) connection.release();
    }
} );

router.get( '/get_transfer_bandi_ac_status1', verifyToken, async ( req, res ) => {
    const active_office = req.user.office_id;
    const user_id = req.user.id;
    const user_role = req.user.role_name;
    const [status] = await pool.query( `SELECT id FROM bandi_transfer_statuses WHERE role_required=?`, user_role );
    const statusKey = req.query.searchStatus || null;
    console.log( status );
    const bandi_id = req.query.bandi_id || null;

    let connection;
    try {
        connection = await pool.getConnection();

        let queryFilter = ' WHERE bp.is_active = 1';
        const params = [];

        if ( active_office !== 1 && active_office !== 2 ) {
            queryFilter += ' AND bp.current_office_id = ?';
            params.push( active_office );
        }

        if ( bandi_id ) {
            queryFilter += ' AND bp.id = ?';
            params.push( bandi_id );
        }

        if ( roleKey ) {
            const [roleRow] = await connection.query(
                `SELECT id FROM bandi_transfer_statuses WHERE status_key = ?`,
                [roleKey]
            );
            if ( roleRow.length > 0 ) {
                queryFilter += ' AND bth.status_id = ?';
                params.push( roleRow[0].id );
            }
        } else {
            queryFilter += ' AND bth.status_id = ?';
            params.push( roleRow[0].id );
        }

        if ( statusKey ) {
            const [statusRow] = await connection.query(
                `SELECT id FROM bandi_transfer_statuses WHERE status_key = ?`,
                [statusKey]
            );
            if ( statusRow.length > 0 ) {
                queryFilter += ' AND bth.status_id = ?';
                params.push( statusRow[0].id );
            }
        } else {
            queryFilter += ' AND bth.status_id = ?';
            params.push( status[0].id );
        }

        const sql = `
            SELECT 
            bp.id AS bandi_id,
            bp.office_bandi_id, bp.bandi_type, bp.bandi_name, bp.dob,
            o.letter_address,
            bmd.mudda_id, m.mudda_name,
            bth.id AS transfer_id,
            bth.status_id, bth.transfer_from_office_id, bth.recommended_to_office_id,
            bth.transfer_reason_id, bth.transfer_reason,
            bth.decision_date, bth.transfer_from_date, bth.transfer_to_date,
            bth.remarks,
            bkd.thuna_date_bs, bkd.release_date_bs,
            oo.letter_address AS transfer_from_office_name,
            ooo.letter_address AS recommended_to_office_name,
            oooo.letter_address AS final_to_office_name, 
            btr.transfer_reason_np
            FROM bandi_transfer_history bth
            LEFT JOIN bandi_person bp ON bth.bandi_id = bp.id
            LEFT JOIN bandi_kaid_details bkd ON bp.id = bkd.bandi_id
            LEFT JOIN offices o ON bp.current_office_id = o.id
            LEFT JOIN bandi_mudda_details bmd ON bp.id = bmd.bandi_id
            LEFT JOIN muddas m ON bmd.mudda_id = m.id
            LEFT JOIN offices oo ON bth.transfer_from_office_id = oo.id
            LEFT JOIN offices ooo ON bth.recommended_to_office_id = ooo.id
            LEFT JOIN offices oooo ON bth.final_to_office_id = oooo.id
            LEFT JOIN bandi_transfer_reasons btr ON bth.transfer_reason_id = btr.id            
            ${ queryFilter }
            ORDER BY bth.id DESC
        `;
        const [rows] = await connection.query( sql, params );
        const grouped = {};

        for ( const row of rows ) {
            const {
                bandi_id, mudda_id, mudda_name,
                transfer_id, office_bandi_id, bandi_type, bandi_name,
                letter_address, status_id, dob, transfer_from_office_id,
                recommended_to_office_id, recommended_to_office_name, final_to_office_name,
                transfer_reason_id, transfer_reason_np, transfer_reason,
                decision_date, transfer_from_date, transfer_to_date, remarks,
                thuna_date_bs, release_date_bs
            } = row;

            if ( !grouped[bandi_id] ) {
                grouped[bandi_id] = {
                    bandi_id,
                    transfer_id,
                    office_bandi_id,
                    bandi_type,
                    bandi_name,
                    letter_address,
                    recommended_to_office_id,
                    recommended_to_office_name,
                    final_to_office_name,
                    dob,
                    status_id,
                    transfer_reason_np,
                    transfer_reason,
                    thuna_date_bs,
                    release_date_bs,
                    remarks,
                    muddas: [],
                    transfers: []
                };
            }

            // Push mudda if not already added
            if (
                mudda_id && mudda_name &&
                !grouped[bandi_id].muddas.some( m => m.mudda_id === mudda_id )
            ) {
                grouped[bandi_id].muddas.push( { mudda_id, mudda_name } );
            }

            // Push transfer record if not already added
            if (
                transfer_id &&
                !grouped[bandi_id].transfers.some( t => t.transfer_id === transfer_id )
            ) {
                grouped[bandi_id].transfers.push( {
                    transfer_id,
                    status_id,
                    transfer_from_office_id,
                    transfer_from_office_name: row.transfer_from_office_name,
                    recommended_to_office_id,
                    recommended_to_office_name: row.recommended_to_office_name,
                    transfer_reason_id,
                    transfer_reason,
                    transfer_reason_np: row.transfer_reason_np,
                    decision_date,
                    transfer_from_date,
                    transfer_to_date,
                    status_id,
                    remarks
                } );

            }
        }

        return res.json( {
            Status: true,
            Result: Object.values( grouped ),
            message: "बन्दी ट्रान्सफर विवरण सफलतापूर्वक प्राप्त भयो।"
        } );

    } catch ( error ) {
        console.error( "❌ Error fetching transfer bandi details:", error );
        return res.status( 500 ).json( {
            Status: false,
            Error: error.message,
            message: "सर्भर त्रुटि भयो, विवरण प्राप्त गर्न असफल।"
        } );
    } finally {
        if ( connection ) connection.release();
    }
} );

router.post( '/create_bandi_transfer_history', verifyToken, async ( req, res ) => {
    const active_office = req.user.office_id;
    const user_id = req.user.id;
    const user_role_id = req.user.role_id;
    const data = req.body;
    // console.log( data );
    let connection;
    const allowedRoles=['clerk', 'office_admin']
    if(!Number.isInteger(data.bandi_id)||!Number.isInteger(data.transfer_reason_id)){
        return res.status(400).json({Status:false, message:"Invalid input"});
    }
    try {
        connection = await pool.getConnection();
        connection.beginTransaction();

        const insertsql = `INSERT INTO bandi_transfer_history (
                bandi_id, transfer_reason_id, transfer_reason, 
                transfer_from_office_id, recommended_to_office_id,
                is_thunuwa_permission, role_id, status_id,
                created_by, updated_by, created_at, updated_at, created_office_id)
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`;
        const values = [data.bandi_id, data.transfer_reason_id, data.transfer_reason,
            active_office, data.recommended_to_office_id,
        data.is_thunuwa_permission, user_role_id, user_role_id,
            user_id, user_id, new Date(), new Date(), active_office
        ];

        const [result] = await connection.query( insertsql, values );
        const insertId = result.insertId;
        const logsql = `INSERT INTO bandi_transfer_log(bandi_transfer_id, status_id, action_by, action_at)
                        VALUES(?,?,?,?)`;
        const logValue = [insertId, user_role_id, user_id, new Date()];
        await connection.query( logsql, logValue );
        await connection.commit();
        return res.status( 200 ).json( {
            Status: true,
            message: "ट्रान्सफर विवरण सफलतापूर्वक सिर्जना भयो।"
        } );
    } catch ( error ) {
        await connection.rollback();
        console.error( "❌ Error in create_bandi_transfer_history:", error );
        return res.status( 500 ).json( {
            Status: false,
            Error: error.message,
            message: "सर्भर त्रुटि भयो, ट्रान्सफर विवरण सिर्जना गर्न असफल।"
        } );
    } finally {
        if ( connection ) connection.release();
    }
} );

// const [role_id] = await pool.query(`SELECT id FROM user_roles WHERE role_name=?`, [metadata.to_role]);
// console.log("Role ID:", role_id[0]?.id);

router.put( '/update_bandi_transfer_history/:id', verifyToken, async ( req, res ) => {
    const active_office = req.user.office_id;
    const user_id = req.user.id;
    const id = req.params.id;
    const metadata = req.body;
    console.log( "metadata:", metadata );

    let connection;
    try {
        connection = await pool.getConnection();

        const [status_id] = await pool.query(
            `SELECT id FROM bandi_transfer_statuses WHERE role_required = ?`,
            [metadata.to_role]
        );

        if ( !status_id[0]?.id ) {
            return res.status( 400 ).json( {
                Status: false,
                message: "मान्य स्थिति फेला परेन।"
            } );
        }

        const [current_status_id] = await pool.query( `
            SELECT status_id FROM bandi_transfer_history WHERE id=?`, id );

        let sql;
        let values;


        sql = `
                UPDATE bandi_transfer_history 
                SET status_id = ?, remarks = ?,final_to_office_id=?, updated_by = ?, updated_at = ?
                WHERE id = ?`;
        values = [
            status_id[0].id,
            metadata.remarks,
            metadata.final_to_office_id,
            user_id,
            new Date(),
            id
        ];

        const [result] = await connection.query( sql, values );

        const logSql = `INSERT INTO bandi_transfer_log(bandi_transfer_id, status_id, action_by, action_at, remarks, previous_status_id)
        VALUES(?, ?, ?, ?, ?, ?)`;
        const logValues = [id, status_id[0].id, user_id, new Date(), metadata.remarks, current_status_id[0].id];
        const [logResult] = await connection.query( logSql, logValues );
        if ( result.affectedRows === 0 ) {
            return res.status( 404 ).json( {
                Status: false,
                message: "ट्रान्सफर ID भेटिएन।"
            } );
        }

        return res.status( 200 ).json( {
            Status: true,
            message: "ट्रान्सफर स्थिति सफलतापूर्वक अपडेट भयो।"
        } );

    } catch ( error ) {
        console.error( "❌ Error in update_bandi_transfer_history:", error );
        return res.status( 500 ).json( {
            Status: false,
            Error: error.message,
            message: "सर्भर त्रुटि भयो, ट्रान्सफर विवरण अपडेट गर्न असफल।"
        } );
    } finally {
        if ( connection ) connection.release();
    }
} );

router.put( '/approve_bandi_transfer/:id', verifyToken, async ( req, res ) => {
    const active_office = req.user.office_id;
    const user_id = req.user.id;
    const id = req.params.id;
    const metadata = req.body;
    console.log( "metadata:", metadata );

    let connection;
    try {
        connection = await pool.getConnection();

        const [status_id] = await pool.query(
            `SELECT id FROM bandi_transfer_statuses WHERE status_key = ?`,
            [metadata.to_role]
        );

        if ( !status_id[0]?.id ) {
            return res.status( 400 ).json( {
                Status: false,
                message: "मान्य स्थिति फेला परेन।"
            } );
        }

        const [current_status_id] = await pool.query( `
            SELECT status_id FROM bandi_transfer_history WHERE id=?`, id );

        let sql;
        let values;


        sql = `
                UPDATE bandi_transfer_history 
                SET status_id = ?, remarks = ?,final_to_office_id=?, updated_by = ?, updated_at = ?
                WHERE id = ?`;
        values = [
            status_id[0].id,
            metadata.remarks,
            metadata.final_to_office_id,
            user_id,
            new Date(),
            id
        ];

        const [result] = await connection.query( sql, values );

        const logSql = `INSERT INTO bandi_transfer_log(bandi_transfer_id, status_id, action_by, action_at, remarks, previous_status_id)
        VALUES(?, ?, ?, ?, ?, ?)`;
        const logValues = [id, status_id[0].id, user_id, new Date(), metadata.remarks, current_status_id[0].id];
        const [logResult] = await connection.query( logSql, logValues );
        if ( result.affectedRows === 0 ) {
            return res.status( 404 ).json( {
                Status: false,
                message: "ट्रान्सफर ID भेटिएन।"
            } );
        }

        return res.status( 200 ).json( {
            Status: true,
            message: "ट्रान्सफर स्थिति सफलतापूर्वक अपडेट भयो।"
        } );

    } catch ( error ) {
        console.error( "❌ Error in update_bandi_transfer_history:", error );
        return res.status( 500 ).json( {
            Status: false,
            Error: error.message,
            message: "सर्भर त्रुटि भयो, ट्रान्सफर विवरण अपडेट गर्न असफल।"
        } );
    } finally {
        if ( connection ) connection.release();
    }
} );

router.get( '/get_bandi_transfer_history/', async ( req, res ) => {
    // const active_office = req.user.office_id;
    const { id } = req.params;
    const sql = `
        SELECT bth.*,
            o.letter_address AS from_office_name, 
            oo.letter_address AS to_office_name            
        FROM bandi_transfer_history bth        
        LEFT JOIN offices o ON bth.transfer_from_office_id = o.id        
        LEFT JOIN offices oo ON bth.transfer_from_office_id = oo.id        
    `;
    try {
        const [result] = await pool.query( sql, [id] ); // Use promise-wrapped query
        // console.log(result)
        if ( result.length === 0 ) {
            return res.json( { Status: false, Error: "Bandi ID not found" } );
        }
        return res.json( { Status: true, Result: result } );
    } catch ( err ) {
        console.error( err );
        return res.json( { Status: false, Error: "Query Error" } );
    }
} );



router.put( '/update_bandi_final_transfer/:id', verifyToken, async ( req, res ) => {
    const active_office = req.user.office_id;
    const user_id = req.user.id;
    const metadata = req.body;
    const id = req.params.id;
    const status = req.query.status || null;
    let connection;
    try {
        connection = await pool.getConnection();
        const [InitialStatus] = await pool.query( `SELECT id FROM bandi_transfer_statuses WHERE
            status_key=?`, [status] );
        const newStatus = InitialStatus[0].id + 1; // Incrementing status ID for next step
        // console.log("Initial Status ID:", newStatus);
        if ( id === metadata.id ) {
            const sql = `UPDATE bandi_transfer_history
            SET decision_date = ?, transfer_from_date = ?,
            transfer_to_office_id = ?,
            transfer_reason_id = ?, transfer_reason = ?,
            status_id = ?, remarks = ?,
            updated_by = ?, updated_at = ?
            WHERE id = ?`;
            const values = [metadata.decision_date, metadata.apply_date,
            metadata.final_to_office_id, metadata.reason_id, metadata.reason_details,
                newStatus, metadata.remarks, user_id, new Date(), id];
        } else {
            console.warn( "⚠️ Mismatched ID in request body." );
            return res.status( 400 ).json( {
                Status: false,
                message: "बन्दी ट्रान्सफर आईडी मिलेनन्। कृपया पुन: प्रयास गर्नुहोस्।"
            } );
        }
    } catch ( error ) {
        console.error( "❌ Error fetching initial status:", error );
        return res.status( 500 ).json( {
            Status: false,
            Error: error.message,
            message: "सर्भर त्रुटि भयो, प्रारम्भिक स्थिति प्राप्त गर्न असफल।"
        } );
    } finally {
        if ( connection ) connection.release();
    }
} );

router.post( '/create_bandi_final_transfer', verifyToken, async ( req, res ) => {
    const active_office = req.user.office_id;
    const user_id = req.user.id;
    const metadata = req.body;
    // console.log("📥 Full Request Body:", JSON.stringify(req.body, null, 2));
    let connection;
    try {
        connection = await pool.getConnection();

        const [InitialStatus] = await pool.query( `SELECT id FROM bandi_transfer_statuses WHERE
            status_key='sent_by_clerk'`);
        // console.log("Initial Status ID:", InitialStatus);
        const insertCount = await insertFinalTransferDetails(
            metadata,
            InitialStatus[0].id,
            user_id,
            active_office,
            connection
        );

        if ( insertCount === 0 ) {
            // await rollbackAsync();
            await connection.rollback();
            console.warn( "⚠️ No rows inserted. Possible bad data structure." );
            return res.status( 400 ).json( {
                Status: false,
                message: "डेटा इन्सर्ट गर्न सकेनौं। सम्भवत: 'relation_id' छुट्यो वा गलत ढाँचा।"
            } );
        }
        // await commitAsync();
        await connection.commit();
        return res.json( {
            Status: true,
            message: "बन्दी विवरण सफलतापूर्वक सुरक्षित गरियो।"
        } );

    } catch ( error ) {
        // await rollbackAsync();
        await connection.rollback();
        console.error( "❌ Transaction failed:", error );
        return res.status( 500 ).json( {
            Status: false,
            Error: error.message,
            message: "सर्भर त्रुटि भयो, सबै डाटा पूर्वस्थितिमा फर्काइयो।"
        } );
    } finally {
        if ( connection ) connection.release();
    }
} );

//
router.post( '/create_bandi_karagar_history', verifyToken, async ( req, res ) => {
    const active_office = req.user.office_id;
    const user_id = req.user.id;
    let connection;
    try {
        connection = await pool.getConnection();
        console.log( "📥 Full Request Body:", JSON.stringify( req.body, null, 2 ) );

        const insertCount = await insertContacts(
            req.body.bandi_id,
            req.body.contact_person,
            user_id,
            active_office
        );

        if ( insertCount === 0 ) {
            // await rollbackAsync();
            await connection.rollback();
            console.warn( "⚠️ No rows inserted. Possible bad data structure." );
            return res.status( 400 ).json( {
                Status: false,
                message: "डेटा इन्सर्ट गर्न सकेनौं। सम्भवत: 'relation_id' छुट्यो वा गलत ढाँचा।"
            } );
        }

        // await commitAsync();
        await connection.commit();
        return res.json( {
            Status: true,
            message: "बन्दी विवरण सफलतापूर्वक सुरक्षित गरियो।"
        } );

    } catch ( error ) {
        // await rollbackAsync();
        await connection.rollback();
        console.error( "❌ Transaction failed:", error );
        return res.status( 500 ).json( {
            Status: false,
            Error: error.message,
            message: "सर्भर त्रुटि भयो, सबै डाटा पूर्वस्थितिमा फर्काइयो।"
        } );
    } finally {
        connection.release();
    }
} );


//
router.get( '/get_bandi_transfer_history/:id', async ( req, res ) => {
    const { id } = req.params;
    const sql = `
    SELECT bth.*, 
    o.office_name_with_letter_address AS transfer_to_office_fn,
    oo.office_name_with_letter_address AS transfer_from_office_fn,
    btr.transfer_reason_np
    FROM bandi_transfer_history bth
    LEFT JOIN offices o ON bth.transfer_office_id = o.id
    LEFT JOIN bandi_transfer_reasons btr ON bth.transfer_reason_id=btr.id
    LEFT JOIN offices oo ON bth.created_office_id = oo.id
    WHERE bandi_id=?
    `;
    try {
        const [result] = await pool.query( sql, [id] ); // Use promise-wrapped query
        // console.log(result)
        if ( result.length === 0 ) {
            return res.json( { Status: false, Error: "Bandi ID not found" } );
        }
        return res.json( { Status: true, Result: result } );
    } catch ( err ) {
        console.error( err );
        return res.json( { Status: false, Error: "Query Error" } );
    }
} );
//
router.put( '/update_bandi_transfer_history1/:id', verifyToken, async ( req, res ) => {
    const active_office = req.user.office_id;
    const user_id = req.user.id;
    const contactId = req.params.id;

    let connection;
    try {
        connection = await pool.getConnection();
        console.log( "📝 Update contact request:", req.body );

        const updatedCount = await updateContactPerson( contactId, req.body, user_id, active_office );

        if ( updatedCount === 0 ) {
            return res.status( 400 ).json( {
                Status: false,
                message: "डेटा अपडेट गर्न सकेनौं। कृपया सबै विवरणहरू जाँच गर्नुहोस्।"
            } );
        }

        // await commitAsync();
        await connection.commit();

        return res.json( {
            Status: true,
            message: "बन्दी सम्पर्क व्यक्ति विवरण सफलतापूर्वक अपडेट गरियो।"
        } );

    } catch ( error ) {
        // await rollbackAsync();
        await connection.rollback();
        console.error( "❌ Update failed:", error );

        return res.status( 500 ).json( {
            Status: false,
            Error: error.message,
            message: "सर्भर त्रुटि भयो, सम्पर्क विवरण अपडेट गर्न असफल।"
        } );
    } finally {
        if ( connection ) connection.release();
    }
} );

router.get( '/get_transfer_reasons', async ( req, res ) => {
    const sql = `SELECT * from bandi_transfer_reasons ORDER BY id`;
    try {
        const [result] = await pool.query( sql );
        // console.log(result)
        return res.json( { Status: true, Result: result } );
    } catch ( err ) {
        console.error( "Database Query Error:", err );
        res.status( 500 ).json( { Status: false, Error: "Internal Server Error" } );
    }
} );

router.get( '/get_allowed_statuses', verifyToken, async ( req, res ) => {
    const role_id = req.user.role_id;
    const sql = `SELECT s.status_key, s.status_label 
        FROM bandi_transfer_role_permisions btrp 
        JOIN bandi_transfer_statuses s ON btrp.status_id=s.id
        WHERE btrp.role_id=? ORDER BY btrp.id`;
    try {
        const [result] = await pool.query( sql, role_id );
        // console.log(result)
        return res.json( { Status: true, Result: result } );
    } catch ( err ) {
        console.error( "Database Query Error:", err );
        res.status( 500 ).json( { Status: false, Error: "Internal Server Error" } );
    }
} );


export { router as bandiTransferRouter };