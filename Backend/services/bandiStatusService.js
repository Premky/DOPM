import pool from "../utils/db3.js";
export async function updateBandiStatus(
  connection, {
  bandiId,
  newStatusId,
  historyCode,
  source = "SYSTEM",
  remarks,
  decisionDate,
  userId,
}) {
  await connection.query(
    `UPDATE bandi_person
     SET bandi_status = ?, status_updated_at =?, status_updated_by = ?
     WHERE id = ?`,
    [newStatusId, new Date(), userId, bandiId]
  );

  await connection.query(
    `INSERT INTO bandi_status_history
     (bandi_id, status_code, source_table, remarks, decision_date, created_by)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [bandiId, historyCode, source, remarks, decisionDate, userId]
  );
}