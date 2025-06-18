import express from 'express';
import con from '../utils/db.js';
import con2 from '../utils/db2.js';
import { promisify } from 'util';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import NepaliDate from 'nepali-datetime';
import dateConverter from 'nepali-datetime/dateConverter';


import verifyToken from '../middlewares/verifyToken.js';


const router = express.Router();
// const query = promisify(con.query).bind(con);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import NepaliDateConverter from 'nepali-date-converter';
const current_date = new NepaliDate().format('YYYY-MM-DD');
const fy = new NepaliDate().format('YYYY'); //Support for filter
const fy_date = fy + '-04-01'

import { bs2ad } from '../utils/bs2ad.js';
// console.log(current_date);
// console.log(fy_date)

//गाडीका विवरणहरुः नाम सुची
// Promisify specific methods
const queryAsync = promisify(con.query).bind(con);
const beginTransactionAsync = promisify(con.beginTransaction).bind(con);
const commitAsync = promisify(con.commit).bind(con);
const rollbackAsync = promisify(con.rollback).bind(con);
const query = promisify(con.query).bind(con);

// Convert BS to AD
// const adDate = bs.toGregorian('2081-03-01'); // Output: { year: 2024, month: 6, day: 14 }

// English to Nepali date conversion
const [npYear, npMonth, npDay] = dateConverter.englishToNepali(2023, 5, 27);



async function calculateAge(birthDateBS) {
    // Convert BS to AD
    const nepaliDate = new NepaliDate(birthDateBS);
    const adDate = nepaliDate.getDateObject(); // Converts to JavaScript Date

    // Get current date
    const currentDate = new Date();

    // Calculate age
    let age = currentDate.getFullYear() - adDate.getFullYear();
    const m = currentDate.getMonth() - adDate.getMonth();

    // Adjust age if birthday hasn't occurred yet this year
    if (m < 0 || (m === 0 && currentDate.getDate() < adDate.getDate())) {
        age--;
    }

    return age;
}






async function generateUniqueBandiId() {
    const maxAttempts = 10;

    for (let i = 0; i < maxAttempts; i++) {
        const randId = Math.floor(100000 + Math.random() * 900000); // 6-digit random number
        const result = await queryAsync(
            `SELECT office_bandi_id FROM bandi_person WHERE office_bandi_id = ?`,
            [randId]
        );

        if (result.length === 0) {
            return randId; // Unique ID
        }
    }

    throw new Error("Unable to generate a unique bandi ID after multiple attempts.");
}

router.get('/get_random_bandi_id', async (req, res) => {
    const rand_bandi_id = await generateUniqueBandiId();
    console.log(rand_bandi_id)
    return res.json({ Status: true, Result: rand_bandi_id })
})

router.post('/create_bandi', verifyToken, async (req, res) => {
    const active_office = req.user.office_id;
    const user_id = req.user.id;
    // console.log('activeoffice:', active_office, ',', 'user_id:',user_id)
    // console.log(req.body)
    const {
        bandi_type, office_bandi_id, nationality, bandi_name, gender, dob, age, married_status, photo_path,
        bandi_education, bandi_height, bandi_weight, bandi_huliya, bandi_remarks,
        id_card_type, card_no, card_issue_district_id, card_issue_date,
        nationality_id, state_id, district_id, municipality_id, wardno, bidesh_nagrik_address_details,
        hirasat_date_bs, thuna_date_bs, release_date_bs, hirasat_years, hirasat_months, hirasat_days,
        is_bigo, is_bigo_paid, bigo_amt, bigo_paid_cn, bigo_paid_date, bigo_paid_office, bigo_paid_office_district,
        is_compensation, is_compensation_paid, compensation_amt, compensation_paid_cn, compensation_paid_date, compensation_paid_office, compensation_paid_office_district,
        is_fine_fixed, is_fine_paid, fine_amt, fine_paid_cn, fine_paid_date, fine_paid_office, fine_paid_office_district,
        punarabedan_office_id, punarabedan_office_district, punarabedan_office_ch_no, punarabedan_office_date,
    } = req.body;



    const dob_ad = await bs2ad(dob);
    const hirasatdatead = await bs2ad(hirasat_date_bs);

    console.log('hirasat:', hirasatdatead)

    const bandiPerson = [
        bandi_type, office_bandi_id, nationality, bandi_name, gender, dob, dob_ad, age, married_status, photo_path,
        bandi_education, bandi_height, bandi_weight, bandi_huliya, bandi_remarks, active_office];

    try {
        await beginTransactionAsync();
        // 1. Insert into bandi_records
        const insertBandiInfoSQL = `
        INSERT INTO bandi_person(
        bandi_type, office_bandi_id, nationality, bandi_name, gender, dob, dob_ad, age, married_status, photo_path, 
        bandi_education, height, weight, bandi_huliya, remarks, current_office_id) VALUES (?)`;

        const bandiResult = await queryAsync(insertBandiInfoSQL, [bandiPerson]);
        const bandi_id = bandiResult.insertId;

        // 2. Insert into bandi_kaid_detao;s
        // const hirasatDateAd = await bs2ad(hirasat_date_bs);
        const thunaDateAd = await bs2ad(hirasat_date_bs);
        const releaseDateAd = await bs2ad(release_date_bs);

        const kaidDetails = [bandi_id, hirasat_years, hirasat_months, hirasat_days, thuna_date_bs, thunaDateAd, release_date_bs, releaseDateAd]
        const insertKaidDetails = `INSERT INTO bandi_kaid_details(bandi_id, hirasat_years, hirasat_months, hirasat_days, thuna_date_bs, 
                                    thuna_date_ad, release_date_bs, release_date_ad) VALUES(?)`;
        await queryAsync(insertKaidDetails, [kaidDetails])

        // 3. Insert into bandi_card_details
        const cardRecord = [bandi_id, id_card_type, card_no, card_issue_district_id, card_issue_date]
        const insertCardDetails = `INSERT INTO bandi_id_card_details(bandi_id, card_type_id, card_no, card_issue_district, card_issue_date) VALUES(?)`;
        await queryAsync(insertCardDetails, [cardRecord])

        //4. Insert into bandi_address_details:
        const addressRecord = [bandi_id, nationality_id, state_id, district_id, municipality_id, wardno, bidesh_nagrik_address_details]
        const insertAddressRecord = `INSERT INTO bandi_address(bandi_id, nationality_id, province_id, district_id,
                                    gapa_napa_id, wardno, bidesh_nagarik_address_details) VALUES(?)`;
        await queryAsync(insertAddressRecord, [addressRecord])

        // 5. Insert involved mudda
        const muddaEntries = Object.entries(req.body).filter(([key]) =>
            key.startsWith("mudda_")
        );

        // Get all keys that start with 'mudda_id_' and extract unique indexes
        const muddaIndexes = new Set(
            Object.keys(req.body)
                .filter(key => key.startsWith('mudda_id_'))
                .map(key => key.split('_')[2]) // extract the index part
        );

        for (const muddaIndex of muddaIndexes) {
            const mudda_id = req.body[`mudda_id_${muddaIndex}`] || '';
            const mudda_no = req.body[`mudda_no_${muddaIndex}`] || '';
            const is_last_mudda = req.body[`is_last_mudda_${muddaIndex}`] || '';
            const is_main_mudda = req.body[`is_main_mudda_${muddaIndex}`] || '';
            const mudda_condition = req.body[`mudda_condition_${muddaIndex}`] || '';
            const mudda_district = req.body[`mudda_district_${muddaIndex}`] || '';
            const mudda_office = req.body[`mudda_office_${muddaIndex}`] || '';
            const vadi = req.body[`vadi_${muddaIndex}`] || '';
            const mudda_phesala_date = req.body[`mudda_phesala_date_${muddaIndex}`] || '';

            const muddaRecord = [bandi_id, mudda_id, mudda_no, is_last_mudda, is_main_mudda, mudda_condition,
                mudda_district, mudda_office, mudda_phesala_date, vadi]
            const insertMuddaSQL = `
            INSERT INTO bandi_mudda_details (
                bandi_id, mudda_id, mudda_no, is_last_mudda, is_main_mudda,
                mudda_condition, mudda_phesala_antim_office_district,
                mudda_phesala_antim_office_id, mudda_phesala_antim_office_date,vadi

            ) VALUES (?)`;

            await queryAsync(insertMuddaSQL, [muddaRecord]);
        }

        //6. Insert into fine table 
        const fineRecord = [
            bandi_id, 'जरिवाना', is_fine_fixed, fine_amt, is_fine_paid, fine_paid_office_district, fine_paid_cn, fine_paid_date, fine_paid_office,
        ]
        const compensationRecord = [
            bandi_id, 'क्षतिपुर्ती', is_compensation, compensation_amt, is_compensation_paid, compensation_paid_office_district,
            compensation_paid_cn, compensation_paid_date, compensation_paid_office,
        ]
        const bigoRecord = [
            bandi_id, 'विगो तथा कोष', is_bigo, bigo_amt, is_bigo_paid, bigo_paid_office_district, bigo_paid_cn, bigo_paid_date, bigo_paid_office
        ]
        const insertFines = `INSERT INTO bandi_fine_details(
        bandi_id, fine_type, amount_fixed, deposit_amount, amount_deposited, deposit_district,  
                        deposit_ch_no, deposit_date, deposit_office) VALUES(?)`;

        await queryAsync(insertFines, [fineRecord])
        await queryAsync(insertFines, [compensationRecord])
        await queryAsync(insertFines, [bigoRecord])

        const punrabednRecord = [
            bandi_id, punarabedan_office_id, punarabedan_office_district, punarabedan_office_ch_no, punarabedan_office_date
        ]
        const insertpunrabedn = `INSERT INTO bandi_punarabedan_details(
           bandi_id, punarabedan_office_id, punarabedan_office_district, punarabedan_office_ch_no, punarabedan_office_date) VALUES(?)`;
        await queryAsync(insertpunrabedn, [punrabednRecord])


        await commitAsync(); // Commit the transaction

        return res.json({
            Result: bandi_id,
            Status: true,
            message: "बन्दी विवरण सफलतापूर्वक सुरक्षित गरियो।"
        });

    } catch (error) {
        await rollbackAsync(); // Rollback the transaction if error occurs

        console.error("Transaction failed:", error);
        return res.status(500).json({
            Status: false,
            Error: error.message,
            message: "सर्भर त्रुटि भयो, सबै डाटा पूर्वस्थितिमा फर्काइयो।"
        });
    }
});


// bfd.fine_type, bfd.amount_fixed, bfd.amount_deposited, bfdo.office_name_with_letter_address AS deposited_office, bfdnd.district_name_np AS deposited_district,
// bfd.deposit_ch_no, bfd.deposit_date, bfd.deposit_amount

//Get Bandi Query:
const getBandiQuery1 = `
    SELECT b.id, b.bandi_type, b.nationality, b.bandi_name, b.gender, b.dob, b.dob_ad, b.age,b.married_status,b.photo_path, b.bandi_education, 
        b.height, b.weight,b.bandi_huliya, b.remarks, b.status AS bandi_status, b.is_active, b.bandi_activity_id,
        TIMESTAMPDIFF(YEAR, b.dob_ad, CURDATE()) AS current_age,  
        bmd.bandi_id,bmd.mudda_id, bmd.mudda_no, bmd.vadi, bmd.mudda_condition,bmd.mudda_phesala_antim_office_date,bmd.is_last_mudda, bmd.is_main_mudda , 
        m.mudda_name,
        nc.country_name_np, ns.state_name_np, nd.district_name_np, nci.city_name_np, ba.wardno, ba.bidesh_nagarik_address_details,
        p.payrole_reason, p.other_details, p.remark, p.status, p.user_id, p.current_office_id, p.id AS payrole_id, p.dopmremark,
        p.pyarole_rakhan_upayukat, p.payrole_no_id, p.is_checked,
        bpdo.office_name_with_letter_address AS punarabedan_office, bpdnd.district_name_np AS punarabedan_district, bpd.punarabedan_office_ch_no, punarabedan_office_date,
        bkd.hirasat_years, bkd.hirasat_months, bkd.hirasat_days, bkd.thuna_date_bs, bkd.release_date_bs,
        MAX(CASE WHEN bfd.fine_type = 'जरिवाना' THEN bfd.amount_fixed END) AS jariwana_fixed,
        MAX(CASE WHEN bfd.fine_type = 'जरिवाना' THEN bfd.amount_deposited END) AS deposited_jariwana,
        MAX(CASE WHEN bfd.fine_type = 'जरिवाना' THEN bfdo.office_name_with_letter_address END) AS deposited_jariwana_office,
        MAX(CASE WHEN bfd.fine_type = 'जरिवाना' THEN bfd.deposit_date END) AS deposited_jariwana_date,
        MAX(CASE WHEN bfd.fine_type = 'जरिवाना' THEN bfd.deposit_ch_no END) AS deposited_jariwana_ch_no,
        MAX(CASE WHEN bfd.fine_type = 'क्षतिपुर्ती' THEN bfd.amount_fixed END) AS compensation_fixed,
        MAX(CASE WHEN bfd.fine_type = 'क्षतिपुर्ती' THEN bfd.amount_deposited END) AS deposited_compensation,
        MAX(CASE WHEN bfd.fine_type = 'क्षतिपुर्ती' THEN bfdo.office_name_with_letter_address END) AS deposited_compensation_office,
        MAX(CASE WHEN bfd.fine_type = 'क्षतिपुर्ती' THEN bfd.deposit_date END) AS deposited_compensation_date,
        MAX(CASE WHEN bfd.fine_type = 'क्षतिपुर्ती' THEN bfd.deposit_ch_no END) AS deposited_compensation_ch_no,
        MAX(CASE WHEN bfd.fine_type = 'विगो तथा कोष' THEN bfd.amount_fixed END) AS bigo_fixed,
        MAX(CASE WHEN bfd.fine_type = 'विगो तथा कोष' THEN bfd.amount_deposited END) AS deposited_bigo,
        MAX(CASE WHEN bfd.fine_type = 'विगो तथा कोष' THEN bfdo.office_name_with_letter_address END) AS deposited_bigo_office,
        MAX(CASE WHEN bfd.fine_type = 'विगो तथा कोष' THEN bfd.deposit_date END) AS deposited_bigo_date,
        MAX(CASE WHEN bfd.fine_type = 'विगो तथा कोष' THEN bfd.deposit_ch_no END) AS deposited_bigo_ch_no,
        po.office_name_with_letter_address AS current_payrole_office
    FROM bandi_person b
    LEFT JOIN bandi_address ba ON b.id=ba.bandi_id
    LEFT JOIN np_country nc ON ba.nationality_id = nc.id
    LEFT JOIN np_state ns ON ba.province_id = ns.state_id
    LEFT JOIN np_district nd ON ba.district_id = nd.did
    LEFT JOIN np_city nci ON ba.gapa_napa_id = nci.cid
    LEFT JOIN bandi_mudda_details bmd ON b.id=bmd.bandi_id 
    LEFT JOIN muddas m ON bmd.mudda_id=m.id
    LEFT JOIN bandi_relative_info bri ON b.id=bri.bandi_id
    LEFT JOIN relationships r ON bri.relation_id=r.id
    LEFT JOIN bandi_punarabedan_details bpd ON b.id=bpd.bandi_id
    LEFT JOIN offices bpdo ON bpd.punarabedan_office_id=bpdo.id
    LEFT JOIN np_district bpdnd ON bpd.punarabedan_office_district =bpdnd.did
    LEFT JOIN bandi_kaid_details bkd ON b.id=bkd.bandi_id
    LEFT JOIN bandi_fine_details bfd ON b.id=bfd.bandi_id
    LEFT JOIN offices bfdo ON bfd.deposit_office=bfdo.id
    LEFT JOIN np_district bfdnd ON bfd.deposit_district =bfdnd.did
    LEFT JOIN payroles p ON b.id=p.bandi_id
    LEFT JOIN offices po ON p.current_office_id=po.id
    WHERE bmd.is_main_mudda=1
// `;

const getBandiQuery = `
    SELECT 
    b.id AS bandi_id,
    b.bandi_name,
    b.bandi_type,
    b.gender,
    b.dob,
    b.dob_ad,
    TIMESTAMPDIFF(YEAR, b.dob_ad, CURDATE()) AS current_age,
    b.status AS bandi_status,
    b.photo_path,
    b.is_active,

    -- Address
    ba.wardno,
    ba.bidesh_nagarik_address_details,
    nc.country_name_np,
    ns.state_name_np,
    nd.district_name_np,
    nci.city_name_np,

    -- Mudda Details
    bmd.mudda_no,
    bmd.mudda_id,
    bmd.vadi,
    bmd.mudda_condition,
    bmd.mudda_phesala_antim_office_date,
    bmd.is_main_mudda,
    m.mudda_name,

    -- Kaid Details
    bkd.hirasat_years,
    bkd.hirasat_months,
    bkd.hirasat_days,
    bkd.thuna_date_bs,
    bkd.release_date_bs,

    -- Punarabedan Details
    bpdo.office_name_with_letter_address,
    bpd.punarabedan_office_ch_no,
    bpd.punarabedan_office_date,

    -- Payrole
    p.id AS payrole_id,
    p.payrole_reason,
    p.other_details,
    p.remark,
    p.status AS payrole_status,
    p.user_id,
    p.current_office_id,
    p.payrole_no_id,
    p.payrole_entery_date,
    p.dopmremark,
    p.pyarole_rakhan_upayukat,
    po.office_name_with_letter_address AS current_payrole_office,

    -- Fine Summary
    fine_summary_table.fine_summary

FROM bandi_person b

LEFT JOIN bandi_address ba ON b.id = ba.bandi_id
LEFT JOIN np_country nc ON ba.nationality_id = nc.id
LEFT JOIN np_state ns ON ba.province_id = ns.state_id
LEFT JOIN np_district nd ON ba.district_id = nd.did
LEFT JOIN np_city nci ON ba.gapa_napa_id = nci.cid

LEFT JOIN bandi_mudda_details bmd ON b.id = bmd.bandi_id AND bmd.is_main_mudda = 1
LEFT JOIN muddas m ON bmd.mudda_id = m.id

LEFT JOIN bandi_kaid_details bkd ON b.id = bkd.bandi_id

LEFT JOIN bandi_punarabedan_details bpd ON b.id = bpd.bandi_id
LEFT JOIN offices BPDO ON bpd.punarabedan_office_id = bpdo.id

LEFT JOIN payroles p ON b.id = p.bandi_id
LEFT JOIN offices po ON p.current_office_id = po.id

-- Fine Summary Subquery
LEFT JOIN (
    SELECT 
        bandi_id,
        GROUP_CONCAT(
          DISTINCT CONCAT(
            fine_type, ': ', 
            amount_fixed, ' (तिरेको: ', 
            IFNULL(amount_deposited, '0'), 
            ', च.नं.: ', IFNULL(deposit_ch_no, 'N/A'), 
            ', कार्यालय: ', IFNULL(deposit_office, 'N/A'), 
            ')'
          ) 
          ORDER BY fine_type
          SEPARATOR ' | '
        ) AS fine_summary
    FROM bandi_fine_details bfd 
    LEFT JOIN offices bfdo ON bfdo.id=bfd.deposit_office 
    GROUP BY bandi_id
) AS fine_summary_table ON fine_summary_table.bandi_id = b.id

WHERE b.is_active = 1
`;



router.get('/get_bandi', async (req, res) => {
    con.query(getBandiQuery, (err, result) => {
        if (err) return res.json({ Status: false, Error: "Query Error" })
        return res.json({ Status: true, Result: result })
    })
})

router.get('/get_bandi/:id', async (req, res) => {
    const { id } = req.params;
    console.log('Fetching bandi with ID:', id);
    const sql = `${getBandiQuery} AND b.id =? `;
    con.query(sql, [id], (err, result) => {
        // console.log(result)
        if (err) {
            console.error('Query Error:', err);
            return res.json({ Status: false, Error: "Query Error" });
        }
        return res.json({ Status: true, Result: result });
    });
});

router.get('/get_bandi_name_for_select', async (req, res) => {
    // const active_office = req.user.office_id;
    // console.log(active_office)
    // const user_id = req.user.id;
    const sql = `SELECT bp.*, bp.id AS bandi_id, bp.id AS bandi_office_id, m.mudda_name from bandi_person bp
                LEFT JOIN bandi_mudda_details bmd ON bp.id=bmd.bandi_id
                LEFT JOIN muddas m ON bmd.mudda_id=m.id
                WHERE bmd.is_main_mudda=1 `;
    try {
        const result = await queryAsync(sql); // Use promise-wrapped query

        if (result.length === 0) {
            return res.json({ Status: false, Error: "Bandi not found for select" });
        }
        const bandi = result[0];
        // 🟢 Calculate age from BS DOB
        const age = await calculateAge(bandi.dob); // Assuming dob is BS like '2080-01-10'
        bandi.age = age;
        // console.log(age)
        return res.json({ Status: true, Result: bandi });
    } catch (err) {
        console.error(err);
        return res.json({ Status: false, Error: "Query Error" });
    }
})

router.get('/get_bandi_name_for_select/:id', async (req, res) => {
    const { id } = req.params;
    const sql = `SELECT bp.*,bp.id AS bandi_id, bp.id AS bandi_office_id, m.mudda_name from bandi_person bp
                LEFT JOIN bandi_mudda_details bmd ON bp.id=bmd.bandi_id
                LEFT JOIN muddas m ON bmd.mudda_id=m.id
                WHERE bmd.is_main_mudda=1 AND bp.current_office_id=?`;
    try {
        const result = await queryAsync(sql, [id]); // Use promise-wrapped query
        // console.log('id', result)

        if (result.length === 0) {
            return res.json({ Status: false, Error: "Bandi not found for select" });
        }
        return res.json({ Status: true, Result: result });
    } catch (err) {
        console.error(err);
        return res.json({ Status: false, Error: "Query Error" });
    }
})

router.get('/get_selected_bandi/:id', async (req, res) => {
    const { id } = req.params;
    const sql = `
        SELECT b.*, bm.*, m.mudda_name 
        FROM bandies b
        LEFT JOIN bandi_mudda bm ON b.id = bm.bandi_id 
        LEFT JOIN muddas m ON bm.mudda_id = m.id
        WHERE b.id = ? AND bm.is_main = 1
    `;

    try {
        const result = await queryAsync(sql, [id]); // Use promise-wrapped query

        if (result.length === 0) {
            return res.json({ Status: false, Error: "Bandi not found" });
        }
        const bandi = result[0];
        // 🟢 Calculate age from BS DOB
        const age = await calculateAge(bandi.dob); // Assuming dob is BS like '2080-01-10'
        bandi.age = age;
        // console.log(age)
        return res.json({ Status: true, Result: bandi });
    } catch (err) {
        console.error(err);
        return res.json({ Status: false, Error: "Query Error" });
    }
});

router.get('/get_bandi_family/:id', async (req, res) => {
    const { id } = req.params;
    const sql = `
        SELECT bri.* , r.relation_np
        FROM bandi_relative_info bri
        LEFT JOIN relationships r ON bri.relation_id = r.id
        WHERE bandi_id = ?
    `;

    try {
        const result = await queryAsync(sql, [id]); // Use promise-wrapped query
        // console.log(result)
        if (result.length === 0) {
            return res.json({ Status: false, Error: "Bandi Family not found" });
        }
        return res.json({ Status: true, Result: result });
    } catch (err) {
        console.error(err);
        return res.json({ Status: false, Error: "Query Error" });
    }
});

router.post('/create_bandi_family', verifyToken, async (req, res) => {
    const active_office = req.user.office_id;
    const user_id = req.user.id;
    // console.log('activeoffice:', active_office, ',', 'user_id:',user_id)
    // console.log(req.body)
    const {
        office_bandi_id, bandi_name, bandi_relative_address, bandi_relative_contact_no, bandi_relative_name, bandi_relative_relation, bandi_number_of_children
    } = req.body;


    try {
        await beginTransactionAsync();
        let sql = ''
        let values = ''
        if (bandi_number_of_children) {
            values = [bandi_name, bandi_relative_relation, bandi_number_of_children]
            sql = `
            INSERT INTO bandi_relative_info(
        bandi_id, relation_id, no_of_children) VALUES(?)`;
        } else {
            values = [bandi_name, bandi_relative_name, bandi_relative_relation, bandi_relative_address, bandi_relative_contact_no];
            sql = `
            INSERT INTO bandi_relative_info(
            bandi_id, relative_name, relation_id, relative_address, contact_no) VALUES(?)`;
        }


        const result = await queryAsync(sql, [values]);
        const bandi_id = result.insertId;

        await commitAsync(); // Commit the transaction

        return res.json({
            Result: bandi_id,
            Status: true,
            message: "बन्दी विवरण सफलतापूर्वक सुरक्षित गरियो।"
        });

    } catch (error) {
        await rollbackAsync(); // Rollback the transaction if error occurs

        console.error("Transaction failed:", error);
        return res.status(500).json({
            Status: false,
            Error: error.message,
            message: "सर्भर त्रुटि भयो, सबै डाटा पूर्वस्थितिमा फर्काइयो।"
        });
    }
});

router.get('/get_bandi_id_card/:id', async (req, res) => {
    const { id } = req.params;
    const sql = `
        SELECT bid.*, git.govt_id_name_np 
        FROM bandi_id_card_details bid
        LEFT JOIN govt_id_types git ON bid.card_type_id = git.id
        WHERE bandi_id = ?
    `;

    try {
        const result = await queryAsync(sql, [id]); // Use promise-wrapped query
        // console.log(result)
        if (result.length === 0) {
            return res.json({ Status: false, Error: "Bandi ID not found" });
        }
        return res.json({ Status: true, Result: result });
    } catch (err) {
        console.error(err);
        return res.json({ Status: false, Error: "Query Error" });
    }
});

router.get('/get_bandi_mudda/', async (req, res) => {
    const { id } = req.params;
    const sql = `
        SELECT bmd.*, m.mudda_name,
    o.office_name_with_letter_address,
    nd.district_name_np
        FROM bandi_mudda_details bmd
        LEFT JOIN muddas m ON bmd.mudda_id = m.id
        LEFT JOIN offices o ON bmd.mudda_phesala_antim_office_id = o.id
        LEFT JOIN np_district nd ON bmd.mudda_phesala_antim_office_district = nd.did

    `;

    try {
        const result = await queryAsync(sql, [id]); // Use promise-wrapped query
        // console.log(result)
        if (result.length === 0) {
            return res.json({ Status: false, Error: "Bandi ID not found" });
        }
        return res.json({ Status: true, Result: result });
    } catch (err) {
        console.error(err);
        return res.json({ Status: false, Error: "Query Error" });
    }
});

router.get('/get_bandi_mudda/:id', async (req, res) => {
    const { id } = req.params;
    const sql = `
        SELECT bmd.*, m.mudda_name,
    o.office_name_with_letter_address,
    nd.district_name_np
        FROM bandi_mudda_details bmd
        LEFT JOIN muddas m ON bmd.mudda_id = m.id
        LEFT JOIN offices o ON bmd.mudda_phesala_antim_office_id = o.id
        LEFT JOIN np_district nd ON bmd.mudda_phesala_antim_office_district = nd.did
        WHERE bandi_id = ?
    `;

    try {
        const result = await queryAsync(sql, [id]); // Use promise-wrapped query
        // console.log(result)
        if (result.length === 0) {
            return res.json({ Status: false, Error: "Bandi ID not found" });
        }
        return res.json({ Status: true, Result: result });
    } catch (err) {
        console.error(err);
        return res.json({ Status: false, Error: "Query Error" });
    }
});

router.get('/get_bandi_fine/:id', async (req, res) => {
    const { id } = req.params;
    const sql = `
        SELECT bfd.*,
    o.office_name_nep,
    nd.district_name_np
        FROM bandi_fine_details bfd
        LEFT JOIN offices o ON bfd.deposit_office = o.id
        LEFT JOIN np_district nd ON bfd.deposit_district = nd.did
        WHERE bandi_id = ?
    `;

    try {
        const result = await queryAsync(sql, [id]); // Use promise-wrapped query
        // console.log(result)
        if (result.length === 0) {
            return res.json({ Status: false, Error: "Bandi ID not found" });
        }
        return res.json({ Status: true, Result: result });
    } catch (err) {
        console.error(err);
        return res.json({ Status: false, Error: "Query Error" });
    }
});

router.put('/update_bandi_fine/:id', verifyToken, async (req, res) => {
    const id = req.params.id;
    const user_office_id = req.user.office_id
    const user_id = req.user.id
    const {
        amount_fixed, amount_deposited, deposit_office, deposit_district, deposit_ch_no, deposit_date,
        deposit_amount, district_name_np, fine_type
    } = req.body;
    // console.log(req.body)
    const updated_by = 1;
    const sql = `UPDATE bandi_fine_details SET amount_fixed =?, amount_deposited =?, deposit_office =?, deposit_district =?, deposit_ch_no =?,
    deposit_date =?, deposit_amount =? WHERE id =? `;
    const values = [
        amount_fixed, amount_deposited, deposit_office, deposit_district, deposit_ch_no, deposit_date,
        deposit_amount, id
    ];
    try {
        const result = await query(sql, values);
        console.log(result)
        return res.json({ Status: true, Result: result });
    } catch (err) {
        console.error('Database error', err);
        return res.status(500).json({ Status: false, Error: 'Internal Server Error' });
    }
})

router.delete('/delete_bandi_fine/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    console.log(id)
    try {
        const sql = `DELETE FROM bandi_fine_details WHERE id =? `;
        const result = await query(sql, id);
        return res.json({ Status: true, Result: 'Record Deleted Successfully!' });
    } catch (err) {
        console.error('Error Deleting Record:', err);
        return res.status(500).json({ Status: false, Error: 'Internal Server Error' });
    }
})

router.get('/get_bandi_punrabedn/:id', async (req, res) => {
    const { id } = req.params;
    const sql = `
        SELECT bpd.*,
    o.office_name_with_letter_address,
    nd.district_name_np
        FROM bandi_punarabedan_details bpd
        LEFT JOIN offices o ON bpd.punarabedan_office_id = o.id
        LEFT JOIN np_district nd ON bpd.punarabedan_office_district = nd.did
        WHERE bandi_id = ?
    `;

    try {
        const result = await queryAsync(sql, [id]); // Use promise-wrapped query
        // console.log(result)
        if (result.length === 0) {
            return res.json({ Status: false, Error: "Bandi ID not found" });
        }
        return res.json({ Status: true, Result: result });
    } catch (err) {
        console.error(err);
        return res.json({ Status: false, Error: "Query Error" });
    }
});

router.put('/update_bandi_punrabedn/:id', verifyToken, async (req, res) => {
    const id = req.params.id;
    const user_office_id = req.user.office_id
    const user_id = req.user.id
    const {
        punarabedan_office_id, punarabedan_office_district, punarabedan_office_ch_no, punarabedan_office_date
    } = req.body;
    // console.log(req.body)
    // const updated_by = 1;
    const sql = `UPDATE bandi_punarabedan_details SET punarabedan_office_id =?,
    punarabedan_office_district =?, punarabedan_office_ch_no =?, punarabedan_office_date =?,
    updated_by =?, current_office_id =? WHERE id =? `;
    const values = [
        punarabedan_office_id, punarabedan_office_district, punarabedan_office_ch_no, punarabedan_office_date, user_id, user_office_id, id
    ];
    try {
        const result = await query(sql, values);
        console.log(result)
        return res.json({ Status: true, Result: result });
    } catch (err) {
        console.error('Database error', err);
        return res.status(500).json({ Status: false, Error: 'Internal Server Error' });
    }
})


router.post('/create_payrole', verifyToken, async (req, res) => {
    const active_office = req.user.office_id;
    const user_id = req.user.id;
    const {
        bandi_id, payrole_no, payrole_count_date, payrole_entry_date, other_details,
        payrole_reason, payrole_remarks, payrole_niranay_no, payrole_decision_date,
        payrole_granted_letter_no, payrole_granted_letter_date, pyarole_rakhan_upayukat,
        dopmremark
    } = req.body;

    console.log('bandi_id', bandi_id)
    let payrole_no_bandi_id = '';
    if (bandi_id && payrole_no) {
        let payrole_no_bandi = String(payrole_no) + String(bandi_id);
        payrole_no_bandi_id = payrole_no_bandi
    }

    try {
        await beginTransactionAsync();

        let sql = '';
        let values = [];

        if (payrole_niranay_no) {
            // FIX or remove this block if irrelevant
            // Assuming you want to insert into another table
            // values = [bandi_id, relation_id, no_of_children]; // define those variables properly
            // sql = `INSERT INTO bandi_relative_info(bandi_id, relation_id, no_of_children) VALUES(?, ?, ?)`;
            // await queryAsync(sql, values);
        } else {
            values = [
                payrole_no_bandi_id,
                payrole_count_date,
                payrole_entry_date,
                payrole_reason,
                other_details,
                payrole_remarks,
                0, // status
                payrole_no,
                bandi_id,
                user_id,
                active_office
            ];
            sql = `
                INSERT INTO payroles(
        payrole_no_bandi_id, ganana_date, payrole_entery_date, payrole_reason,
        other_details, remark, status, payrole_no_id, bandi_id, user_id, current_office_id
    ) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

            const result = await queryAsync(sql, values);
            const inserted_id = result.insertId;
            console.log(inserted_id)
            await commitAsync();

            return res.json({
                // Result: inserted_id,
                Status: true,
                message: "बन्दी विवरण सफलतापूर्वक सुरक्षित गरियो।"
            });
        }

    } catch (error) {
        await rollbackAsync();
        console.error("Transaction failed:", error);
        return res.status(500).json({
            Status: false,
            Error: error.message,
            message: "सर्भर त्रुटि भयो, सबै डाटा पूर्वस्थितिमा फर्काइयो।"
        });
    }
});

router.get('/get_payroles/', verifyToken, async (req, res) => {
    const active_office = req.user.office_id;
    const user_id = req.user.id;

    let sql;

    if (active_office == 1 || active_office == 2) {
        // Admin – see all payrole records (only those with payrole_no_id)
        sql = `
SELECT * FROM(
    ${getBandiQuery}
) AS sub
            WHERE sub.payrole_no_id IS NOT NULL

    `;
    } else {
        // Non-admin – only those in their office
        sql = `
SELECT * FROM(
    ${getBandiQuery}
) AS sub
            WHERE sub.payrole_no_id IS NOT NULL AND sub.current_office_id = ?

    `;
    }

    try {
        const result = await queryAsync(sql, active_office == 1 || active_office == 2 ? [] : [active_office]);
        if (result.length === 0) {
            return res.json({ Status: false, Error: "No payrole records found" });
        }
        return res.json({ Status: true, Result: result });
    } catch (err) {
        console.error(err);
        return res.json({ Status: false, Error: "Query Error" });
    }
});


router.put('/update_payrole/:id', verifyToken, async (req, res) => {
    const id = req.params.id;
    // console.log('payrole_id', id)
    const user_office_id = req.user.office_id
    const user_id = req.user.id
    const {
        dopmremark, pyarole_rakhan_upayukat, payrole_id
    } = req.body;
    // console.log('dopmremark',status)
    console.log(req.body)
    const updated_by = 1;
    const sql = `UPDATE payroles SET dopmremark =?, pyarole_rakhan_upayukat =? WHERE id =?; `;
    const values = [
        dopmremark, pyarole_rakhan_upayukat, id
    ];
    try {
        const result = await query(sql, values);
        // console.log(result)
        return res.json({ Status: true, Result: result });
    } catch (err) {
        console.error('Database error', err);
        return res.status(500).json({ Status: false, Error: 'Internal Server Error' });
    }
})
router.put('/update_is_payrole_checked/:id', verifyToken, async (req, res) => {
    const id = req.params.id;
    console.log('payrole_id', id)
    const user_office_id = req.user.office_id
    const user_id = req.user.id
    const {
        is_checked
    } = req.body;
    // console.log('dopmremark',status)
    console.log(req.body)
    const updated_by = 1;
    const sql = `UPDATE payroles SET is_checked =? WHERE id =?; `;
    const values = [
        is_checked, id
    ];
    try {
        const result = await query(sql, values);
        // console.log(result)
        return res.json({ Status: true, Result: result });
    } catch (err) {
        console.error('Database error', err);
        return res.status(500).json({ Status: false, Error: 'Internal Server Error' });
    }
})



router.get('/kasur_data', verifyToken, async (req, res) => {
    const active_office = req.user.office;
    // console.log('kasur_office', active_office)
    if (!active_office) {
        return res.json({ Status: false, Error: "Office ID is missing in token. Please relogin" });
    }
    const sql = `SELECT dk.*, tp.name_np AS kasur_np, tp.name_en AS kasur_en 
            FROM tango_daily_kasur dk
            LEFT JOIN tango_punishment_list tp 
            ON dk.kasur_id = tp.id
            WHERE office_id =?
    ORDER BY dk.id desc
            `;
    con.query(sql, [active_office], (err, result) => {
        if (err) {
            console.error('Error fetching kasur data:', err);
            return res.json({ Status: false, Error: "Query Error" })
        }
        return res.json({ Status: true, Result: result })
    })
})

router.delete('/delete_kasurs/:id', async (req, res) => {
    const { id } = req.params;
    // console.log(id)
    try {
        const sql = `DELETE FROM tango_daily_kasur WHERE id =? `;
        const result = await query(sql, id);
        return res.json({ Status: true, Result: 'Record Deleted Successfully!' });
    } catch (err) {
        console.error('Error Deleting Record:', err);
        return res.status(500).json({ Status: false, Error: 'Internal Server Error' });
    }
})

router.get('/search_kasur', (req, res) => {
    const todaydate = currentDate
    // const todaydate='2081-07-08'
    const { date, type } = req.query; // Extract query parameters

    // Base SQL query with joins
    let sql = `
        SELECT dk.*, tp.*, o.*
    FROM tango_daily_kasur dk 
        LEFT JOIN tango_punishment tp ON dk.kasur_id = tp.id 
        LEFT JOIN office o ON dk.office_id = o.o_id 
        WHERE 1 = 1
    `;
    const values = [];

    // Add conditions based on received parameters
    if (date) {
        sql += ' AND dk.date = ?';
        values.push(date);
    } else {
        sql += ' AND dk.date = ?';
        values.push(todaydate);
    }

    if (type) {
        sql += ' AND dk.punishment_id = ?'; // Adjust according to your schema
        values.push(type);
    }

    // Log the final query for debugging
    // console.log('Executing SQL:', sql);
    // console.log('With Params:', values);

    // Execute the query
    con.query(sql, values, (error, results) => {
        if (error) {
            console.error('Database query error:', error);
            return res.status(500).json({ Status: false, Error: 'Database query failed.' });
        }

        if (results.length > 0) {
            return res.json({ Status: true, Result: results });
        } else {
            return res.json({ Status: false, Error: 'No records found.' });
        }
    });
});

router.get('/search_rajashwa', (req, res) => {
    const todaydate = currentDate
    // const todaydate='2081-07-15'
    const { date, type } = req.query; // Extract query parameters

    // Base SQL query with joins
    let sql = `
        SELECT dk.*, tp.*, o.*
    FROM tango_punishment_data dk 
        LEFT JOIN tango_vehicles tp ON dk.vehicle_id = tp.id 
        LEFT JOIN office o ON dk.office_id = o.o_id 
        WHERE 1 = 1
    `;
    const values = [];

    // Add conditions based on received parameters
    if (date) {
        sql += ' AND dk.date = ?';
        values.push(date);
    } else {
        sql += ' AND dk.date = ?';
        values.push(todaydate);
    }

    if (type) {
        sql += ' AND dk.vehicle_id = ?'; // Adjust according to your schema
        values.push(type);
    }

    // Log the final query for debugging
    // console.log('Executing SQL:', sql);
    // console.log('With Params:', values);

    // Execute the query
    con.query(sql, values, (error, results) => {
        if (error) {
            console.error('Database query error:', error);
            return res.status(500).json({ Status: false, Error: 'Database query failed.' });
        }

        if (results.length > 0) {
            return res.json({ Status: true, Result: results });
        } else {
            return res.json({ Status: false, Error: 'No records found.' });
        }
    });
});



//Fetch Individual User
router.get('/users', verifyToken, (req, res) => {
    const active_branch = req.userBranch;
    // console.log('bid', active_branch)
    const sql =
        `SELECT u.*, ut.ut_name AS usertype, o.office_name AS office_name, b.branch_name, o.o_id as office_id
        FROM users u
        JOIN usertypes ut ON u.usertype = ut.utid
        INNER JOIN office o ON u.office_id = o.o_id
        INNER JOIN branch b ON u.branch_id = b.bid
        WHERE branch_id = ?
    `;
    // INNER JOIN office_branch ob ON u.branch=ob.bid
    con.query(sql, active_branch, (err, result) => {
        if (err) return res.json({ Status: false, Error: "Query Error" })
        return res.json({ Status: true, Result: result })
    })
})

export { router as bandiRouter }