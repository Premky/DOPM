import express from 'express';
import con from '../utils/db.js';
import pool from '../utils/db3.js';
// import con2 from '../utils/db2.js';
import { promisify } from 'util';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import NepaliDate from 'nepali-datetime';

import verifyToken from '../middlewares/verifyToken.js';

const router = express.Router();
const query = promisify( con.query ).bind( con );
const __filename = fileURLToPath( import.meta.url );
const __dirname = path.dirname( __filename );

import NepaliDateConverter from 'nepali-date-converter';
const current_date = new NepaliDate().format( 'YYYY-MM-DD' );
const fy = new NepaliDate().format( 'YYYY' ); //Support for filter
const fy_date = fy + '-04-01';
// console.log(current_date);
router.get( "/get_offices", async ( req, res ) => {
    const sql = `SELECT * from offices ORDER BY office_name_with_letter_address`;
    try {
        const [result] = await pool.query( sql );
        return res.json( { Status: true, Result: result, message: 'Records fetched successfully.' } );
    } catch ( err ) {
        console.error( "Database Query Error:", err );
        res.status( 500 ).json( { Status: false, Error: "Internal Server Error" } );
    }
} );

router.get( '/get_all_punarabedan_offices', async ( req, res ) => {
    const sql = `SELECT * from offices WHERE office_categories_id=5 ORDER BY letter_address`;
    try {
        const [result] = await pool.query( sql );
        // console.log(result)
        return res.json( { Status: true, Result: result } );
    } catch ( err ) {
        console.error( "Database Query Error:", err );
        res.status( 500 ).json( { Status: false, Error: "Internal Server Error" } );
    }
} );

router.get( '/get_parole_nos/', async ( req, res ) => {
    const { id } = req.params;
    const sql = `SELECT * FROM payrole_nos`;

    pool.query( sql, ( err, result ) => {
        // console.log(result)
        if ( err ) return res.json( { Status: false, Error: "Query Error" } );
        if ( result.length === 0 ) {
            return res.json( { Status: false, Error: "Parole Nos not found" } );
        }
        return res.json( { Status: true, Result: result } );
    } );

} );
router.get( '/get_character_conditions', async ( req, res ) => {
    const sql = `SELECT * FROM character_conditions`;

    try {
        const [result] = await pool.query( sql );

        if ( result.length === 0 ) {
            return res.json( {
                Status: false,
                Error: "No character conditions found",
            } );
        }

        return res.json( {
            Status: true,
            Result: result,
        } );
    } catch ( err ) {
        console.error( "Query Error:", err );
        return res.status( 500 ).json( {
            Status: false,
            Error: "Query Error",
        } );
    }
} );

router.get( '/get_all_user_roles', async ( req, res ) => {
    const sql = `SELECT * FROM user_roles WHERE role_name_np IS NOT NULL AND is_process=1 `;

    try {
        const [result] = await pool.query( sql );

        if ( result.length === 0 ) {
            return res.json( {
                Status: false,
                Error: "No character conditions found",
            } );
        }

        return res.json( {
            Status: true,
            Result: result,
        } );
    } catch ( err ) {
        console.error( "Query Error:", err );
        return res.status( 500 ).json( {
            Status: false,
            Error: "Query Error",
        } );
    }
} );

router.get( '/get_in_process_user_roles', async ( req, res ) => {
    const sql = `SELECT * FROM user_roles WHERE role_name_np IS NOT NULL AND is_process=1 `;

    try {
        const [result] = await pool.query( sql );

        if ( result.length === 0 ) {
            return res.json( {
                Status: false,
                Error: "No character conditions found",
            } );
        }

        return res.json( {
            Status: true,
            Result: result,
        } );
    } catch ( err ) {
        console.error( "Query Error:", err );
        return res.status( 500 ).json( {
            Status: false,
            Error: "Query Error",
        } );
    }
} );

router.get( '/get_parole_status/', async ( req, res ) => {
    const { id } = req.params;
    const sql = `SELECT * FROM parole_status`;

    pool.query( sql, id, ( err, result ) => {
        if ( err ) return res.json( { Status: false, Error: "Query Error" } );
        if ( result.length === 0 ) {
            return res.json( { Status: false, Error: "Parole Status not found" } );
        }
        return res.json( { Status: true, Result: result[0] } );
    } );

} );

router.get( '/get_id_cards', async ( req, res ) => {
    const sql = `SELECT * FROM govt_id_types`;
    try {
        const [result] = await pool.query( sql );
        // console.log(result)
        return res.json( { Status: true, Result: result } );
    } catch ( err ) {
        console.error( "Database Query Error:", err );
        res.status( 500 ).json( { Status: false, Error: "Internal Server Error" } );
    }
} );

router.get( '/get_id_cards1/', async ( req, res ) => {
    const sql = `SELECT * FROM govt_id_types`;

    await pool.query( sql, ( err, result ) => {
        if ( err ) return res.json( { Status: false, Error: "Query Error" } );
        if ( result.length === 0 ) {
            return res.json( { Status: false, Error: "ID Cards not found" } );
        }
        return res.json( { Status: true, Result: result } );
    } );
} );

router.get( '/get_relations/', async ( req, res ) => {
    const sql = `SELECT * FROM relationships`;
    try {
        const [result] = await pool.query( sql );
        // console.log(result)
        return res.json( { Status: true, Result: result } );
    } catch ( err ) {
        console.error( "Database Query Error:", err );
        res.status( 500 ).json( { Status: false, Error: "Internal Server Error" } );
    }
} );

router.get( '/get_bandi_release_reasons1/', async ( req, res ) => {
    const sql = `SELECT * FROM bandi_release_reasons`;

    pool.query( sql, ( err, result ) => {
        if ( err ) return res.json( { Status: false, Error: "Query Error" } );
        if ( result.length === 0 ) {
            return res.json( { Status: false, Error: "Bandi release reasons not found" } );
        }
        return res.json( { Status: true, Result: result } );
    } );
} );

router.get( '/get_bandi_release_reasons/', async ( req, res ) => {
    const sql = `SELECT * FROM bandi_release_reasons`;
    try {
        const [result] = await pool.query( sql );
        // console.log(result)
        return res.json( { Status: true, Result: result } );
    } catch ( err ) {
        console.error( "Database Query Error:", err );
        res.status( 500 ).json( { Status: false, Error: "Internal Server Error" } );
    }
} );

router.get( '/get_bandi_transfer_reasons/', async ( req, res ) => {
    const sql = `SELECT * FROM bandi_transfer_reasons`;
    try {
        const [result] = await pool.query( sql );
        // console.log(result)
        return res.json( { Status: true, Result: result } );
    } catch ( err ) {
        console.error( "Database Query Error:", err );
        res.status( 500 ).json( { Status: false, Error: "Internal Server Error" } );
    }
} );

router.get( '/get_fine_types/', async ( req, res ) => {
    const sql = `SELECT * FROM fine_types`;
    try {
        const [result] = await pool.query( sql );
        // console.log(result)
        return res.json( { Status: true, Result: result } );
    } catch ( err ) {
        console.error( "Database Query Error:", err );
        res.status( 500 ).json( { Status: false, Error: "Internal Server Error" } );
    }
} );

// router.get( '/get_fine_types1/', async ( req, res ) => {
//     const sql = `SELECT * FROM fine_types`;

//     pool.query( sql, ( err, result ) => {
//         if ( err ) return res.json( { Status: false, Error: "Query Error" } );
//         if ( result.length === 0 ) {
//             return res.json( { Status: false, Error: "Bandi release reasons not found" } );
//         }
//         return res.json( { Status: true, Result: result } );
//     } );

// } );

router.get( '/get_diseases', async ( req, res ) => {
    const sql = `SELECT * from diseases ORDER BY id`;
    try {
        const [result] = await pool.query( sql );
        return res.json( { Status: true, Result: result } );
    } catch ( err ) {
        console.error( "Database Query Error:", err );
        res.status( 500 ).json( { Status: false, Error: "Internal Server Error" } );
    }
} );

router.get( '/get_disabilities', async ( req, res ) => {
    const sql = `SELECT * from disabilities ORDER BY id`;
    try {
        const [result] = await pool.query( sql );
        return res.json( { Status: true, Result: result } );
    } catch ( err ) {
        console.error( "Database Query Error:", err );
        res.status( 500 ).json( { Status: false, Error: "Internal Server Error" } );
    }
} );

router.get( '/muddas_groups', async ( req, res ) => {
    const sql = `SELECT * from muddas_groups ORDER BY id`;
    try {
        const [result] = await pool.query( sql );
        return res.json( { Status: true, Result: result } );
    } catch ( err ) {
        console.error( "Database Query Error:", err );
        res.status( 500 ).json( { Status: false, Error: "Internal Server Error" } );
    }
} );

// const queryAsync = promisify( con.query ).bind( con );


router.get( '/get_countries', async ( req, res ) => {
    const sql = `SELECT * from np_country ORDER BY id`;
    try {
        const [result] = await pool.query( sql );
        return res.json( { Status: true, Result: result } );
    } catch ( err ) {
        console.error( "Database Query Error:", err );
        res.status( 500 ).json( { Status: false, Error: "Internal Server Error" } );
    }
} );

router.get( '/get_countries_ac_to_office', verifyToken, async ( req, res ) => {
    const active_office = req.user.office_id;
    const { office_id } = req.query;
    const filters = [];
    const params = [];
    if ( active_office === 1 || active_office === 2 ) {
        if ( office_id && office_id.trim() !== '' ) {
            const parsedOfficeId = parseInt( office_id, 10 );
            if ( !isNaN( parsedOfficeId ) ) {
                filters.push( `bp.current_office_id = ?` );
                params.push( parsedOfficeId );
            }
        }
        // else no office filter (all offices for super admin)
    } else {
        filters.push( ` bp.current_office_id = ?` );
        params.push( active_office );
    }
    const sql = `SELECT nc.id, nc.country_name_np from np_country nc 
                INNER JOIN bandi_address ba ON nc.id=ba.nationality_id
                INNER JOIN bandi_person bp ON ba.bandi_id=bp.id
                ${ filters.length ? ' WHERE ' + filters.join( ' AND ' ) : '' }
                GROUP BY nc.id
                ORDER BY nc.id`;
    try {
        const [result] = await pool.query( sql, params );
        return res.json( { Status: true, Result: result } );
    } catch ( err ) {
        console.error( "Database Query Error:", err );
        res.status( 500 ).json( { Status: false, Error: "Internal Server Error" } );
    }
} );

router.get( '/get_mudda_groups', async ( req, res ) => {
    const is_parole_applied_mudda_group_only = req.query.is_parole_applied_mudda_group_only;
    let sql = `SELECT * from muddas_groups ORDER BY mudda_group_name`;
    if ( is_parole_applied_mudda_group_only ) {
        sql = `SELECT mg.* FROM 
                muddas_groups mg
                JOIN muddas m ON m.muddas_group_id=mg.id
                INNER JOIN bandi_mudda_details bmd ON m.id=bmd.mudda_id
                INNER JOIN payroles p ON bmd.bandi_id=p.bandi_id
                GROUP BY mg.id`;
    }
    try {
        const [result] = await pool.query( sql );
        return res.json( { Status: true, Result: result } );
    } catch ( err ) {
        console.error( "Database Query Error:", err );
        res.status( 500 ).json( { Status: false, Error: "Internal Server Error" } );
    }
} );

router.get( '/get_states', async ( req, res ) => {
    const sql = `SELECT * from np_state ORDER BY state_id`;
    try {
        const [result] = await pool.query( sql );
        return res.json( { Status: true, Result: result } );
    } catch ( err ) {
        console.error( "Database Query Error:", err );
        res.status( 500 ).json( { Status: false, Error: "Internal Server Error" } );
    }
} );

router.get( '/get_districts', async ( req, res ) => {
    const sql = `SELECT * from np_district ORDER BY did`;
    try {
        const [result] = await pool.query( sql );
        return res.json( { Status: true, Result: result } );
    } catch ( err ) {
        console.error( "Database Query Error:", err );
        res.status( 500 ).json( { Status: false, Error: "Internal Server Error" } );
    }
} );

router.get( '/get_municipalities', async ( req, res ) => {
    const sql = `SELECT * from np_city ORDER BY cid`;
    try {
        const [result] = await pool.query( sql );
        return res.json( { Status: true, Result: result } );
    } catch ( err ) {
        console.error( "Database Query Error:", err );
        res.status( 500 ).json( { Status: false, Error: "Internal Server Error" } );
    }
} );

router.get( '/get_bandi_type', async ( req, res ) => {
    const sql = `SELECT * from bandi_types`;
    try {
        const [result] = await pool.query( sql );

        return res.json( { Status: true, Result: result } );
    } catch ( err ) {
        console.error( "Database Query Error:", err );
        res.status( 500 ).json( { Status: false, Error: "Internal Server Error" } );
    }
} );

router.get( '/get_mudda', async ( req, res ) => {
    try {
        let sql = `SELECT * FROM muddas`;
        const params = [];

        // Apply filter if mudda_group_id is provided
        if ( req.query.mudda_group_id ) {
            sql += ' WHERE muddas_group_id = ?';
            params.push( req.query.mudda_group_id );
        }

        sql += ' ORDER BY mudda_name ASC'; // make ordering explicit

        const [result] = await pool.query( sql, params );

        if ( !result || result.length === 0 ) {
            return res.json( { Status: true, Result: [], Message: "No muddas found" } );
        }

        return res.json( { Status: true, Result: result } );
    } catch ( err ) {
        console.error( "Database Query Error:", err.message );
        return res.status( 500 ).json( {
            Status: false,
            Error: "Internal Server Error",
            Details: err.message, // helpful for debugging
        } );
    }
} );

router.get( '/get_mudda1', async ( req, res ) => {
    try {
        let sql = `SELECT * FROM muddas`;
        const params = [];

        // If mudda_group_id is provided, add WHERE clause
        if ( req.query.mudda_group_id ) {
            sql += ' WHERE muddas_group_id = ?';
            params.push( req.query.mudda_group_id );
        }

        sql += ' ORDER BY mudda_name'; // Keep ordering

        const [result] = await pool.query( sql, params );
        // console.log('muddas:', result );  
        return res.json( { Status: true, Result: result } );
    } catch ( err ) {
        console.error( "Database Query Error:", err );
        res.status( 500 ).json( { Status: false, Error: "Internal Server Error" } );
    }
} );


router.get( '/get_payrole_nos', async ( req, res ) => {
    const { is_only_active } = req.query;

    let sql = `SELECT * from payrole_nos `;
    if ( is_only_active === "true" ) {
        sql += ` WHERE is_active = 1 `;
    }
    sql += ` ORDER BY id DESC`;
    try {
        const [result] = await pool.query( sql );
        return res.json( { Status: true, Result: result } );
    } catch ( err ) {
        console.error( "Database Query Error:", err );
        res.status( 500 ).json( { Status: false, Error: "Internal Server Error" } );
    }
} );

router.get( '/get_payrole_status', async ( req, res ) => {
    const sql = `SELECT * from payrole_status ORDER BY id`;
    try {
        const [result] = await pool.query( sql );
        return res.json( { Status: true, Result: result } );
    } catch ( err ) {
        console.error( "Database Query Error:", err );
        res.status( 500 ).json( { Status: false, Error: "Internal Server Error" } );
    }
} );

router.get( '/get_bandi_ranks/', async ( req, res ) => {

    const sql = `SELECT * FROM bandi_posts `;
    try {
        const [result] = await pool.query( sql );
        return res.json( { Status: true, Result: result } );
    } catch ( err ) {
        console.error( "Database Query Error:", err );
        res.status( 500 ).json( { Status: false, Error: "Internal Server Error" } );
    }
} );

router.get( '/get_usertypes/', async ( req, res ) => {
    // const {reason_type} = req.params;
    const sql = `SELECT * FROM usertypes;`;
    try {
        const [result] = await pool.query( sql );
        return res.json( { Status: true, Result: result } );
    } catch ( err ) {
        console.error( "Database Query Error:", err );
        res.status( 500 ).json( { Status: false, Error: "Internal Server Error" } );
    }
} );


router.get( '/currentoffice/:id', ( req, res ) => {
    const { id } = req.params;
    const sql = "SELECT * FROM office WHERE id=?";
    pool.query( sql, id, ( err, result ) => {
        if ( err ) return res.json( { Status: false, Error: "Query Error" } );
        return res.json( { Status: true, Result: result } );
    } );
} );

router.get( '/leavetypes', ( req, res ) => {
    const sql = "SELECT * FROM leave_type";
    pool.query( sql, ( err, result ) => {
        if ( err ) return res.json( { Status: false, Error: "Query Error" } );
        return res.json( { Status: true, Result: result } );
    } );
} );

//Search PMIS
router.get( '/search_pmis', ( req, res ) => {
    const pmis = req.query.pmis;
    // console.log(pmis)
    const handleResponse = ( err, result, errorMsg ) => {
        if ( err ) {
            return res.json( { Status: false, Error: errorMsg } );
        }
        if ( result && result.length > 0 ) {
            return res.json( { Status: true, Result: result } );
        } else {
            return res.json( { Status: false, Error: "No records found" } );
        }
    };

    // const sql = `SELECT e.*, r.rank_np AS rank, o.office_name 
    //             FROM employee e
    //             JOIN ranks r ON e.rank = r.rank_id
    //             JOIN office o ON e.working = o.o_id
    //             WHERE pmis = ?`;
    const sql = `SELECT e.*, r.rank_np AS rank
                FROM employee e
                JOIN ranks r ON e.rank = r.rank_id                
                WHERE pmis = ?`;
    pool.query( sql, [pmis], ( err, result ) => {
        return handleResponse( err, result, "Query Error" );
    } );
} );

// Get all blocks with office name
router.get( '/prison_blocks1/', verifyToken, async ( req, res ) => {
    const active_office = req.user.office_id;
    try {
        const [result] = await pool.query(
            `SELECT pb.*, o.letter_address 
       FROM prison_blocks pb 
       JOIN offices o ON pb.prison_id = o.id
       WHERE o.id=?`,
            [active_office] );
        return res.json( { Status: true, Result: result } );
    } catch ( err ) {
        console.error( "Database Query Error:", err );
        res.status( 500 ).json( { Status: false, Error: "Internal Server Error" } );
    }

} );

router.get( '/prison_blocks/', verifyToken, async ( req, res ) => {
    const active_office = req.user.office_id;


    let sql;
    let params=[];
    let officeFilterSql;
    if ( active_office !== 1 && active_office !== 2 ) {
        params.push( active_office );
        officeFilterSql = 'AND o.id = ?';
    } else if ( office_id ) {
        params.push( office_id );
        officeFilterSql = 'AND o.id = ?';
    }

    sql = `SELECT pb.*, o.letter_address 
       FROM prison_blocks pb 
       JOIN offices o ON pb.prison_id = o.id
       WHERE 1=1 AND ${ officeFilter }`;
    try {
        const [result]=await pool.query(sql, [params])
        return res.json( { Status: true, Result: result } );
    } catch ( err ) {
        console.error( "Database Query Error:", err );
        res.status( 500 ).json( { Status: false, Error: "Internal Server Error" } );
    }

} );

export { router as publicRouter };