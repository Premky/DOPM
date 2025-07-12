import pool from '../utils/db3.js';

async function insertTransferDetails( bandi_id, transfer_details = [], InitialStatus, user_id, active_office, connection ) {
    // console.log(transfer_details)
    const values = transfer_details.map( item => [
        bandi_id,
        item.transfer_reason_id,
        item.transfer_reason,
        item.recommended_to_office_id,
        item.is_thunuwa_permission,
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
                is_thunuwa_permission, status_id,
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

export {
    insertTransferDetails
};