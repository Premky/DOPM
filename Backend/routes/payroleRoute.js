import express from 'express';
import con from '../utils/db.js';
import pool from '../utils/db3.js';
import { promisify } from 'util';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import NepaliDate from 'nepali-datetime';
import dateConverter from 'nepali-datetime/dateConverter';

import { calculateBSDate } from '../utils/dateCalculator.js';
import verifyToken from '../middlewares/verifyToken.js';


const router = express.Router();
// const query = promisify(con.query).bind(con);
const __filename = fileURLToPath( import.meta.url );
const __dirname = path.dirname( __filename );



import NepaliDateConverter from 'nepali-date-converter';
const current_date = new NepaliDate().format( 'YYYY-MM-DD' );
const fy = new NepaliDate().format( 'YYYY' ); //Support for filter
const fy_date = fy + '-04-01';

import { bs2ad } from '../utils/bs2ad.js';
// console.log(current_date);
// console.log(fy_date)

//गाडीका विवरणहरुः नाम सुची
// Promisify specific methods
const queryAsync = promisify( con.query ).bind( con );
const beginTransactionAsync = promisify( con.beginTransaction ).bind( con );
const commitAsync = promisify( con.commit ).bind( con );
const rollbackAsync = promisify( con.rollback ).bind( con );
const query = promisify( con.query ).bind( con );

// Convert BS to AD
// const adDate = bs.toGregorian('2081-03-01'); // Output: { year: 2024, month: 6, day: 14 }

// English to Nepali date conversion
const [npYear, npMonth, npDay] = dateConverter.englishToNepali( 2023, 5, 27 );



async function calculateAge( birthDateBS ) {
    // Convert BS to AD
    const nepaliDate = new NepaliDate( birthDateBS );
    const adDate = nepaliDate.getDateObject(); // Converts to JavaScript Date

    // Get current date
    const currentDate = new Date();

    // Calculate age
    let age = currentDate.getFullYear() - adDate.getFullYear();
    const m = currentDate.getMonth() - adDate.getMonth();

    // Adjust age if birthday hasn't occurred yet this year
    if ( m < 0 || ( m === 0 && currentDate.getDate() < adDate.getDate() ) ) {
        age--;
    }

    return age;
}

async function generateUniqueBandiId() {
    const maxAttempts = 10;

    for ( let i = 0; i < maxAttempts; i++ ) {
        const randId = Math.floor( 100000 + Math.random() * 900000 ); // 6-digit random number
        const [result] = await pool.query(
            `SELECT office_bandi_id FROM bandi_person WHERE office_bandi_id = ?`,
            [randId]
        );

        if ( result.length === 0 ) {
            return randId; // Unique ID
        }
    }

    throw new Error( "Unable to generate a unique bandi ID after multiple attempts." );
}

router.get( '/get_random_bandi_id', async ( req, res ) => {
    const rand_bandi_id = await generateUniqueBandiId();
    console.log( rand_bandi_id );
    return res.json( { Status: true, Result: rand_bandi_id } );
} );

//Define storage configuration
const storage = multer.diskStorage( {
    destination: function ( req, file, cb ) {
        const uploadDir = './uploads/bandi_photos';
        if ( !fs.existsSync( uploadDir ) ) {
            fs.mkdirSync( uploadDir, { recursive: true } );
        }
        cb( null, uploadDir );
    },
    filename: function ( req, file, cb ) {
        const { office_bandi_id, bandi_name } = req.body;

        if ( !office_bandi_id || !bandi_name ) {
            return cb( new Error( 'bandi_id and bandi_name are required' ), null );
        }

        const ext = path.extname( file.originalname );
        const dateStr = new Date().toISOString().split( 'T' )[0];
        const safeName = bandi_name.replace( /\s+/g, '_' ); //sanitize spaces

        const uniqueName = `${ office_bandi_id }_${ safeName }_${ dateStr }${ ext }`;
        cb( null, uniqueName );
    }
} );

// File filter (only images allowed)
const fileFilter = ( req, file, cb ) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
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

router.get( '/get_payroles', verifyToken, async ( req, res ) => {
    const active_office = req.user.office_id;
    const searchOffice = req.query.searchOffice || 0;
    const nationality = req.query.nationality || 0;
    const searchpayroleStatus = req.query.searchpayroleStatus || 0;
    const searchpyarole_rakhan_upayukat = req.query.searchpyarole_rakhan_upayukat || 0;
    const searchpayrole_no_id = req.query.searchpayrole_no_id || 0;
    const searchmudda_id = req.query.searchmudda_id || 0;
    const searchbandi_name = req.query.searchbandi_name || 0;
    const searchchecked = req.query.searchchecked || 0;
    const searchis_checked = req.query.searchis_checked || 0;

    const page = parseInt( req.query.page ) || 0;
    const limit = parseInt( req.query.limit ) || 25;
    const offset = page * limit;

    let baseWhere = `WHERE p.status>=1 `;
    if ( searchOffice ) {
        baseWhere += `AND bp.current_office_id = ${ searchOffice } `;
    } else if ( active_office == 1 || active_office == 2 ) {
        baseWhere += ` AND bp.current_office_id='' `;
    } else {
        baseWhere += `AND bp.current_office_id = ${ active_office } `;
    }

    if ( searchpayroleStatus ) {
        const status = Number( searchpayroleStatus );
        if ( status !== 3 ) {
            baseWhere += ` AND p.status = ${ status } `;
        } else if ( active_office === 1 || active_office === 2 ) {
            baseWhere += ` AND p.status = 3 `;
        } else {
            baseWhere += ` AND p.status != 3 `;
        }
    } else {
        if ( active_office !== 1 && active_office !== 2 ) {
            baseWhere += ` AND p.status != 3 `;
        }
    }

    if ( searchpyarole_rakhan_upayukat ) {
        baseWhere += `AND pr.pyarole_rakhan_upayukat= '${ searchpyarole_rakhan_upayukat }' `;
    }

    if ( nationality ) {
        // console.log(nationality)
        if ( baseWhere ) {
            baseWhere += ` AND bp.nationality = '${ nationality }'`;  // Note quotes for string
        } else {
            baseWhere += `AND bp.nationality = '${ nationality }'`;
        }
    }

    try {
        // STEP 1: Get paginated bandi IDs
        const idQuery = `SELECT bp.id FROM bandi_person bp 
        LEFT JOIN payroles p ON bp.id=p.bandi_id 
        LEFT JOIN payrole_reviews pr ON p.id=pr.payrole_id
        ${ baseWhere } ORDER BY bp.id DESC LIMIT ? OFFSET ?`;

        const [idRows] = await pool.query( idQuery, [limit, offset] );

        const bandiIds = idRows.map( row => row.id );
        // console.log('bandi_id:', bandiIds)
        if ( bandiIds.length === 0 ) {
            return res.json( { Status: true, Result: [], TotalCount: 0 } );
        }

        // STEP 2: Get total count
        const countSQL = `SELECT COUNT(*) AS total FROM bandi_person bp 
            LEFT JOIN payroles p ON bp.id=p.bandi_id 
            LEFT JOIN payrole_reviews pr ON p.id=pr.payrole_id
            ${ baseWhere }`;
        const [countResult] = await pool.query( countSQL );
        const totalCount = countResult[0].total;

        // STEP 3: Get full records for selected bandis
        const placeholders = bandiIds.map( () => '?' ).join( ',' );
        const fullQuery = `
            SELECT 
                bp.id AS bandi_id,
                bp.*,
                TIMESTAMPDIFF(YEAR, bp.dob_ad, CURDATE()) AS current_age,
                ba.wardno,
                ba.bidesh_nagarik_address_details,
                nc.country_name_np,
                ns.state_name_np,
                nd.district_name_np,
                nci.city_name_np,
                bmd_combined.mudda_id,
                bmd_combined.mudda_name,
                bmd_combined.is_main_mudda,
                bmd_combined.is_last_mudda,
                bmd_combined.office_name_with_letter_address,
                bmd_combined.vadi,
                bmd_combined.mudda_phesala_antim_office_date,
                bkd.hirasat_years, bkd.hirasat_months, bkd.hirasat_days,
                bkd.thuna_date_bs, bkd.release_date_bs,
                p.id AS payrole_id,
                p.status,
                p.status AS payrole_status,
                pr.id AS pr_id,
                pr.is_checked,
                pr.pyarole_rakhan_upayukat,
                pr.dopmremark,
                pm.mudda_name

            FROM bandi_person bp
            LEFT JOIN bandi_address ba ON bp.id = ba.bandi_id
            LEFT JOIN np_country nc ON ba.nationality_id = nc.id
            LEFT JOIN np_state ns ON ba.province_id = ns.state_id
            LEFT JOIN np_district nd ON ba.district_id = nd.did
            LEFT JOIN np_city nci ON ba.gapa_napa_id = nci.cid
            LEFT JOIN bandi_kaid_details bkd ON bp.id = bkd.bandi_id
            LEFT JOIN payroles p ON bp.id = p.bandi_id
            LEFT JOIN payrole_reviews pr ON p.id=pr.payrole_id
            LEFT JOIN muddas pm ON p.payrole_mudda_id=pm.id
            LEFT JOIN (
                SELECT 
                    bmd.bandi_id,
                    bmd.mudda_id,
                    bmd.is_main_mudda,
                    bmd.is_last_mudda,
                    m.mudda_name,
                    bmd.vadi,
                    bmd.mudda_phesala_antim_office_date,
                    o.office_name_with_letter_address
                FROM bandi_mudda_details bmd
                LEFT JOIN muddas m ON bmd.mudda_id = m.id
                LEFT JOIN offices o ON bmd.mudda_phesala_antim_office_name = o.id
            ) AS bmd_combined ON bp.id = bmd_combined.bandi_id
            WHERE bp.id IN (${ placeholders })
            ORDER BY bp.id DESC
        `;

        // console.log( fullQuery );

        const [fullRows] = await pool.query( fullQuery, bandiIds );
        // console.log( fullRows );
        // STEP 4: Group muddas under each bandi
        const grouped = {};
        fullRows.forEach( row => {
            const {
                bandi_id,
                mudda_id,
                mudda_name,
                is_main_mudda,
                is_last_mudda,
                office_name_with_letter_address,
                vadi,
                mudda_phesala_antim_office_date,
                ...bandiData
            } = row;

            if ( !grouped[bandi_id] ) {
                grouped[bandi_id] = {
                    ...bandiData,
                    bandi_id,
                    muddas: []
                };
            }

            if ( mudda_id ) {
                grouped[bandi_id].muddas.push( {
                    mudda_id,
                    mudda_name,
                    is_main_mudda,
                    is_last_mudda,
                    office_name_with_letter_address,
                    vadi,
                    mudda_phesala_antim_office_date
                } );
            }
        } );

        // console.log(Object.values(grouped))

        return res.json( {
            Status: true,
            Result: Object.values( grouped ),
            TotalCount: totalCount
        } );
    } catch ( err ) {
        console.error( 'Query Error:', err );
        return res.json( { Status: false, Error: 'Query Error' } );
    }
} );

router.get( '/get_bandi_for_payrole', verifyToken, async ( req, res ) => {
    const active_office = req.user.office_id;
    const active_user = req.user.id;
    const office_id = req.query.office_id; // extract if passed manually
    const filters = [];
    const params = [];
    
    // Apply filters based on office
    if ( active_office !== 1 && active_office !== 2 ) {
        filters.push( '1=1' );
        // params.push( active_office );
    } else if ( office_id ) {
        filters.push( 'o.id = ?' );
        params.push( office_id );
    }

    // Filter only कैदी type
    filters.push( 'bp.bandi_type = ?' );
    params.push( 'कैदी' );
    filters.push('(bfd.amount_fixed IS NULL OR (bfd.amount_fixed = 0 OR bfd.amount_deposited>0))'); // Ensure no fines or only paid fines

    const whereClause = filters.length > 0 ? `WHERE ${ filters.join( ' AND ' ) }` : '';
        const sql = `
        SELECT 
        bp.id, bp.office_bandi_id, bp.bandi_name, bp.bandi_type, 
        bkd.hirasat_years, bkd.hirasat_months, bkd.hirasat_days,
        bkd.release_date_bs, bkd.release_date_ad, 
        bkd.thuna_date_bs, bkd.thuna_date_ad 
        FROM bandi_person bp
        LEFT JOIN bandi_kaid_details bkd ON bkd.bandi_id = bp.id
        LEFT JOIN bandi_fine_details bfd ON bfd.bandi_id = bp.id        
        LEFT JOIN offices o ON o.id = bp.current_office_id
        ${ whereClause }
        GROUP BY bp.id
        ORDER BY bp.id DESC
    `;

    try {
        const [result] = await pool.query( sql, params );
        res.json( { Status: true, Result: result } );
    } catch ( err ) {
        console.error( "Database Query Error:", err );
        res.status( 500 ).json( { Status: false, Error: "Internal Server Error" } );
    }
} );


router.get( '/get_bandi_name_for_select', verifyToken, async ( req, res ) => {
    const active_office = req.user.office_id;
    // console.log(active_office)
    // const user_id = req.user.id;
    let sql = '';
    if ( active_office <= 2 ) {
        sql = `SELECT bp.*, bp.id AS bandi_id, bp.id AS bandi_office_id,
                        m.mudda_name, 
                        p.id AS payrole_id 
                    FROM bandi_person bp
                        LEFT JOIN bandi_mudda_details bmd ON bp.id=bmd.bandi_id 
                        LEFT JOIN muddas m ON bmd.mudda_id=m.id  
                        LEFT JOIN payroles p ON bp.id=p.bandi_id
                     WHERE bmd.is_main_mudda=1`;
    } else {
        sql = `SELECT bp.*, bp.id AS bandi_id, bp.id AS bandi_office_id,
                        p.id AS payrole_id, 
                        m.mudda_name 
                    FROM bandi_person bp
                        LEFT JOIN bandi_mudda_details bmd ON bp.id=bmd.bandi_id
                        LEFT JOIN muddas m ON bmd.mudda_id=m.id
                        JOIN payroles p ON bp.id=bandi_id
                    WHERE bmd.is_main_mudda=1 WHERE bp.current_office_id=${ active_office }`;
    }
    try {
        const [result] = await pool.query( sql ); // Use promise-wrapped query

        if ( result.length === 0 ) {
            return res.json( { Status: false, Error: "Bandi not found for select" } );
        }
        const bandi = result[0];
        // 🟢 Calculate age from BS DOB
        const age = await calculateAge( bandi.dob ); // Assuming dob is BS like '2080-01-10'
        bandi.age = age;
        // console.log(age)
        return res.json( { Status: true, Result: result } );
    } catch ( err ) {
        console.error( err );
        return res.json( { Status: false, Error: "Query Error" } );
    }
} );

router.get( '/get_bandi_name_for_select/:id', async ( req, res ) => {
    const { id } = req.params;
    const sql = `SELECT bp.*,bp.id AS bandi_id, bp.id AS bandi_office_id, m.mudda_name from bandi_person bp
                LEFT JOIN bandi_mudda_details bmd ON bp.id=bmd.bandi_id
                LEFT JOIN muddas m ON bmd.mudda_id=m.id
                WHERE bmd.is_main_mudda=1 AND bp.current_office_id=?`;
    try {
        const [result] = await pool.query( sql, [id] ); // Use promise-wrapped query
        // console.log('id', result)

        if ( result.length === 0 ) {
            return res.json( { Status: false, Error: "Bandi not found for select" } );
        }
        return res.json( { Status: true, Result: result } );
    } catch ( err ) {
        console.error( err );
        return res.json( { Status: false, Error: "Query Error" } );
    }
} );

router.get( '/get_selected_bandi/:id', async ( req, res ) => {
    const { id } = req.params;
    const sql = `
        SELECT b.*, bm.*, m.mudda_name 
        FROM bandies b
        LEFT JOIN bandi_mudda bm ON b.id = bm.bandi_id 
        LEFT JOIN muddas m ON bm.mudda_id = m.id
        WHERE b.id = ? AND bm.is_main = 1
    `;

    try {
        const [result] = await pool.query( sql, [id] ); // Use promise-wrapped query

        if ( result.length === 0 ) {
            return res.json( { Status: false, Error: "Bandi not found" } );
        }
        const bandi = result[0];
        // 🟢 Calculate age from BS DOB
        const age = await calculateAge( bandi.dob ); // Assuming dob is BS like '2080-01-10'
        bandi.age = age;
        // console.log(age)
        return res.json( { Status: true, Result: bandi } );
    } catch ( err ) {
        console.error( err );
        return res.json( { Status: false, Error: "Query Error" } );
    }
} );

router.post( '/create_payrole', verifyToken, async ( req, res ) => {
    const active_office = req.user.office_id;
    const user_id = req.user.id;
    const {
        bandi_id, payrole_no, mudda_id, payrole_count_date, payrole_entry_date, other_details,
        payrole_reason, payrole_remarks, payrole_niranay_no, payrole_decision_date,
        payrole_granted_letter_no, payrole_granted_letter_date, pyarole_rakhan_upayukat,
        dopmremark
    } = req.body;

    console.log( 'bandi_id', bandi_id );
    let payrole_no_bandi_id = '';
    if ( bandi_id && payrole_no ) {
        let payrole_no_bandi = String( payrole_no ) + String( bandi_id );
        payrole_no_bandi_id = payrole_no_bandi;
    }
    let connection;
    try {
        connection = await pool.getConnection();
        // await beginTransactionAsync();
        await connection.beginTransaction();
        let sql = '';
        let values = [];

        if ( payrole_niranay_no ) {
            // FIX or remove this block if irrelevant
            // Assuming you want to insert into another table
            // values = [bandi_id, relation_id, no_of_children]; // define those variables properly
            // sql = `INSERT INTO bandi_relative_info(bandi_id, relation_id, no_of_children) VALUES(?, ?, ?)`;
            // await queryAsync(sql, values);
        } else {
            values = [
                payrole_no_bandi_id,
                // mudda_id,
                // payrole_count_date,
                payrole_entry_date,
                payrole_reason,
                other_details,
                payrole_remarks,
                1, // status
                payrole_no,
                bandi_id,
                user_id,
                user_id,
                active_office,
                active_office
            ];
            // payrole_mudda_id ganana_date,
            sql = `
                INSERT INTO payroles(
                payrole_no_bandi_id,  payrole_entery_date, payrole_reason,
                other_details, remark, status, payrole_no_id, bandi_id, user_id, created_by, created_office, updated_office
            ) VALUES(?, ?,  ?, ?, ?, ?, ?, ?, ?, ?,?,?)
                `;

            const [result] = await pool.query( sql, values );
            const inserted_id = result.insertId;
            console.log( inserted_id );
            // await commitAsync();
            await connection.commit();

            return res.json( {
                // Result: inserted_id,
                Status: true,
                message: "बन्दी विवरण सफलतापूर्वक सुरक्षित गरियो।"
            } );
        }

    } catch ( error ) {
        // await rollbackAsync();
        await connection.rollback();
        console.error( "Transaction failed:", error );
        return res.status( 500 ).json( {
            Status: false,
            Error: error.message,
            message: "सर्भर त्रुटि भयो, सबै डाटा पूर्वस्थितिमा फर्काइयो।"
        } );
    } finally {
        if(connection) connection.release();
    }
} );



router.get( '/get_accepted_payroles', verifyToken, async ( req, res ) => {
    const user_office_id = req.user.office_id;
    const user_id = req.user.id;

    try {
        const baseQuery = `
      SELECT 
        p.*, 
        bp.bandi_name, 
        bp.id AS bandi_id,
        m.mudda_name
      FROM payroles p
      LEFT JOIN bandi_person bp ON p.bandi_id = bp.id
      LEFT JOIN muddas m ON p.payrole_mudda_id = m.id
      WHERE p.status = 5
    `;

        let finalQuery = baseQuery;
        let queryParams = [];

        // Restrict results for lower-level offices (office_id >= 2)
        if ( user_office_id > 2 ) {
            finalQuery += ` AND (p.created_office = '?' OR p.updated_office = '?')`;
            queryParams = [user_office_id, user_office_id];
        }

        // console.log(finalQuery)

        const [result] = await pool.query( finalQuery, queryParams );
        console.log( 'acceptedpayrole', user_office_id );
        if ( !result.length ) {
            return res.json( { Status: false, Error: 'No payrole records found' } );
        }

        return res.json( { Status: true, Result: result } );
    } catch ( err ) {
        console.error( 'Error fetching accepted payroles:', err );
        return res.status( 500 ).json( { Status: false, Error: 'Internal server error' } );
    }
} );

router.put( '/update_payrole/:id', verifyToken, async ( req, res ) => {
    const user_office_id = req.user.office_id;
    const user_id = req.user.id;
    const {
        dopmremark,
        pyarole_rakhan_upayukat,
        payrole_id,
        is_checked,
        payrole_niranay_no,
        payrole_decision_date,
        payrole_granted_letter_no,
        payrole_granted_letter_date,
        result,
        arre,
        thuna_date_bs,

        // Missing ones:
        mudda_id,
        arrest_date,
        release_date,
        payrole_nos,
        payrole_granted_court,
        payrole_granted_aadesh_date,
        payrole_result,
        payrole_decision_remark,
        kaid_bhuktan_duration,
        kaid_bhuktan_percentage,
        baki_kaid_duration,
        baki_kaid_percent,
    } = req.body;




    try {
        let sql = '';
        let values = [];

        const existingReviews = await query( `SELECT * FROM payrole_reviews WHERE payrole_id = ?`, [payrole_id] );

        if ( ( user_office_id === 1 || user_office_id === 2 ) ) {
            if ( pyarole_rakhan_upayukat ) {
                if ( existingReviews.length > 0 ) {
                    sql = `
                UPDATE payrole_reviews 
                SET pyarole_rakhan_upayukat = ?, dopmremark = ?, reviewed_by = ?, reviewed_office_id = ?
                WHERE payrole_id = ?`;
                    values = [pyarole_rakhan_upayukat, dopmremark, user_id, user_office_id, payrole_id];
                } else {
                    sql = `
                INSERT INTO payrole_reviews (payrole_id, pyarole_rakhan_upayukat, dopmremark, reviewed_by, reviewed_office_id)
                VALUES (?, ?, ?, ?, ?)`;
                    values = [payrole_id, pyarole_rakhan_upayukat, dopmremark, user_id, user_office_id];
                }
            } else if ( is_checked ) {
                if ( existingReviews.length > 0 ) {
                    sql = `
                UPDATE payrole_reviews SET is_checked = ? WHERE payrole_id = ?`;
                    values = [is_checked, payrole_id];
                } else {
                    sql = `
                INSERT INTO payrole_reviews (payrole_id, is_checked, reviewed_by, reviewed_office_id)
                VALUES (?, ?, ?, ?)`;
                    values = [payrole_id, is_checked, user_id, user_office_id];
                }
            }
        } else {
            if ( payrole_decision_date || payrole_granted_letter_no ) {
                if ( existingReviews.length > 0 ) {
                    console.log( 'updated' );
                    sql = `
                UPDATE payrole_decisions 
                SET payrole_niranay_no = ?, payrole_decision_date = ?, payrole_granted_letter_no = ?, payrole_granted_letter_date = ?, result=?
                WHERE payrole_id = ?`;
                    values = [payrole_niranay_no, payrole_decision_date, payrole_granted_letter_no, payrole_granted_letter_date, result, payrole_id];
                } else {
                    console.log( 'inserted' );
                    sql = `
                INSERT INTO payrole_decisions (payrole_id, mudda_id, arrest_date, release_date, payrole_nos, 
                payrole_decision_date, payrole_granted_court, payrole_granted_aadesh_date, 
                payrole_granted_letter_no, payrole_granted_letter_date, payrole_result, payrole_decision_remark,
                kaid_bhuktan_duration, kaid_bhuktan_percentage, baki_kaid_duration, baki_kaid_percent, 
                decision_updated_by, decision_updated_office)
                VALUES (?, ?, ?, ?, ?, ?)`;
                    values = [payrole_id, mudda_id, arrest_date, release_date, payrole_nos,
                        payrole_decision_date, payrole_granted_court, payrole_granted_aadesh_date,
                        payrole_granted_letter_no, payrole_granted_letter_date, payrole_result, payrole_decision_remark,
                        kaid_bhuktan_duration, kaid_bhuktan_percentage, baki_kaid_duration, baki_kaid_percent,
                        user_id, user_office_id];
                }
            }
        }


        const queryResult = await query( sql, values );
        return res.json( { Status: true, Result: queryResult } );

    } catch ( err ) {
        console.error( 'Database error', err );
        return res.status( 500 ).json( { Status: false, Error: 'Internal Server Error' } );
    }
} );

router.put( "/update_payrole_decision/:id", verifyToken, async ( req, res ) => {
    const user_office_id = req.user.office_id;
    const user_id = req.user.id;

    const {
        mudda_id,
        // arrest_date,
        thuna_date_bs,
        release_date_bs,
        payrole_id,
        dopmremark,
        hajir_current_date_bs,
        hajir_next_date_bs,
        hajir_office,
        payrole_decision_date,
        payrole_decision_remark,
        payrole_granted_aadesh_date,
        payrole_granted_court,
        payrole_granted_letter_date,
        payrole_granted_letter_no,
        payrole_nos,
        payrole_result,
        pyarole_rakhan_upayukat,
    } = req.body;

    let arrest_date = '0000-00-00';
    if ( !arrest_date || !thuna_date_bs ) {
        arrest_date = '0000-00-00';
    }

    const total_kaid = calculateBSDate( arrest_date, release_date_bs );

    const bhuktan_duration = calculateBSDate( arrest_date, current_date, total_kaid );
    const kaid_bhuktan_duration = bhuktan_duration.formattedDuration || 0;
    const kaid_bhuktan_percentage = bhuktan_duration.percentage || 0;
    const baki_duration = calculateBSDate( current_date, release_date_bs, total_kaid );
    const baki_kaid_duration = baki_duration.formattedDuration || 0;
    const baki_kaid_percent = baki_duration.percentage || 0;

    try {
        await beginTransactionAsync();

        const [existing] = await pool.query(
            `SELECT * FROM payrole_decisions WHERE payrole_id = ?`,
            [payrole_id]
        );

        if ( existing.length > 0 ) {
            const sql = `
        UPDATE payrole_decisions
        SET
          mudda_id = ?,
          arrest_date = ?,
          release_date = ?,
          payrole_nos = ?,
          payrole_decision_date = ?,
          payrole_granted_court = ?,
          payrole_granted_aadesh_date = ?,
          payrole_granted_letter_no = ?,
          payrole_granted_letter_date = ?,
          payrole_result = ?,
          payrole_decision_remark = ?,
          kaid_bhuktan_duration = ?,
          kaid_bhuktan_percentage = ?,
          baki_kaid_duration = ?,
          baki_kaid_percent = ?,
          decision_updated_by = ?,
          decision_updated_office = ?
        WHERE payrole_id = ?
      `;

            const values = [
                mudda_id,
                arrest_date,
                release_date_bs,
                payrole_nos,
                payrole_decision_date,
                payrole_granted_court,
                payrole_granted_aadesh_date,
                payrole_granted_letter_no,
                payrole_granted_letter_date,
                payrole_result,
                payrole_decision_remark,
                kaid_bhuktan_duration,
                kaid_bhuktan_percentage,
                baki_kaid_duration,
                baki_kaid_percent,
                user_id,
                user_office_id,
                payrole_id,
            ];

            await pool.query( sql, values );
        } else {
            const insertSql = `
        INSERT INTO payrole_decisions (
          payrole_id, mudda_id, arrest_date, release_date, payrole_nos,
          payrole_decision_date, payrole_granted_court, payrole_granted_aadesh_date,
          payrole_granted_letter_no, payrole_granted_letter_date, payrole_result,
          payrole_decision_remark, kaid_bhuktan_duration, kaid_bhuktan_percentage,
          baki_kaid_duration, baki_kaid_percent, decision_updated_by, decision_updated_office
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
            const insertValues = [
                payrole_id,
                mudda_id,
                arrest_date,
                release_date_bs,
                payrole_nos,
                payrole_decision_date,
                payrole_granted_court,
                payrole_granted_aadesh_date,
                payrole_granted_letter_no,
                payrole_granted_letter_date,
                payrole_result,
                payrole_decision_remark,
                kaid_bhuktan_duration,
                kaid_bhuktan_percentage,
                baki_kaid_duration,
                baki_kaid_percent,
                user_id,
                user_office_id,
            ];

            await pool.query( insertSql, insertValues );
        }

        if ( hajir_current_date_bs ) {
            const logSql = `
        INSERT INTO payrole_logs (
          payrole_id, hajir_current_date, hajir_status, hajir_next_date, hajir_office
        ) VALUES (?, ?, ?, ?, ?)
      `;

            const logValues = [
                payrole_id,
                hajir_current_date_bs,
                1,
                hajir_next_date_bs,
                hajir_office,
            ];

            await pool.query( logSql, logValues );
        }

        await pool.query( `UPDATE payroles SET status=? WHERE id=?`, [payrole_result, payrole_id] );

        await commitAsync();
        return res.json( { Status: true, Message: "Updated successfully" } );
    } catch ( error ) {
        await rollbackAsync();
        console.error( "Payrole update error:", error );
        return res.status( 500 ).json( { Status: false, Error: "Internal Server Error" } );
    }
} );


router.put( '/update_is_payrole_checked/:id', verifyToken, async ( req, res ) => {
    const id = req.params.id;
    console.log( 'payrole_id', id );
    const user_office_id = req.user.office_id;
    const user_id = req.user.id;
    const {
        is_checked
    } = req.body;
    // console.log('dopmremark',status)
    console.log( req.body );
    const updated_by = 1;
    const sql = `UPDATE payrole_reviews SET is_checked =? WHERE id =?; `;
    const values = [
        is_checked, id
    ];
    try {
        const result = await query( sql, values );
        // console.log(result)
        return res.json( { Status: true, Result: result } );
    } catch ( err ) {
        console.error( 'Database error', err );
        return res.status( 500 ).json( { Status: false, Error: 'Internal Server Error' } );
    }
} );

router.put( '/update_payrole_status/:id', verifyToken, async ( req, res ) => {
    const id = req.params.id;
    console.log( 'payrole_id', id );
    const user_office_id = req.user.office_id;
    const user_id = req.user.id;
    const { value } = req.body;
    console.log( 'dopmremark', value );
    console.log( req.body );
    const updated_by = 1;
    const sql = `UPDATE payroles SET status = ? WHERE id =?; `;
    const values = [value, id];
    try {
        const result = await query( sql, values );
        // console.log(result)
        return res.json( { Status: true, Result: result } );
    } catch ( err ) {
        console.error( 'Database error', err );
        return res.status( 500 ).json( { Status: false, Error: 'Internal Server Error' } );
    }
} );

router.put( '/update_payrole_logs/:id', verifyToken, async ( req, res ) => {
    const user_office_id = req.user.office_id;
    const user_id = req.user.id;
    const {
        payrol_id,
        hajir_current_date,
        hajir_status,
        hajir_next_date,
        hajir_office,
        no_hajir_reason,
        no_hajir_mudda,
        no_hajir_mudda_district,
        no_hajir_reason_office_type,
        no_hajir_reason_office_id,
        no_hajir_reason_office_name,
        no_hajir_is_pratibedan,
        no_hajir_is_aadesh,
        hajir_remarks
    } = req.body;



    try {
        let sql = '';
        let values = [];

        if ( hajir_status == '2' ) {
            console.log( "अनुपस्थित" );
        }


        const queryResult = await query( sql, values );
        return res.json( { Status: true, Result: queryResult } );

    } catch ( err ) {
        console.error( 'Database error', err );
        return res.status( 500 ).json( { Status: false, Error: 'Internal Server Error' } );
    }
} );

router.post( '/create_payrole_maskebari_count', verifyToken, async ( req, res ) => {
    const active_office = req.user.office_id;
    const active_user = req.user.id;
    try {
        // Add active_user and active_office to the request body
        req.body.created_by = active_user;
        req.body.created_office = active_office;
        const keys = Object.keys( req.body );
        const values = Object.values( req.body );
        const placeholders = keys.map( () => '?' ).join( ', ' );
        const sql = `INSERT INTO payrole_maskebari (${ keys.join( ', ' ) }) VALUES (${ placeholders })`;
        const result = await query( sql, values );
        console.log( result );
        res.status( 201 ).json( { id: result.insertId } );
    } catch ( err ) {
        res.status( 500 ).json( { error: err.message } );
    }
} );

router.post( '/create_payrole_log', verifyToken, async ( req, res ) => {
    const active_office = req.user.office_id;
    const active_user = req.user.id;

    try {
        req.body.created_by = active_user;
        req.body.current_office_id = active_office;

        // ✅ Clean payload: convert '' to null for optional fields
        const cleanedBody = {
            ...req.body,
            no_hajir_reason: req.body.no_hajir_reason || null,
            no_hajir_mudda: req.body.no_hajir_mudda || null,
            no_hajir_mudda_district: req.body.no_hajir_mudda_district || null,
            no_hajir_reason_office_type: req.body.no_hajir_reason_office_type || null,
            no_hajir_reason_office_id: req.body.no_hajir_reason_office_id || null,
            no_hajir_reason_office_name: req.body.no_hajir_reason_office_name || null,
            no_hajir_is_pratibedan: req.body.no_hajir_is_pratibedan || null,
            no_hajir_is_aadesh: req.body.no_hajir_is_aadesh || null,
        };
        delete cleanedBody.office_bandi_id; // 🔴 Remove unknown field
        delete cleanedBody.office_name; // 🔴 Remove unknown field

        const keys = Object.keys( cleanedBody );
        const values = Object.values( cleanedBody );
        const placeholders = keys.map( () => '?' ).join( ', ' );

        const sql = `INSERT INTO payrole_logs (${ keys.join( ', ' ) }) VALUES (${ placeholders })`;
        const result = await query( sql, values );

        res.status( 201 ).json( { Status: true, Result: result.insertId } );
    } catch ( err ) {
        console.error( 'Error creating payrole log:', err );
        res.status( 500 ).json( { Status: false, Error: err.message } );
    }
} );




router.put( '/update_payrole/:id', verifyToken, async ( req, res ) => {
    const { id } = req.params;
    const active_office = req.user.office_id;
    const active_user = req.user.id;

    try {
        req.body.updated_by = active_user;
        req.body.updated_office = active_office;

        const keys = Object.keys( req.body );
        const values = Object.values( req.body );
        const setClause = keys.map( key => `${ key } = ?` ).join( ', ' );

        const sql = `UPDATE payrole_maskebari SET ${ setClause } WHERE id = ?`;
        values.push( id ); // add id to the end for WHERE clause

        const result = await query( sql, values );

        res.status( 200 ).json( { Status: true, Result: result.affectedRows } );
    } catch ( err ) {
        console.error( 'Error updating payrole log:', err );
        res.status( 500 ).json( { Status: false, Error: err.message } );
    }
} );

router.get( '/get_payrole_logs/:id', verifyToken, async ( req, res ) => {
    const user_office_id = req.user.office_id;
    const user_id = req.user.id;
    const id = req.params.id;

    try {
        const baseQuery = `
                WITH ranked_mudda AS (
            SELECT 
                bmd.*, 
                ROW_NUMBER() OVER (
                PARTITION BY bmd.bandi_id 
                ORDER BY 
                    CASE WHEN bmd.is_last_mudda = true THEN 1 ELSE 2 END,
                -- bmd.mudda_date DESC, -- Or another reliable timestamp
                    bmd.id DESC           -- Fallback tie-breaker
                ) AS rn
            FROM bandi_mudda_details bmd
            )
            SELECT 
            pl.payrole_id, pl.hajir_current_date, pl.hajir_status, 
            pl.hajir_next_date, pl.hajir_office, pl.no_hajir_reason, 
            pl.no_hajir_mudda, pl.no_hajir_mudda_district, 
            pl.no_hajir_reason_office_type, pl.no_hajir_reason_office_id, 
            pl.no_hajir_reason_office_name, pl.no_hajir_is_pratibedan, 
            pl.no_hajir_is_aadesh, pl.hajir_remarks,
            bp.bandi_type, bp.bandi_name, 
            m.mudda_name
            FROM payrole_logs pl
            LEFT JOIN bandi_person bp ON pl.bandi_id = bp.id
            LEFT JOIN ranked_mudda bmd ON pl.bandi_id = bmd.bandi_id AND bmd.rn = 1
            LEFT JOIN muddas m ON bmd.mudda_id = m.id
    `;

        let finalQuery = baseQuery;
        let queryParams = [];
        finalQuery += ` WHERE bp.is_active=1`;
        // Restrict results for lower-level offices (office_id >= 2)
        if ( user_office_id > 2 ) {
            finalQuery += ` AND (p.created_office = '?' OR p.updated_office = '?')`;
            queryParams = [user_office_id, user_office_id];
        }

        // if()

        // console.log(finalQuery)

        const [result] = await pool.query( finalQuery, queryParams );
        console.log( 'acceptedpayrole', user_office_id );
        if ( !result.length ) {
            return res.json( { Status: false, Error: 'No payrole records found' } );
        }

        return res.json( { Status: true, Result: result } );
    } catch ( err ) {
        console.error( 'Error fetching accepted payroles:', err );
        return res.status( 500 ).json( { Status: false, Error: 'Internal server error' } );
    }
} );

const getMaskebariQuery = `SELECT 
                        year_bs, 
                        month_bs,
                        MAX(oo.office_name_with_letter_address) AS office_name,
                        MAX(os.office_name_with_letter_address) AS created_office_name,
                        MAX(pm.id) AS id, -- or MIN(id), or NULL if not needed
                        MAX(pm.office_id) AS office_id, -- or NULL
                        SUM(pm.total_decision_count_male) AS total_decision_count_male,
                        SUM(pm.total_decision_count_female) AS total_decision_count_female,
                        SUM(pm.total_decision_count_other) AS total_decision_count_other,
                        SUM(pm.total_decision_count) AS total_decision_count,
                        SUM(pm.total_payrole_count_male) AS total_payrole_count_male,
                        SUM(pm.total_payrole_count_female) AS total_payrole_count_female,
                        SUM(pm.total_payrole_count_other) AS total_payrole_count_other,
                        SUM(pm.total_payrole_count) AS total_payrole_count,
                        SUM(pm.total_no_from_court_count_male) AS total_no_from_court_count_male,
                        SUM(pm.total_no_from_court_count_female) AS total_no_from_court_count_female,
                        SUM(pm.total_no_from_court_count_other) AS total_no_from_court_count_other,
                        SUM(pm.total_no_from_court_count) AS total_no_from_court_count,
                        SUM(pm.total_bhuktan_count_male) AS total_bhuktan_count_male,
                        SUM(pm.total_bhuktan_count_female) AS total_bhuktan_count_female,
                        SUM(pm.total_bhuktan_count_other) AS total_bhuktan_count_other,
                        SUM(pm.total_bhuktan_count) AS total_bhuktan_count,
                        SUM(pm.total_current_payrole_count_male) AS total_current_payrole_count_male,
                        SUM(pm.total_current_payrole_count_female) AS total_current_payrole_count_female,
                        SUM(pm.total_current_payrole_count_other) AS total_current_payrole_count_other,
                        SUM(pm.total_current_payrole_count) AS total_current_payrole_count,
                        SUM(pm.total_in_district_wise_count_male) AS total_in_district_wise_count_male,
                        SUM(pm.total_in_district_wise_count_female) AS total_in_district_wise_count_female,
                        SUM(pm.total_in_district_wise_count_other) AS total_in_district_wise_count_other,
                        SUM(pm.total_in_district_wise_count) AS total_in_district_wise_count,
                        SUM(pm.total_out_district_wise_count_male) AS total_out_district_wise_count_male,
                        SUM(pm.total_out_district_wise_count_female) AS total_out_district_wise_count_female,
                        SUM(pm.total_out_district_wise_count_other) AS total_out_district_wise_count_other,
                        SUM(pm.total_out_district_wise_count) AS total_out_district_wise_count,
                        SUM(pm.total_no_payrole_count_male) AS total_no_payrole_count_male,
                        SUM(pm.total_no_payrole_count_female) AS total_no_payrole_count_female,
                        SUM(pm.total_no_payrole_count_other) AS total_no_payrole_count_other,
                        SUM(pm.total_no_payrole_count) AS total_no_payrole_count,
                        SUM(pm.total_payrole_regulation_female) AS total_payrole_regulation_female,
                        SUM(pm.total_payrole_regulation_male) AS total_payrole_regulation_male,
                        SUM(pm.total_payrole_regulation_other) AS total_payrole_regulation_other,
                        SUM(pm.total_payrole_regulation) AS total_payrole_regulation,
                        GROUP_CONCAT(remarks SEPARATOR '; ') AS remarks
                    FROM payrole_maskebari pm
                    LEFT JOIN offices oo ON pm.office_id = oo.id
                    LEFT JOIN offices os ON pm.created_office = os.id
`;

router.get( '/payrole_maskebari_count', verifyToken, async ( req, res ) => {
    const active_office = req.user.office_id;
    let sql = '';
    let params = '';
    try {
        if ( active_office <= 2 ) {
            sql = `${ getMaskebariQuery }                     
                    GROUP BY year_bs, month_bs, office_id
                    ORDER BY year_bs DESC, month_bs;`;
            params = [];
        } else {
            console.log( 'clientRoute' );
            sql = `${ getMaskebariQuery } WHERE created_office=? 
                    GROUP BY year_bs, month_bs, office_id
                    ORDER BY year_bs DESC, month_bs; `;
            params = [active_office];
        }
        const result = await query( sql, params );
        res.status( 200 ).json( { Status: true, Result: result } );
    } catch ( err ) {
        console.error( 'GET Error:', err );
        res.status( 500 ).json( { Status: false, error: err.message } );
    }
} );

router.put( '/create_payrole_maskebari_count/:id', verifyToken, async ( req, res ) => {
    const { id } = req.params;
    const active_office = req.user.office_id;
    const active_user = req.user.id;

    try {
        // Add updated_by and updated_office to the request body
        req.body.updated_by = active_user;
        // req.body.updated_office = active_office;

        const keys = Object.keys( req.body );
        const values = Object.values( req.body );

        const setClause = keys.map( key => `${ key } = ?` ).join( ', ' );
        const sql = `UPDATE payrole_maskebari SET ${ setClause } WHERE id = ?`;

        values.push( id ); // Add ID at the end for WHERE clause

        const result = await query( sql, values );
        res.status( 200 ).json( { message: 'Updated successfully', affectedRows: result.affectedRows } );
    } catch ( err ) {
        console.error( 'Update Error:', err );
        res.status( 500 ).json( { error: err.message } );
    }
} );

export { router as payroleRouter };