import ExcelJS from "exceljs";
import fs from "fs";
import path from "path";
import pool from "../utils/db3.js";
import { calculateBSDate } from "../utils/dateCalculator.js";
import NepaliDate from "nepali-datetime";

const npToday = new NepaliDate();
const formattedDateNp = npToday.format( "YYYY-MM-DD" );

const TEMP_DIR = path.join( process.cwd(), "temp_exports" );
if ( !fs.existsSync( TEMP_DIR ) ) fs.mkdirSync( TEMP_DIR );

export const generateBandiExcelWithPhoto = async ( job, filters ) => {
    const toInt = ( v ) => {
        if ( v === undefined || v === "0" || v === "" ) return null;
        const n = Number( v );
        return Number.isNaN( n ) ? null : n;
    };

    /* ---------------- FILTERS ---------------- */
    const selected_office = toInt( filters.selected_office );
    const searchOffice = toInt( filters.searchOffice );
    const bandi_status = toInt( filters.bandi_status ) ?? 1;
    const nationality = toInt( filters.nationality );
    const country = toInt( filters.country );
    const gender = toInt( filters.gender );
    const bandi_type = toInt( filters.bandi_type );
    const mudda_group_id = toInt( filters.mudda_group_id );
    const is_dependent = toInt( filters.is_dependent );
    const is_escape = filters.is_escape || "";
    const language = filters.language || "np";
    const search_name = filters.search_name?.trim() || "";
    const is_under_payrole = filters.is_under_payrole ? Number( filters.is_under_payrole ) : 0;

    /* ---------------- WHERE CLAUSE ---------------- */
    let conditions = [];
    let params = [];

    if ( selected_office !== null ) {
        conditions.push( "current_office_id = ?" );
        params.push( selected_office );
    } else if ( searchOffice !== null ) {
        conditions.push( "current_office_id = ?" );
        params.push( searchOffice );
    }

    if ( bandi_status !== null ) conditions.push( "bandi_status = ?" ), params.push( bandi_status );
    if ( nationality !== null ) conditions.push( "nationality = ?" ), params.push( nationality );
    if ( country !== null ) conditions.push( "country_id = ?" ), params.push( country );
    if ( gender !== null ) conditions.push( "gender = ?" ), params.push( gender );
    if ( bandi_type !== null ) conditions.push( "bandi_type = ?" ), params.push( bandi_type );
    if ( mudda_group_id !== null ) conditions.push( "muddas_group_id = ?" ), params.push( mudda_group_id );
    if ( is_escape ) conditions.push( "escape_status = ?" ), params.push( is_escape );
    if ( is_dependent !== null ) conditions.push( "is_dependent = ?" ), params.push( is_dependent );
    if ( search_name ) {
        conditions.push( "(bandi_name LIKE ? OR office_bandi_id = ?)" );
        params.push( `%${ search_name }%`, search_name );
    }

    conditions.push( "is_under_payrole = ?" );
    params.push( is_under_payrole );

    const whereClause = conditions.length ? `WHERE ${ conditions.join( " AND " ) }` : "";

    const fileName = `Bandi_Records_With_Photo_${ Date.now() }.xlsx`;
    const filePath = path.join( TEMP_DIR, fileName );

    /* ---------------- WORKBOOK ---------------- */
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet( "बन्दी विवरण" );

    const headers = [
        "क्र.सं.", "कारागार कार्यालय", "बन्दी ID", "लगत नं.", "ब्लक",
        "बन्दी प्रकार", "बन्दीको नाम", "देश", "ठेगाना",
        "परिचय पत्र", "जन्म मिति", "उमेर", "लिङ्ग",
        "पति/पत्नी", "सम्पर्क नं.",
        "बुबा/सम्पर्क", "आमा/सम्पर्क",
        "थुना मिति", "मुक्त मिति",
        "जरिवाना", "बाँकी %",
        "मुद्दा समूह", "मुद्दा", "मुद्दा नं.", "वादी",
        "फैसला निकाय", "फैसला मिति",
        "सम्पर्क व्यक्ति",
        "फरार भए/नभएको अवस्था", "फरार मिति", "फरार विवरण",
        "पुनः समातिएको मिति", "पुनः समातिएको कार्यालय",
        "फोटो"
    ];

    sheet.addRow( headers );

    /* ---------------- FETCH DATA ---------------- */
    const [rows] = await pool.query(
        `SELECT * FROM view_bandi_full ${ whereClause } ORDER BY bandi_id DESC`,
        params
    );

    let sn = 1;

    for ( const r of rows ) {
        // Assume each bandi has 1 mudda per row; if multiple muddas, adjust here
        const bandiRows = [];
        const row = sheet.addRow( [
            sn,
            r.bandi_office,
            r.office_bandi_id,
            r.lagat_no,
            r.block_name,
            r.bandi_type,
            r.bandi_name,
            r.country_name_np,
            `${ r.city_name_np }-${ r.wardno }, ${ r.district_name_np }`,
            `${ r.govt_id_name_np }, ${ r.card_no }`,
            r.dob,
            r.current_age,
            r.gender,
            r.spouse_name,
            r.spouse_contact_no,
            `${ r.father_name }/${ r.father_contact_no }`,
            `${ r.mother_name }/${ r.mother_contact_no }`,
            r.thuna_date_bs,
            r.release_date_bs,
            r.total_fine,
            calculateBSDate( formattedDateNp, r.release_date_bs ).percentage || 0,
            r.mudda_group_name,
            r.mudda_name,
            r.mudda_no,
            r.vadi,
            r.mudda_phesala_antim_office,
            r.mudda_phesala_antim_office_date,
            r.other_relatives,
            r.escape_status || "",
            r.escape_date_bs || "",
            r.escape_method || "",
            r.recapture_date_bs || "",
            r.recaptured_office || "",
            "" // placeholder for photo
        ] );
        bandiRows.push( row );

        // Merge bandi info if multiple mudda rows (currently single, adjust if needed)
        if ( bandiRows.length > 1 ) {
            const start = bandiRows[0].number;
            const end = bandiRows[bandiRows.length - 1].number;
            ["A", "B", "C", "D", "E", "F", "G"].forEach( col => {
                sheet.mergeCells( `${ col }${ start }:${ col }${ end }` );
            } );
        }

        // Add photo if exists
        if ( r.photo_path ) {
            // Remove leading slash if exists
            let relativePath = r.photo_path.startsWith( '/' ) ? r.photo_path.slice( 1 ) : r.photo_path;

            const photoFullPath = path.join( process.cwd(), relativePath );

            if ( fs.existsSync( photoFullPath ) ) {
                // Detect file extension
                const ext = path.extname( photoFullPath ).toLowerCase().replace( '.', '' );
                const allowedExt = ['jpeg', 'jpg', 'png'];
                if ( !allowedExt.includes( ext ) ) console.warn( `Unsupported photo format: ${ photoFullPath }` );

                const imageId = workbook.addImage( {
                    filename: photoFullPath,
                    extension: ext === 'jpg' ? 'jpeg' : ext, // ExcelJS expects 'jpeg'
                } );

                row.height = 90; // Adjust row height for photo
                sheet.addImage( imageId, {
                    tl: { col: headers.length - 1, row: row.number - 1 }, // last column
                    ext: { width: 80, height: 100 }, // width/height of photo
                } );
            } else {
                console.warn( `Photo not found: ${ photoFullPath }` );
            }
        }


        sn++;
    }

    await workbook.xlsx.writeFile( filePath );
    return filePath;
};
