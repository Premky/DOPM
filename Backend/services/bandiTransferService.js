import { addFilter } from '../queryUtils/sqlFilterBuilder.js';
import pool from '../utils/db3.js';

async function insertTransferDetails( bandi_id, transfer_details = [], role_id,InitialStatus, user_id, active_office, connection ) {
    // console.log(transfer_details)
    const values = transfer_details.map( item => [
        bandi_id,
        item.transfer_reason_id,
        item.transfer_reason,
        item.recommended_to_office_id,
        item.is_thunuwa_permission,
        role_id,
        InitialStatus,
        user_id,
        user_id,
        new Date(),
        new Date(),
        active_office
    ] );

    try {
        if ( !transfer_details.length ) {
            console.warn( "⚠️ No contacts provided to insert." );
            return 0;
        }
        const filteredData = transfer_details.filter( c =>
            ( typeof c.transfer_reason_id === 'string' && c.transfer_reason_id.trim() !== '' ) ||
            ( typeof c.recommended_to_office_id === 'number' && !isNaN( c.recommended_to_office_id ) )
        );
        if ( !filteredData.length ) {
            console.warn( "⚠️ All contacts filtered out. Possibly missing 'relation_id'." );
            console.log( "🔍 Received contacts:", transfer_details );
            return 0;
        }

        const sql = `INSERT INTO bandi_transfer_history (
                bandi_id, transfer_reason_id, transfer_reason, recommended_to_office_id,
                is_thunuwa_permission,role_id, status_id,
                created_by, updated_by, created_at, updated_at, created_office_id
                ) VALUES ?`;

        // const result = await queryAsync( sql, [values] );
        const [result] = await connection.query( sql, [values] );
        console.log( "✅ Insert result:", result );
        return result.affectedRows || 0;
    } catch ( err ) {
        console.error( "❌ SQL/Insert error:", err ); // <-- logs real SQL or DB issues
        throw err;
    }
}

async function insertFinalTransferDetails( data, InitialStatus, user_id, active_office, connection ) {
    // console.log(data)
    const values = [
        data.bandi_id,
        active_office,  data.proposed_karagar_office,     
        data.decision_date, data.apply_date,
        // data.nirnay_officer,
        data.reason_id,
        data.reason_details,
        InitialStatus,
        data.remarks,
        user_id,
        user_id,
        new Date(),
        new Date(),
        active_office
    ] ;

    try {
        if ( !data.bandi_id || !data.proposed_karagar_office || !data.reason_id ) {
            console.warn( "⚠️ No data provided to insert.",data );
            return 0;
        }        
        const sql = `INSERT INTO bandi_transfer_history (
                bandi_id,
                transfer_from_office_id, recommended_to_office_id, 
                decision_date, transfer_from_date,
                transfer_reason_id, transfer_reason, 
                status_id, remarks,
                created_by, updated_by, created_at, updated_at, created_office_id
                ) VALUES (?)`;
        // const result = await queryAsync( sql, [values] );
        const [result] = await connection.query( sql, [values] );
        console.log( "✅ Insert result:", result );
        return result.affectedRows || 0;
    } catch ( err ) {
        console.error( "❌ SQL/Insert error:", err ); // <-- logs real SQL or DB issues
        throw err;
    }
}

async function getAllowedStatusesForRole(role_id) {
    
}

// ✅ Helper Function to build dynamic SQL and values
async function buildUpdateData(metadata, statusId, roleId, userId, recordId) {
    const now = new Date();

    if (metadata.final_to_office_id) {
        return {
            sql: `
                UPDATE bandi_transfer_history 
                SET role_id=?, status_id=?, decision_date=?, remarks=?, final_to_office_id=?, updated_by=?, updated_at=?
                WHERE id=?`,
            values: [roleId, statusId, metadata.decision_date, metadata.remarks, metadata.final_to_office_id, userId, now, recordId]
        };
    }

    if (metadata.decision_date && metadata.letter_cn && metadata.letter_date) {
        return {
            sql: `
                UPDATE bandi_transfer_history 
                SET role_id=?, status_id=?, decision_date=?, letter_cn=?, letter_date=?, remarks=?, final_to_office_id=?, updated_by=?, updated_at=?
                WHERE id=?`,
            values: [roleId, 12, metadata.decision_date, metadata.letter_cn, metadata.letter_date, metadata.remarks, metadata.recommended_to_office_id, userId, now, recordId]
        };
    }

    if (metadata.recommended_to_office_id && metadata.decision_date) {
        return {
            sql: `
                UPDATE bandi_transfer_history 
                SET role_id=?, status_id=?, decision_date=?, remarks=?, recommended_to_office_id=?, updated_by=?, updated_at=?
                WHERE id=?`,
            values: [roleId, statusId, metadata.decision_date, metadata.remarks, metadata.recommended_to_office_id, userId, now, recordId]
        };
    }

    if (metadata.transfer_date) {
        return {
            sql: `
                UPDATE bandi_transfer_history 
                SET role_id=?, status_id=?, remarks=?, transfer_from_date=?, updated_by=?, updated_at=?
                WHERE id=?`,
            values: [roleId, statusId, metadata.remarks, metadata.transfer_date, userId, now, recordId]
        };
    }

    return {
        sql: `
            UPDATE bandi_transfer_history 
            SET role_id=?, status_id=?, remarks=?, updated_by=?, updated_at=?
            WHERE id=?`,
        values: [roleId, statusId, metadata.remarks, userId, now, recordId]
    };
}

export const getTransferBandiByFilters = async ({
    connection,
    filters,
    user
}) => {
    let where = `WHERE is_active = 1`;
    let params = [];

    const apply = (cond, val) => {
        ({ where, params } = addFilter(where, params, cond, val));
    };

    // ------------------
    // Basic filters
    // ------------------
    apply(`bandi_id = ?`, filters.bandiId);

    if (filters.bandiName) {
        apply(`bandi_name LIKE ?`, `%${filters.bandiName}%`);
    }

    apply(`current_office_id = ?`, filters.fromOffice);
    apply(`final_to_office_id = ?`, filters.toOffice);
    apply(`is_completed = ?`, filters.isCompleted);
    apply(`role_id = ?`, filters.roleId);
    apply(`transfer_reason_id = ?`, filters.transferReason);

    // ------------------
    // Status resolution
    // ------------------
    let statusId = null;

    if (filters.statusKey) {
        const [[row]] = await connection.query(
            `SELECT id FROM bandi_transfer_statuses WHERE status_key = ?`,
            [filters.statusKey]
        );

        if (!row) return [];

        statusId = row.id;
        apply(`status_id = ?`, statusId);
    }



    // ------------------
    // Office visibility rules
    // ------------------
    const isSuperOffice = [1, 2].includes(user.office_id);

    if (!isSuperOffice) {
        if (statusId && statusId <= 16) {
            apply(`final_to_office_id = ?`, user.office_id);
        } else {
            apply(`current_office_id = ?`, user.office_id);
        }
    }

    // ------------------
    // Query
    // ------------------
    const sql = `
        SELECT *
        FROM view_full_bandi_transfer
        ${where}
        ORDER BY transfer_id DESC
    `;

    const [rows] = await connection.query(sql, params);
    return rows;
};

export {
    insertTransferDetails,
    insertFinalTransferDetails,

    getAllowedStatusesForRole,
    buildUpdateData
};