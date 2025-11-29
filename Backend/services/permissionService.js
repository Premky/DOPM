import pool from "../utils/db3.js";

export const getModules = async ( data, active_user ) => {
    const sql = `SELECT * FROM table_labels`;
    const [result] = await pool.query( sql );
    return { result };
};

export const getPermissions = async(data, active_user) =>{
    const sql =`SELECT * FROM permissions`;
    const [result] = await pool.query(sql);
    return {result}
}