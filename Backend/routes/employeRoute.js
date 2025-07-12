import express from 'express';
import { promisify } from 'util';
import pool from '../utils/db3.js';
import verifyToken from '../middlewares/verifyToken.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { insertEmpRoute } from '../services/empService.js';

const router = express.Router();
const query = promisify(pool.query).bind(pool);

// Cloudinary Configuration
// cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET
// });

const storage = multer.diskStorage( {
    destination: function ( req, file, cb ) {
        const uploadDir = './uploads/emp_photos';
        // console.log(uploadDir)
        if ( !fs.existsSync( uploadDir ) ) {
            fs.mkdirSync( uploadDir, { recursive: true } );
        }
        cb( null, uploadDir );
    },

    filename: function ( req, file, cb ) {
        const { sanket_no, name_in_english } = req.body;
        if ( !sanket_no || !name_in_english ) {
            return cb( new Error( 'sanket_no and name_in_english are required' ), null );
        }
        const ext = path.extname( file.originalname );
        const dateStr = new Date().toISOString().split( 'T' )[0];
        const safeName = name_in_english.replace( /\s+/g, '_' ); //sanitize spaces

        const uniqueName = `${ sanket_no }_${ safeName }_${ dateStr }${ ext }`;
        cb( null, uniqueName );
    }
} );

// File filter (only images allowed)
const fileFilter = ( req, file, cb ) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|jfif/;
    const extname = allowedTypes.test( path.extname( file.originalname ).toLowerCase() );
    const mimetype = allowedTypes.test( file.mimetype );

    if ( extname && mimetype ) return cb( null, true );
    cb( new Error( 'Only image files are allowed!' ) );
};

//Size limit (1 MB max For now)
const upload = multer( {
    storage,
    fileFilter,
    limits: { fileSize: 1 * 1024 * 1024 },
} );

router.post('/create_employee', verifyToken, upload.single('photo'), async(req, res)=>{
    const user_id = req.user.id;
    const active_office = req.user.office_id;
    const photo_path = req.file?`/uploads/emp_photo/${req.file.filename}`:null;
    const data = req.body;
    let connection;
    try{
        connection=await pool.getConnection();        
        console.log( '🟢 Transaction started for', req.user.ofice_np );
        const emp_id = await insertEmpRoute( { ...req.body, user_id, active_office, photo_path }, connection );
        // await insertKaidDetails( emp_id, { ...req.body, user_id, active_office }, connection );
    }catch(error){
        await connection.rollback();
        console.log(error)
    }finally{
        if(connection) await connection.release();
    }
} )

router.get("/get_employees", verifyToken, async (req, res) => {
    const active_office = req.user.office_id;

  const sql = `SELECT * FROM employees WHERE current_office_id=?`;

  try {
    const [result] = await pool.query(sql, active_office);
    res.json({ Status: true, Result: result, message: 'Records fetched successfully.' });
  } catch (err) {
    console.error("Database Query Error:", err);
    res.status(500).json({ Status: false, Error: "Internal Server Error" });
  }
});

//Get Darbandi:
router.get("/get_darbandi", verifyToken, async(req, res)=>{
    const sql = `SELECT d.no_of_darbandi AS darbandi, p.name_in_nepali AS post_np, 
                c.name_in_nepali AS class_np, o.office_name_nep AS office_np
            FROM 
            darbandies d
            LEFT JOIN posts p ON d.post_id = p.id
            LEFT JOIN classes c ON d.class_id = c.id
            LEFT JOIN offices o ON d.office_id = o.id       
            `;
    try {
        const result = await query(sql);
        return res.json({ Status: true, Result: result, message:'Records fetched successfully.' })
    } catch (err) {
        console.error("Database Query Error:", err);
        res.status(500).json({ Status: false, Error: "Internal Server Error" })
    }
})

router.get("/get_posts", verifyToken, async (req, res) => {
  const sql = `SELECT * FROM emp_post`;

  try {
    const [result] = await pool.query(sql);
    res.json({ Status: true, Result: result, message: 'Records fetched successfully.' });
  } catch (err) {
    console.error("Database Query Error:", err);
    res.status(500).json({ Status: false, Error: "Internal Server Error" });
  }
});






export { router as employeRouter };
