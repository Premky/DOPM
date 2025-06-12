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

// Nepali to English date conversion
async function bs2ad1(date) {
    const bsdob = new NepaliDate(date)
    const addob = bsdob.formatEnglishDate('YYYY-MM-DD')
    return addob;
}

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
            `SELECT office_bandi_id FROM bandies WHERE office_bandi_id = ?`,
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
    console.log(req.body)
    const rand_bandi_id = await generateUniqueBandiId();

    console.log('chkrandom:', rand_bandi_id);
    const {
        cn, cn_date, regd, regd_date, file, dakhila_date, entry_type, bandi_type, bandi_name, gender, bandi_dob, nagrik, nationality, arrest_date,
        kaid_date, release_date, kaid_duration, beruju_duration, last_faisala_date, no_punaravedn_district, no_punravedn_cn,
        remarks, office, last_faisala_office, no_punaravedn_office, no_punravedn_date,
        state_id, district_id, municipality_id, ward, bideshi_nagrik_address,
        is_fine, fine_amt, is_fine_paid, fine_paid_office_district, fine_paid_cn, fine_paid_date, fine_paid_office,
        is_compensation, compensation_amt, is_compensation_paid, compensation_paid_office_district, compensation_paid_cn, compensation_paid_date, compensation_paid_office,
        is_bigo, bigo_amt, is_bigo_paid, bigo_paid_office_district, bigo_paid_cn, bigo_paid_date, bigo_paid_office
    } = req.body;
    const age = await calculateAge(bandi_dob);

    const bandiRecord = [
        regd, regd_date, entry_type, bandi_type, nagrik, nationality, bandi_name, gender,
        bandi_dob, age, district_id, state_id, municipality_id, ward, bideshi_nagrik_address,
        arrest_date, kaid_date, release_date, last_faisala_office, "last_faisala_district", last_faisala_date,
        no_punaravedn_office, no_punaravedn_district, no_punravedn_cn, no_punravedn_date,
        is_fine, is_compensation, is_bigo,
        remarks
    ];
    // , office, active_office, user_id
    // DATE_FORMAT(FROM_DAYS(DATEDIFF(NOW(), pi.dob_ad)), '%Y')+0 AS age

    try {
        await beginTransactionAsync();
        // 1. Insert into bandi_records
        const insertBandiInfoSQL = `
        INSERT INTO bandies (office_bandi_id, entry_date, entry_type, bandi_type_id, citizen_id,nationality_id,bandi_name,gender,
        dob,age,district_id,province,gapa_napa_id,wardno,bidesh_nagarik_address_details,arrest_date,kaid_date,
        release_date, mudda_phesala_antim_office_name,
        mudda_phesala_antim_office_district,
        mudda_phesala_antim_office_date, punarabedan_office_name,punarabedan_office_district,
        punarabedan_office_ch_no,punarabedan_office_date,jariwana_amount_fixed,
        kashtipurti_amount_fixed,
        bigo_and_kosh_amount_fixed,
        remarks) VALUES (?)`;

        // INSERT INTO bandies (
        //     date, state_id, district_id, municipality_id, ward, road_name,
        //     accident_location, accident_time, death_male, death_female, death_boy, death_girl, death_other,
        //     gambhir_male, gambhir_female, gambhir_boy, gambhir_girl, gambhir_other,
        //     general_male, general_female, general_boy, general_girl, general_other,
        //     animal_death, animal_injured, est_amount, damage_vehicle, txt_accident_reason, remarks, office_id, created_by
        //     ) VALUES (?)`;

        const bandiResult = await queryAsync(insertBandiInfoSQL, [bandiRecord]);
        const bandi_id = bandiResult.insertId;

        //2. Insert into fine table 
        const fineRecord = [
            bandi_id, 1, fine_amt, is_fine_paid, fine_paid_office_district, fine_paid_cn, fine_paid_date, fine_paid_office,
        ]
        const compensationRecord = [
            bandi_id, 2, compensation_amt, is_compensation_paid, compensation_paid_office_district, compensation_paid_cn, compensation_paid_date, compensation_paid_office,
        ]
        const bigoRecord = [
            bandi_id, 3, bigo_amt, is_bigo_paid, bigo_paid_office_district, bigo_paid_cn, bigo_paid_date, bigo_paid_office
        ]

        const insertFines = `INSERT INTO bandi_fine_table(bandi_id, fine_type_id, amount, is_paid,  
                            paid_district_id, paid_cn, paid_date, paid_office_id) VALUES(?,?,?,?,?,?,?,?)`;

        await queryAsync(insertFines, fineRecord)
        await queryAsync(insertFines, compensationRecord)
        await queryAsync(insertFines, bigoRecord)

        // 3. Insert involved vehicles
        const muddaEntries = Object.entries(req.body).filter(([key]) =>
            key.startsWith("mudda_")
        );

        for (const [key, bandi_id] of muddaEntries) {
            const muddaIndex = key.split('_')[2];
            const muddaKey = `mudda_${muddaIndex}`;
            const mudda = req.body[muddaKey] || "";
            const mudda_noKey = `mudda_no_${muddaIndex}`;
            const mudda_no = req.body[mudda_noKey] || "";
            const vadiKey = `vadi_${muddaIndex}`;
            const vadi = req.body[vadiKey] || "";
            const is_mainKey = `is_main_mudda_${muddaIndex}`;
            const is_main_mudda = req.body[is_mainKey] || "";

            const insertMuddaSQL = `
                INSERT INTO bandi_mudda (
                    bandi_id, mudda_id,mudda_no, wadi, is_main
                ) VALUES (?, ?, ?,?, ?)`;
            await queryAsync(insertMuddaSQL, [bandi_id, mudda, mudda_no, vadi, is_main_mudda]);
        }

        await commitAsync(); // Commit the transaction

        return res.json({
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

router.get('/get_bandi', async (req, res) => {
    const sql = `SELECT b.*, bm.*, m.mudda_name FROM bandies b
                LEFT JOIN bandi_mudda bm ON b.id=bm.bandi_id 
                LEFT JOIN muddas m ON bm.mudda_id=m.id
                WHERE bm.is_main=1`;
    con.query(sql, (err, result) => {
        if (err) return res.json({ Status: false, Error: "Query Error" })
        return res.json({ Status: true, Result: result })
    })
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


router.put('/update_vehicle/:id', async (req, res) => {
    const id = req.params.id;
    const {
        vehicle_np, vehicle_en
    } = req.body;
    const updated_by = 1;
    const sql = `UPDATE tango_vehicles SET name_np=?, name_en=?  WHERE id=?`;
    const values = [
        vehicle_np, vehicle_en, id
    ];
    try {
        const result = await query(sql, values);
        return res.json({ Status: true, Result: result });
    } catch (err) {
        console.error('Database error', err);
        return res.status(500).json({ Status: false, Error: 'Internal Server Error' });
    }
})

router.delete('/delete_vehicle/:id', async (req, res) => {
    const { id } = req.params;
    console.log(id)
    try {
        const sql = `DELETE FROM tango_vehicles WHERE id=?`;
        const result = await query(sql, id);
        return res.json({ Status: true, Result: 'Record Deleted Successfully!' });
    } catch (err) {
        console.error('Error Deleting Record:', err);
        return res.status(500).json({ Status: false, Error: 'Internal Server Error' });
    }
})


//Rajashwa Sirshak hru
router.get('/rajashwa_data', async (req, res) => {
    const sql = `SELECT tp.*, tv.* 
            FROM tango_punishment_data tp
            LEFT JOIN tango_vehicles tv 
            ON tp.vehicle_id= tv.id
            ORDER BY tp.id desc
            `;
    con.query(sql, (err, result) => {
        if (err) return res.json({ Status: false, Error: "Query Error" })
        return res.json({ Status: true, Result: result })
    })
})

router.post('/add_rajashwa', verifyToken, async (req, res) => {
    const active_office = req.user.office;
    const user_id = req.userId;
    // const active_office = 1;
    console.log(active_office)
    const {
        date, vehicle_id, count, fine,
    } = req.body;

    const created_by = user_id; // Adjust this to dynamically handle creator if needed
    console.log('created_by', created_by)

    const sql = `INSERT INTO tango_punishment_data (
        date, vehicle_id, count, fine, office_id, created_by
    ) VALUES (?)`;

    const values = [
        date, vehicle_id, count, fine, active_office, created_by,
    ];

    try {
        const result = await query(sql, [values]);
        return res.json({ Status: true, Result: result });
    } catch (err) {
        console.error('Database error', err);
        return res.status(500).json({ Status: false, Error: 'Internal Server Error' });
    }
});

router.put('/update_rajashwa/:id', verifyToken, async (req, res) => {
    const active_office = req.userOffice;
    const id = req.params.id;
    const {
        vehicle_id, count, fine, date,
    } = req.body;
    const updated_by = active_office;
    console.log('updated_by', updated_by)
    const sql = `UPDATE tango_punishment_data SET vehicle_id=?, count=?, fine=?,date=?, updated_by=? WHERE id=?`;
    const values = [
        vehicle_id, count, fine, date, updated_by, id
    ];

    try {
        const result = await query(sql, values);
        return res.json({ Status: true, Result: result });
    } catch (err) {
        console.error('Database error', err);
        return res.status(500).json({ Status: false, Error: 'Internal Server Error' });
    }
})

router.delete('/delete_rajashwa/:id', async (req, res) => {
    const { id } = req.params;
    console.log(id)
    try {
        const sql = `DELETE FROM tango_punishment_data WHERE id=?`;
        const result = await query(sql, id);
        return res.json({ Status: true, Result: 'Record Deleted Successfully!' });
    } catch (err) {
        console.error('Error Deleting Record:', err);
        return res.status(500).json({ Status: false, Error: 'Internal Server Error' });
    }
})

//कसुरका विवरणहरुः नाम सुची
router.post('/add_kasur', async (req, res) => {
    const active_office = req.userOffice;
    const user_id = req.userId;

    const {
        name_np, name_en
    } = req.body;

    const created_by = user_id; // Adjust this to dynamically handle creator if needed
    console.log(created_by)

    const sql = `INSERT INTO tango_punishment (
        name_np, name_en
    ) VALUES (?)`;

    const values = [
        name_np, name_en
    ];

    try {
        const result = await query(sql, [values]);
        return res.json({ Status: true, Result: result });
    } catch (err) {
        console.error('Database error', err);
        return res.status(500).json({ Status: false, Error: 'Internal Server Error' });
    }
});

router.put('/update_kasur/:id', async (req, res) => {
    const id = req.params.id;
    const {
        name_np, name_en
    } = req.body;
    const updated_by = 1;
    const sql = `UPDATE tango_punishment SET name_np=?, name_en=?  WHERE id=?`;
    const values = [
        name_np, name_en, id
    ];
    try {
        const result = await query(sql, values);
        return res.json({ Status: true, Result: result });
    } catch (err) {
        console.error('Database error', err);
        return res.status(500).json({ Status: false, Error: 'Internal Server Error' });
    }
})

router.delete('/delete_kasur/:id', async (req, res) => {
    const { id } = req.params;
    console.log(id)
    try {
        const sql = `DELETE FROM tango_punishment WHERE id=?`;
        const result = await query(sql, id);
        return res.json({ Status: true, Result: 'Record Deleted Successfully!' });
    } catch (err) {
        console.error('Error Deleting Record:', err);
        return res.status(500).json({ Status: false, Error: 'Internal Server Error' });
    }
})


//For Kasur
router.get('/kashurs', async (req, res) => {
    const sql = `SELECT * FROM tango_punishment_list`;
    con.query(sql, (err, result) => {
        if (err) return res.json({ Status: false, Error: "Query Error" })
        return res.json({ Status: true, Result: result })
    })
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
            ON dk.kasur_id= tp.id
            WHERE office_id=?
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

router.post('/add_kasurs', verifyToken, async (req, res) => {
    const active_office = req.user.office;
    const user_id = req.user.username;

    const {
        date, kasur_id, count, fine
    } = req.body;

    const created_by = user_id; // Adjust this to dynamically handle creator if needed
    console.log(created_by)

    const sql = `INSERT INTO tango_daily_kasur (
        date, kasur_id, count, fine, office_id, created_by
    ) VALUES (?)`;

    const values = [
        date, kasur_id, count, fine, active_office, created_by,
    ];

    try {
        const result = await query(sql, [values]);
        return res.json({ Status: true, Result: result });
    } catch (err) {
        console.error('Database error', err);
        return res.status(500).json({ Status: false, Error: 'Internal Server Error' });
    }
});

router.put('/update_kasurs/:id', verifyToken, async (req, res) => {
    const active_office = req.user.office;
    const id = req.params.id;
    const {
        kasur_id, count, fine, date
    } = req.body;
    const updated_by = req.user.username;
    const sql = `UPDATE tango_daily_kasur SET kasur_id=?,count=?, fine=?, date=?, updated_by=? WHERE id=?`;
    const values = [
        kasur_id, count, fine, date, updated_by, id
    ];

    try {
        const result = await query(sql, values);
        return res.json({ Status: true, Result: result });
    } catch (err) {
        console.error('Database error', err);
        return res.status(500).json({ Status: false, Error: 'Internal Server Error' });
    }
})

router.delete('/delete_kasurs/:id', async (req, res) => {
    const { id } = req.params;
    // console.log(id)
    try {
        const sql = `DELETE FROM tango_daily_kasur WHERE id=?`;
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
        WHERE 1=1
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
        WHERE 1=1
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

router.post('/add_arrested_vehcile', verifyToken, async (req, res) => {
    const active_office = req.userOffice;
    const user_id = req.userId;

    const {
        date, rank_id, name, vehicle_no, kasur_id, owner, contact, voucher,
        return_date, return_name, return_address, return_contact, remarks
    } = req.body;

    const created_by = user_id; // Adjust this to dynamically handle creator if needed
    console.log(created_by)

    const sql = `INSERT INTO tango_arrest_vehicle (
        date, rank_id, name, vehicle_no, kasur_id, owner, contact, voucher,
        return_date, return_name, return_address, return_contact, remarks, office_id, created_by
    ) VALUES (?)`;

    const values = [
        date, rank_id, name, vehicle_no, kasur_id, owner, contact, voucher,
        return_date, return_name, return_address, return_contact, remarks, active_office, created_by
    ];

    try {
        const result = await query(sql, [values]);
        return res.json({ Status: true, Result: result });
    } catch (err) {
        console.error('Database error', err);
        return res.status(500).json({ Status: false, Error: 'Internal Server Error' });
    }
});

router.get('/arrest_vehicle', verifyToken, async (req, res) => {
    const active_office = req.userOffice;
    // console.log('kasur_office', active_office)

    const sql = `SELECT tav.*, tp.*
                FROM tango_arrest_vehicle tav
                LEFT JOIN tango_punishment tp 
                ON tav.kasur_id = tp.id
                WHERE office_id=?                
                `;
    con.query(sql, active_office, (err, result) => {
        if (err) return res.json({ Status: false, Error: "Query Error" })
        return res.json({ Status: true, Result: result })
    })
})

router.put('/update_arrest_vehicle/:id', verifyToken, async (req, res) => {
    const user_id = req.userId;
    const id = req.params.id;  //Received Via URL
    // console.log('id:',id, 'user',user_id)

    const {
        date, rank_id, name, vehicle_no, kasur_id, owner, contact, voucher,
        return_date, return_name, return_address, return_contact, remarks
    } = req.body;

    const sql = `UPDATE tango_arrest_vehicle 
        SET 
        date = ?, rank_id = ?, name = ?, vehicle_no = ?, 
        kasur_id = ?, owner = ?, contact = ?, voucher = ?, 
        return_date = ?, return_name = ?, return_address = ?, 
        return_contact = ?, remarks = ?, updated_by = ? 
    WHERE sn = ?`;

    const values = [
        date, rank_id, name, vehicle_no, kasur_id, owner, contact, voucher,
        return_date, return_name, return_address, return_contact, remarks,
        user_id, id
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

router.delete('/delete_arrest_vehicle/:id', async (req, res) => {
    const { id } = req.params;
    console.log(id)
    try {
        const sql = `DELETE FROM tango_arrest_vehicle WHERE sn=?`;
        const result = await query(sql, id);
        return res.json({ Status: true, Result: 'Record Deleted Successfully!' });
    } catch (err) {
        console.error('Error Deleting Record:', err);
        return res.status(500).json({ Status: false, Error: 'Internal Server Error' });
    }
})

router.get('/search_arrest_vehicle', verifyToken, async (req, res) => {
    const active_office = req.userOffice;
    const { srh_date, srh_voucher, srh_contact } = req.query;


    let sql = `SELECT tav.*, tp.*
                FROM tango_arrest_vehicle tav
                LEFT JOIN tango_punishment tp 
                ON tav.kasur_id = tp.id
                WHERE 1=1 AND office_id=?
                `;
    // WHERE office_id=?                
    const values = [active_office]

    //Add Conditions based on received parameters
    if (srh_date) {
        sql += ` AND tav.date = ?`;
        values.push(srh_date);
    }
    // else {
    //     sql += ` AND tav.date = ?`;
    //     values.push(todaydate);
    // }
    if (srh_voucher) {
        sql += ` AND tav.voucher = ?`;
        values.push(srh_voucher);
    }
    if (srh_contact) {
        sql += ` AND tav.contact = ?`;
        values.push(srh_contact);
    }

    // console.log(sql)

    con.query(sql, values, (err, result) => {
        if (err) return res.json({ Status: false, Error: "Query Error" })
        return res.json({ Status: true, Result: result })
    })
})

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