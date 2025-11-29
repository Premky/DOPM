import { bs2ad } from "../utils/bs2ad.js";
import pool from "../utils/db3.js";

export const getParoleNos = async ( data, active_user ) => {
    const sql =`SELECT * FROM payrole_nos`;
    const [result] = await pool.query(sql);
    return {result};
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

export const updateParoleNos = async ( data, active_user ) => {
    //Conversion of Dates:
    const parole_calculation_date_ad = data.payrole_calculation_date ? await bs2ad( data.payrole_calculation_date ) : null;
    const parole_decision_date_ad = data.payrole_decision_date ? await bs2ad( data.payrole_decision_date ) : null;
    const parole_granted_letter_date_ad = data.parole_granted_letter_date ? await bs2ad( data.parole_granted_letter_date ) : null;

    const sql = `
        UPDATE parole_nos SET
                payrole_no_name=?, payrole_calculation_date=?, parole_calculation_date_ad=?, payrole_decision_date=?, parole_decision_date_ad=?,
                parole_granted_letter_no=?, parole_granted_letter_date=?, parole_granted_letter_date_ad=?, parole_no_bandi_granted=?, is_active=?,
                created_by=?, created_at=?, updated_by=?, updated_at=?
        `;

    const params = [
        data.payrole_no_name, data.payrole_calculation_date, parole_calculation_date_ad, data.payrole_decision_date, parole_decision_date_ad,
        data.parole_granted_letter_no, data.parole_granted_letter_date, parole_granted_letter_date_ad, data.parole_no_bandi_granted, data.is_active,
        active_user, data.created_at || new Date(), active_user, data.updated_at || new Date()
    ];

    const [result] = await pool.query( sql, params );
    return { id: result.insertId, ...data };
};