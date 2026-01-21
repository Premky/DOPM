import pool from "../utils/db3.js";

export const getBandiChunk = async (whereClause, params, limit, offset) => {
  const [rows] = await pool.query(
    `
    SELECT *
    FROM view_bandi_full
    ${whereClause}
    ORDER BY bandi_id DESC
    LIMIT ? OFFSET ?
    `,
    [...params, limit, offset]
  );

  return rows;
};
