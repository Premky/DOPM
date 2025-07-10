import express from 'express';
import con from '../utils/db.js';
import pool from '../utils/db3.js';
import { promisify } from 'util';
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
import {
    insertBandiPerson, insertKaidDetails, insertCardDetails, insertAddress,
    insertMuddaDetails, insertFineDetails, insertPunarabedan, insertFamily, insertContacts, insertHealthInsurance,
    insertSingleFineDetails,
    insertDiseasesDetails,
    insertDisablilityDetails,
    updateContactPerson,
    updateDiseasesDetails,
    updateDisabilities,
    insertTransferDetails
} from '../services/bandiService.js';
// console.log(current_date);
// console.log(fy_date)

router.post( '/create_bandi_contact_person', verifyToken, async ( req, res ) => {
    const active_office = req.user.office_id;
    const user_id = req.user.id;

    let connection;
    try {
        connection = await pool.getConnection();
        console.log( "📥 Full Request Body:", JSON.stringify( req.body, null, 2 ) );

        const insertCount = await insertTransferDetails(
            req.body.bandi_id,
            req.body,
            user_id,
            active_office,
            connection
        );

        if ( insertCount === 0 ) {
            // await rollbackAsync();
            await connection.rollback();
            console.warn( "⚠️ No rows inserted. Possible bad data structure." );
            return res.status( 400 ).json( {
                Status: false,
                message: "डेटा इन्सर्ट गर्न सकेनौं। सम्भवत: 'relation_id' छुट्यो वा गलत ढाँचा।"
            } );
        }

        // await commitAsync();
        await connection.commit();
        return res.json( {
            Status: true,
            message: "बन्दी विवरण सफलतापूर्वक सुरक्षित गरियो।"
        } );

    } catch ( error ) {
        // await rollbackAsync();
        await connection.rollback();
        console.error( "❌ Transaction failed:", error );
        return res.status( 500 ).json( {
            Status: false,
            Error: error.message,
            message: "सर्भर त्रुटि भयो, सबै डाटा पूर्वस्थितिमा फर्काइयो।"
        } );
    } finally {
        await connection.release();
    }
} );

router.get( '/get_bandi_contact_person/:id', async ( req, res ) => {
    const { id } = req.params;
    const sql = `
        SELECT bcp.id, bcp.bandi_id, bcp.relation_id, relation_np as relation_np, bcp.contact_name, bcp.contact_address,
        bcp.contact_contact_details        
        FROM bandi_contact_person bcp        
        LEFT JOIN relationships r ON bcp.relation_id = r.id
        WHERE bandi_id = ?
    `;
    try {
        const [result] = await pool.query( sql, [id] ); // Use promise-wrapped query
        // console.log(result)
        if ( result.length === 0 ) {
            return res.json( { Status: false, Error: "Bandi ID not found" } );
        }
        return res.json( { Status: true, Result: result } );
    } catch ( err ) {
        console.error( err );
        return res.json( { Status: false, Error: "Query Error" } );
    }
} );

router.put( '/update_bandi_contact_person/:id', verifyToken, async ( req, res ) => {
    const active_office = req.user.office_id;
    const user_id = req.user.id;
    const contactId = req.params.id;

    let connection;
    try {
        connection = await pool.getConnection();
        console.log( "📝 Update contact request:", req.body );

        const updatedCount = await updateContactPerson( contactId, req.body, user_id, active_office );

        if ( updatedCount === 0 ) {
            return res.status( 400 ).json( {
                Status: false,
                message: "डेटा अपडेट गर्न सकेनौं। कृपया सबै विवरणहरू जाँच गर्नुहोस्।"
            } );
        }

        // await commitAsync();
        await connection.commit();

        return res.json( {
            Status: true,
            message: "बन्दी सम्पर्क व्यक्ति विवरण सफलतापूर्वक अपडेट गरियो।"
        } );

    } catch ( error ) {
        // await rollbackAsync();
        await connection.rollback();
        console.error( "❌ Update failed:", error );

        return res.status( 500 ).json( {
            Status: false,
            Error: error.message,
            message: "सर्भर त्रुटि भयो, सम्पर्क विवरण अपडेट गर्न असफल।"
        } );
    } finally {
        await connection.release();
    }
} );

//
router.post( '/create_bandi_karagar_history', verifyToken, async ( req, res ) => {
    const active_office = req.user.office_id;
    const user_id = req.user.id;
    let connection;
    try {
        connection = await pool.getConnection();
        console.log( "📥 Full Request Body:", JSON.stringify( req.body, null, 2 ) );

        const insertCount = await insertContacts(
            req.body.bandi_id,
            req.body.contact_person,
            user_id,
            active_office
        );

        if ( insertCount === 0 ) {
            // await rollbackAsync();
            await connection.rollback();
            console.warn( "⚠️ No rows inserted. Possible bad data structure." );
            return res.status( 400 ).json( {
                Status: false,
                message: "डेटा इन्सर्ट गर्न सकेनौं। सम्भवत: 'relation_id' छुट्यो वा गलत ढाँचा।"
            } );
        }

        // await commitAsync();
        await connection.commit();
        return res.json( {
            Status: true,
            message: "बन्दी विवरण सफलतापूर्वक सुरक्षित गरियो।"
        } );

    } catch ( error ) {
        // await rollbackAsync();
        await connection.rollback();
        console.error( "❌ Transaction failed:", error );
        return res.status( 500 ).json( {
            Status: false,
            Error: error.message,
            message: "सर्भर त्रुटि भयो, सबै डाटा पूर्वस्थितिमा फर्काइयो।"
        } );
    } finally {
        connection.release();
    }
} );
//
router.get( '/get_bandi_transfer_history/:id', async ( req, res ) => {
    const { id } = req.params;
    const sql = `
    SELECT bth.*, 
    o.office_name_with_letter_address AS transfer_to_office_fn,
    oo.office_name_with_letter_address AS transfer_from_office_fn,
    btr.transfer_reason_np
    FROM bandi_transfer_history bth
    LEFT JOIN offices o ON bth.transfer_office_id = o.id
    LEFT JOIN bandi_transfer_reasons btr ON bth.transfer_reason_id=btr.id
    LEFT JOIN offices oo ON bth.created_office_id = oo.id
    WHERE bandi_id=?
    `;
    try {
        const [result] = await pool.query( sql, [id] ); // Use promise-wrapped query
        // console.log(result)
        if ( result.length === 0 ) {
            return res.json( { Status: false, Error: "Bandi ID not found" } );
        }
        return res.json( { Status: true, Result: result } );
    } catch ( err ) {
        console.error( err );
        return res.json( { Status: false, Error: "Query Error" } );
    }
} );
//
router.put( '/update_bandi_transfer_history/:id', verifyToken, async ( req, res ) => {
    const active_office = req.user.office_id;
    const user_id = req.user.id;
    const contactId = req.params.id;

    let connection;
    try {
        connection = await pool.getConnection();
        console.log( "📝 Update contact request:", req.body );

        const updatedCount = await updateContactPerson( contactId, req.body, user_id, active_office );

        if ( updatedCount === 0 ) {
            return res.status( 400 ).json( {
                Status: false,
                message: "डेटा अपडेट गर्न सकेनौं। कृपया सबै विवरणहरू जाँच गर्नुहोस्।"
            } );
        }

        // await commitAsync();
        await connection.commit();

        return res.json( {
            Status: true,
            message: "बन्दी सम्पर्क व्यक्ति विवरण सफलतापूर्वक अपडेट गरियो।"
        } );

    } catch ( error ) {
        // await rollbackAsync();
        await connection.rollback();
        console.error( "❌ Update failed:", error );

        return res.status( 500 ).json( {
            Status: false,
            Error: error.message,
            message: "सर्भर त्रुटि भयो, सम्पर्क विवरण अपडेट गर्न असफल।"
        } );
    } finally {
        await connection.release();
    }
} );

export { router as bandiRouter };