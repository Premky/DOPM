import { bs2ad } from "../utils/bs2ad.js";
import pool from "../utils/db3.js";

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
        data.parole_granted_letter_no, data.parole_granted_letter_date, parole_granted_letter_date_ad, data.parole_no_bandi_granted, data.is_active,
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
        if(data.payrole_result === "पास"){
            await conn.query( `UPDATE bandi_person SET bandi_status=?, is_under_payrole=? WHERE id=?`, [bandiStatusId, 1, parole.bandi_id] );
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