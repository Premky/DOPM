import pool from "../utils/db3.js";

export async function logAudit({
    tableName,
    recordId,
    action,
    oldData=null,
    newData=null,
    userId
}) {
    const sql = `
                    INSERT INTO audit_logs(table_name, record_id, action, old_data, new_data, changed_by)
                    VALUES(?, ?, ?, ?, ?, ?)
                `;
    const params=[
        tableName,
        recordId,
        action,
        oldData ? JSON.stringify(oldData):null,
        newData ? JSON.stringify(newData):null,
        userId
    ];
    await pool.query(sql,params);
}