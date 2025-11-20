import pool from "../utils/db3.js";
import { logAudit } from "../services/auditService.js";

export function audit( tableName, keyField = "id" ) {
    return async ( req, res, next ) => {
        try {
            const recordId = req.params[keyField] || req.body[keyField];
            if ( !recordId ) return next();

            //Get old record
            const [rows] = await pool.query( `
                    SELECT * FROM ${ tableName } WHERE ${ keyField }=?
                    `, [recordId] );
            req.oldRecord=rows.length?rows[0]:null;
            req._auditTable=tableName;
            req._auditKey=recordId;

            next();
        }catch(err){
            next(err);
        }   
    };
}