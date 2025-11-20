import express from "express";
import pool from "../utils/db3.js";
import { logAudit } from "../services/auditService.js";
import verifyToken from '../middlewares/verifyToken.js';
import { param } from "express-validator";

const router = express.Router();

router.post("/restore/:auditId", verifyToken, async (req,res)=>{
    try{
        const auditId = req.params.auditId;
        const userId = req.user.username;

        //Fetch audit entry
        const [rows] = await pool.query(
            `SELECT * FROM audit_logs WHERE id=?`,[auditId]
        );

        if(!rows.length){
            return res.status(404).json({message:"Audit record not found"});
        }

        const log=rows[0];
        const table=log.table_name;
        const recordId=log.record_id;

        if(!log.old_data){
            return res.status(400).json({
                message:"No old data available for restore"
            });
        }

        const oldData=JSON.parse(log.old_data);
        
        //Restore SQL 
        const columns = Object.keys(oldData)
        .map(col=>`${col}=?`)
        .join(",");

        const values = Object.values(oldData);

        await pool.query(`UPDATE ${table} SET ${columns} WHERE id=?`,[...values, recordId]);

        //audit log restore
        await logAudit({
            tableName:table,
            recordId,
            action:"restore",
            oldData:null,
            newData:oldData,
            userId
        });

        res.json({status:true, message: "Record Restored Successfully" });
    }catch(err){
        console.error("Restore error:", err);
        res.status(500).json({message:"Restore Failed", error:err});
    }
})

router.get("/logs", verifyToken, async(req, res)=>{
    const {table, recordId, action} = req.query;

    let sql = `SELECT * FROM audit_logs WHERE 1=1`;
    const params=[];

    if(table){
        sql+=` AND table_name=?`;
        params.push(table);
    }

    if(recordId){
        sql+=` AND record_id=?`;
        params.push(recordId);
    }

    if(action){
        sql+=` AND action=?`;
        params.push(action);
    }

    sql+=" ORDER BY changed_at DESC LIMIT 200";
    const [rows] = await pool.query(sql, params);
    res.json(rows);
})

router.get("/log/:id", verifyToken, async(req,res)=>{
    const auditId = req.params.id;
    const [rows] = await pool.query(
        `SELECT * FROM audit_logs WHERE id=?`,
        [auditId]
    );
    if(!rows.length){
        return res.status(404).json({message:"Audit log not found"});
    }
    res.json(rows[0]);
});
export { router as auditRouter };