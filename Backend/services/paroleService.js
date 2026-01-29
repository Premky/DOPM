import { BANDI_STATUS } from "../constants/bandiStatus.js";
import { bs2ad } from "../utils/bs2ad.js";
import pool from "../utils/db3.js";
import { logAudit } from "./auditService.js";
import { updateBandiStatus } from "./bandiStatusService.js";

export const getParoleNos = async ( data, active_user ) => {
    const sql = `SELECT * FROM payrole_nos`;
    const [result] = await pool.query( sql );
    return { result };
};

export const createParoleNos = async ( data, active_user ) => {
    //Conversion of Dates:
    const parole_calculation_date_ad = data.payrole_calculation_date ? await bs2ad( data.payrole_calculation_date ) : null;
    const parole_decision_date_ad = data.payrole_decision_date ? await bs2ad( data.payrole_decision_date ) : null;
    const parole_granted_letter_date_ad = data.parole_granted_letter_date ? await bs2ad( data.parole_granted_letter_date ) : null;

    const sql = `
        INSERT INTO payrole_nos(
                payrole_no_name, payrole_calculation_date, parole_calculation_date_ad, payrole_decision_date, parole_decision_date_ad,
                parole_granted_letter_no, parole_granted_letter_date, parole_granted_letter_date_ad, parole_no_bandi_granted, is_active,
                created_by, created_at, updated_by, updated_at
                ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        `;
    const params = [
        data.payrole_no_name, data.payrole_calculation_date, parole_calculation_date_ad, data.payrole_decision_date, parole_decision_date_ad,
        data.parole_granted_letter_no, data.parole_granted_letter_date, parole_granted_letter_date_ad, data.parole_no_bandi_granted || 0, data.is_active,
        active_user, data.created_at || new Date(), active_user, data.updated_at || new Date()
    ];

    const [result] = await pool.query( sql, params );
    return { id: result.insertId, ...data };
};

export const updateParoleNos = async ( data, active_user, id ) => {
    //Conversion of Dates:
    const parole_calculation_date_ad = data.payrole_calculation_date ? await bs2ad( data.payrole_calculation_date ) : null;
    const parole_decision_date_ad = data.payrole_decision_date ? await bs2ad( data.payrole_decision_date ) : null;
    const parole_granted_letter_date_ad = data.parole_granted_letter_date ? await bs2ad( data.parole_granted_letter_date ) : null;

    const sql = `
        UPDATE payrole_nos SET
                payrole_no_name=?, payrole_calculation_date=?, parole_calculation_date_ad=?, payrole_decision_date=?, parole_decision_date_ad=?,
                parole_granted_letter_no=?, parole_granted_letter_date=?, parole_granted_letter_date_ad=?, parole_no_bandi_granted=?, is_active=?,
                updated_by=?, updated_at=? WHERE id=?
        `;

    const params = [
        data.payrole_no_name, data.payrole_calculation_date, parole_calculation_date_ad, data.payrole_decision_date, parole_decision_date_ad,
        data.parole_granted_letter_no, data.parole_granted_letter_date, parole_granted_letter_date_ad, data.parole_no_bandi_granted, data.is_active,
        active_user, data.updated_at || new Date(), id
    ];

    const [result] = await pool.query( sql, params );
    return { id: result.insertId, ...data };
};

export const saveCourtDecisionService = async ( {
    parole_id,
    data,
    userId, currentOffice
} ) => {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        const paroleId = data.payrole_id;
        const court_decision = data.payrole_result == "पास" ? "approved" : "rejected";
        const parole_granted_letter_date_ad = await bs2ad( data.payrole_granted_letter_date );
        // Update Parole Table
        await conn.query( `UPDATE payroles SET
            status=?, is_completed=?, recommended_court_id =?, payrole_granted_letter_no=?, payrole_granted_letter_date=?, 
            parole_granted_letter_date_ad=?, court_decision=?, court_decision_date=?, court_remarks=?, updated_by=?
            WHERE id=?
            `, [17, 'Pending', data.payrole_granted_court, data.payrole_granted_letter_no, data.payrole_granted_letter_date,
            parole_granted_letter_date_ad, court_decision, data.payrole_granted_aadesh_date,
            data.court_remarks, userId, paroleId
        ] );

        //Find Bandi ID
        const [[parole]] = await conn.query( `SELECT id, bandi_id, office_bandi_id, payrole_no_id FROM payroles WHERE id = ?`, [paroleId] );
        console.log( 'parole_id:', parole );
        if ( !parole ) throw new Error( "Parole not found" );

        const bandiStatus = data.payrole_result === "पास" ? "released_on_parole" : "in_custody";
        const bandiStatusId = data.payrole_result === "पास" ? 2 : 1;

        //Update Payrole Decision:
        // First Check if Decision Exists in the table:
        const [parole_exists] = await conn.query( `SELECT payrole_id FROM payrole_decisions WHERE bandi_id=?`, [parole.bandi_id] );
        if ( parole_exists.length > 0 ) {
            await conn.query( `UPDATE payrole_decisions SET payrole_granted_court=?, payrole_granted_aadesh_date=?, payrole_granted_letter_no=?, 
                    payrole_granted_letter_date=?, payrole_result=?, payrole_decision_remark=?, decision_updated_by=?, 
                    decision_updated_office=? WHERE payrole_id=?`, [
                data.payrole_granted_court, data.payrole_granted_aadesh_date, data.payrole_granted_letter_no,
                data.payrole_granted_letter_date, data.payrole_result, data.court_remarks, userId, currentOffice, paroleId
            ] );
        } else {
            await conn.query( `INSERT INTO payrole_decisions(
                bandi_id, office_bandi_id, payrole_id, payrole_nos, 
                payrole_granted_court, payrole_granted_aadesh_date, payrole_granted_letter_no, 
                payrole_granted_letter_date, payrole_result, payrole_decision_remark, decision_updated_by,
                decision_updated_at, decision_updated_office) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)`, [
                parole.bandi_id, parole.office_bandi_id, paroleId, parole.payrole_no_id,
                data.payrole_granted_court, data.payrole_granted_aadesh_date, data.payrole_granted_letter_no,
                data.payrole_granted_letter_date, data.payrole_result, data.court_remarks, userId, new Date(), currentOffice
            ] );
        }

        await conn.query( `INSERT INTO payrole_logs(payrole_id, bandi_id, office_bandi_id, hajir_date, hajir_status, hajir_office_id)
            VALUES(?,?,?,?,?,?)`, [paroleId, parole.bandi_id, parole.office_bandi_id, data.payrole_granted_letter_date, 'उपस्थित', currentOffice] );


        // Update Bandi Current Status:
        if ( data.payrole_result === "पास" ) {
            await conn.query( `UPDATE bandi_person SET bandi_status=?, is_under_payrole=? WHERE id=?`, [bandiStatusId, 0, parole.bandi_id] );
            await updateBandiStatus(
                conn, {
                bandiId: parole.bandi_id,                
                newStatusId: BANDI_STATUS.PAROLE_GRANTED,
                historyCode: "RELEASED_ON_PAROLE",
                source: "SYSTEM",
                userId: userId || null,
            } );
        }

        //Insert status history: 
        await conn.query( `
            INSERT INTO bandi_status_history(
            bandi_id, status_code, source_table, remarks, decision_date, created_by) 
            VALUES (?, ?, 'COURT', ?, ?, ? )
            `, [parole.bandi_id,
        data.court_decision === "पास" ? "COURT_APPROVED" : "COURT_REJECTED",
        data.court_remarks || null, data.payrole_granted_aadesh_date, userId] );

        await conn.commit();
    } catch ( error ) {
        await conn.rollback();
        throw error;
    } finally {
        conn.release();
    }
};

// utils/paroleConfig.js
export const SUMMARY_CONFIG = {
    mudda: {
        label: "मुद्दा",
        select: "bmd_combined.mudda_name",
        alias: "group_name",
        joins: `
     LEFT JOIN (
                    SELECT *
                    FROM (
                        SELECT 
                            bmd.bandi_id,
                            bmd.mudda_id,
                            m.mudda_name,
                            bmd.mudda_no,
                            bmd.thuna_date_bs,
                            bmd.release_date_bs,
                            bmd.vadi,
                            bmd.is_main_mudda,
                            bmd.is_last_mudda,
                            bmd.mudda_phesala_antim_office_id,
                            bmd.mudda_phesala_antim_office_date,
                            o.office_name_with_letter_address AS mudda_phesala_antim_office,
                            ROW_NUMBER() OVER (
                                PARTITION BY bmd.bandi_id 
                                ORDER BY 
                                    (bmd.is_main_mudda = 1 AND bmd.is_last_mudda = 1) DESC,
                                    bmd.is_main_mudda DESC,
                                    bmd.is_last_mudda DESC,
                                    bmd.id DESC
                            ) AS rn
                        FROM bandi_mudda_details bmd
                        LEFT JOIN muddas m ON bmd.mudda_id = m.id
                        LEFT JOIN offices o ON bmd.mudda_phesala_antim_office_id = o.id
                    ) ranked
                    WHERE ranked.rn = 1
                ) AS bmd_combined ON bp.id = bmd_combined.bandi_id
    `,
        orderBy: "bmd_combined.mudda_name",
        sheetName: "Mudda Wise Summary",
        filename: "mudda_wise_summary",
    },

    office: {
        label: "कार्यालय",
        select: "o.letter_address",
        alias: "group_name",
        joins: `
      JOIN offices o ON o.id = bp.current_office_id
    `,
        orderBy: "o.letter_address",
        sheetName: "Office Wise Summary",
        filename: "office_wise_summary",
    },
};

export const buildParoleSummaryQuery = ( { mode, type, payrole_no_id } ) => {
    const cfg = SUMMARY_CONFIG[mode];

    let whereClause = "";
    const values = [];

    if ( payrole_no_id ) {
        whereClause = "WHERE p.payrole_no_id = ?";
        values.push( payrole_no_id );
    }

    const groupBy =
        type === "gender"
            ? `GROUP BY ${ cfg.select }, bp.gender`
            : `GROUP BY ${ cfg.select }`;

    const sql = `
    SELECT
      ${ cfg.select } AS group_name
      ${ type === "gender" ? ", bp.gender" : "" }
      ,SUM(CASE WHEN p.pyarole_rakhan_upayukat = 'eligible' THEN 1 ELSE 0 END) AS parole_yogya
      ,SUM(CASE WHEN p.pyarole_rakhan_upayukat = 'ineligible' THEN 1 ELSE 0 END) AS parole_ayogya
      ,SUM(CASE WHEN p.pyarole_rakhan_upayukat = 'discussion' THEN 1 ELSE 0 END) AS parole_chalfal
      ,SUM(CASE WHEN p.pyarole_rakhan_upayukat = 'incomplete_docs' THEN 1 ELSE 0 END) AS parole_lack_of_paper_work
      ,SUM(CASE WHEN p.pyarole_rakhan_upayukat = 'passed' THEN 1 ELSE 0 END) AS parole_pass
      ,SUM(CASE WHEN p.pyarole_rakhan_upayukat = 'failed' THEN 1 ELSE 0 END) AS parole_fail
      ,SUM(CASE WHEN p.pyarole_rakhan_upayukat IS NULL OR p.pyarole_rakhan_upayukat = '' THEN 1 ELSE 0 END) AS parole_unseen
      ,SUM(CASE WHEN p.court_decision = 'पास' THEN 1 ELSE 0 END) AS court_pass
      ,SUM(CASE WHEN p.court_decision = 'फेल' THEN 1 ELSE 0 END) AS court_fail
    FROM payroles p
    JOIN bandi_person bp ON bp.id = p.bandi_id
    ${ cfg.joins }
    ${ whereClause }
    ${ groupBy }
    ORDER BY ${ cfg.orderBy }
  `;

    return { sql, values };
};

export const fetchParoleSummary = async ( pool, options ) => {
    const { sql, values } = buildParoleSummaryQuery( options );
    const [rows] = await pool.query( sql, values );

    const totals = {
        parole_sifaris: 0,
        parole_unseen: 0,
        parole_yogya: 0,
        parole_ayogya: 0,
        parole_chalfal: 0,
        parole_lack_of_paper_work: 0,
        parole_pass: 0,
        parole_fail: 0,
        court_pass: 0,
        court_fail: 0,
    };

    rows.forEach( row => {
        totals.parole_unseen += Number( row.parole_unseen || 0 );
        totals.parole_yogya += Number( row.parole_yogya || 0 );
        totals.parole_ayogya += Number( row.parole_ayogya || 0 );
        totals.parole_chalfal += Number( row.parole_chalfal || 0 );
        totals.parole_lack_of_paper_work += Number( row.parole_lack_of_paper_work || 0 );
        totals.parole_pass += Number( row.parole_pass || 0 );
        totals.parole_fail += Number( row.parole_fail || 0 );
        totals.court_pass += Number( row.court_pass || 0 );
        totals.court_fail += Number( row.court_fail || 0 );
    } );

    totals.parole_sifaris =
        totals.parole_yogya +
        totals.parole_ayogya +
        totals.parole_chalfal +
        totals.parole_lack_of_paper_work +
        totals.parole_pass +
        totals.parole_fail +
        totals.parole_unseen;

    const enrichedRows = rows.map( r => ( {
        ...r,
        total_parole:
            Number( r.parole_yogya || 0 ) +
            Number( r.parole_ayogya || 0 ) +
            Number( r.parole_chalfal || 0 ) +
            Number( r.parole_lack_of_paper_work || 0 ) +
            Number( r.parole_pass || 0 ) +
            Number( r.parole_fail || 0 ) +
            Number( r.parole_unseen || 0 ),
    } ) );

    return {
        rows: enrichedRows,
        totals,
    };
};

