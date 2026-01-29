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
    const PAGE_SIZE = 1000;
    let offset = 0;
    let lastBandiId = null;
    let bandiBuffer = null;
    let sn = 1;

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
    const includePhoto = filters.includePhoto === "1";
    const is_under_payrole =
        filters.is_under_payrole !== undefined
            ? Number( filters.is_under_payrole )
            : 0;
    const search_name = filters.search_name?.trim() || "";
    const age_above = toInt( filters.age_above );
    const age_below = toInt( filters.age_below );
    const percentage_above = toInt( filters.percentage_above );
    const percentage_below = toInt( filters.percentage_below );

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
    if ( age_above !== null ) conditions.push( "current_age >= ?" ), params.push( age_above );
    if ( age_below !== null ) conditions.push( "current_age < ?" ), params.push( age_below );
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
        language === "en" ? "S.N." : "क्र.सं.",
        language === "en" ? "Prison Office" : "कारागार कार्यालय",
        language === "en" ? "Office Bandi ID" : "बन्दी ID",
        language === "en" ? "Lagat No." : "लगत नं.",
        language === "en" ? "Block" : "ब्लक",
        language === "en" ? "Bandi Type" : "बन्दी प्रकार",
        language === "en" ? "Bandi Name" : "बन्दीको नाम",
        language === "en" ? "Country" : "देश",
        language === "en" ? "Address" : "ठेगाना",
        language === "en" ? "ID Type & Number" : "परिचय पत्रको प्रकार र नम्बर",
        language === "en" ? "DOB (B.S.)" : "जन्म मिति(बि.सं.)",
        // language === "en" ? "DOB (A.D.)" : "जन्म मिति(ई.सं.)",
        language === "en" ? "Age" : "उमेर",
        language === "en" ? "Gender" : "लिङ्ग",
        language === "en" ? "Spouse Name" : "पति/पत्नीको नाम",
        language === "en" ? "Spouse Contact No." : "पति/पत्नीको सम्पर्क नं.",
        language === "en" ? "Father Name/Contact No." : "बुबाको नाम/सम्पर्क नं.",
        // language === "en" ? "Father Contact No." : "बुबाको सम्पर्क नं.",
        language === "en" ? "Mother Name/Contact No." : "आमाको नाम/सम्पर्क नं.",
        // language === "en" ? "Mother Contact No." : "आमाको सम्पर्क नं.",
        language === "en" ? "Date of imprisonment (B.S.)" : "थुना परेको मिति(बि.सं.)",
        language === "en" ? "Release Date (B.S.)" : "कैद मुक्त मिति",
        language === "en" ? "Fine (To be Paid)" : "जरिवाना (तिर्न बाँकी)",
        language === "en" ? "Remaining Duration(%)" : "बाँकी अवधि(%)",
        language === "en" ? "Mudda Group" : "मुद्दा समूह",
        language === "en" ? "Mudda" : "मुद्दा",
        language === "en" ? "Mudda No." : "मुद्दा नं.",
        language === "en" ? "Vadi" : "वादी",
        language === "en" ? "Decision Office" : "फैसला गर्ने निकाय",
        language === "en" ? "Decision Date" : "फैसला मिति",
        language === "en" ? "Contact Person" : "सम्पर्क व्यक्ति",
        language === "en" ? "Escape Status" : "फरार भए/नभएको अवस्था",
        language === "en" ? "Date of Escape (B.S.)" : "फरार भएको मिति (बि.सं.)",
        language === "en" ? "Escape Details" : "फरार विवरण",
        language === "en" ? "Re-Admitted Date" : "पुनः समातिएको मिति",
        language === "en" ? "Re-Admitted Office" : "पुनः समातिएको कार्यालय",
        ...( includePhoto ? [language === "en" ? "Photo" : "फोटो"] : [] ),
    ];

    sheet.addRow( headers );
    let totalRows = 0;

    //Original : Estimate total rows for progress (rough)
    const [[{ total }]] = await pool.query(
        `SELECT COUNT(*) as total FROM view_bandi_full ${ whereClause }`, params
    );
    /* ---------------- FETCH DATA ---------------- */
    while ( true ) {
        const [rows] = await pool.query(
            `SELECT * FROM view_bandi_full ${ whereClause } ORDER BY bandi_id DESC LIMIT ? OFFSET ?`,
            [...params, PAGE_SIZE, offset]
        );

        
        if ( !rows.length ) break;
        const genderNpMap = { Male: "पुरुष", Female: "महिला", Other: "अन्य" };
        const escapeStatusNpMap = { recaptured: "पुनः पक्राउ", self_present: "स्वयं उपस्थित", escaped: "फरार", "": "" };
        const escapeStatusEnMap = { recaptured: "Re-Captured", self_present: "Self Present", escaped: "Escaped", "": "" };

        for ( const row of rows ) {
            if ( row.bandi_id !== lastBandiId ) {
                if ( bandiBuffer ) {
                    writeBandiToSheet(
                        sheet,
                        bandiBuffer,
                        language,
                        genderNpMap,
                        escapeStatusNpMap,
                        escapeStatusEnMap,
                        sn++,
                        includePhoto,
                        workbook
                    );
                }
                bandiBuffer = { ...row, muddas: [] };
                lastBandiId = row.bandi_id;
            }
            if ( row.mudda_id ) {
                bandiBuffer.muddas.push( {
                    mudda_group_name: row.mudda_group_name,
                    mudda_group_name_en: row.mudda_group_name_en,
                    mudda_name: row.mudda_name,
                    mudda_name_en: row.mudda_name_en,
                    mudda_no: row.mudda_no,
                    vadi: row.vadi,
                    vadi_en: row.vadi_en,
                    mudda_phesala_antim_office: row.mudda_phesala_antim_office,
                    mudda_phesala_antim_office_en: row.mudda_phesala_antim_office_en,
                    mudda_phesala_antim_office_date: row.mudda_phesala_antim_office_date,
                } );
            }

            totalRows++;
        }

        offset += PAGE_SIZE;

        //Update job progress
        const progress = Math.min( 100, Math.floor( ( totalRows / total ) * 100 ) );
        await job.updateProgress( progress );
    }
    if ( bandiBuffer ) {
        const genderNpMap = { Male: "पुरुष", Female: "महिला", Other: "अन्य" };
        const escapeStatusNpMap = { recaptured: "पुनः पक्राउ", self_present: "स्वयं उपस्थित", escaped: "फरार", "": "" };
        const escapeStatusEnMap = { recaptured: "Re-Captured", self_present: "Self Present", escaped: "Escaped", "": "" };
        writeBandiToSheet( sheet, bandiBuffer, language, genderNpMap, escapeStatusNpMap, escapeStatusEnMap, sn++ );
    }

    // Assume each bandi has 1 mudda per row; if multiple muddas, adjust here
    const bandiRows = [];
    // Merge bandi info if multiple mudda rows (currently single, adjust if needed)
    if ( bandiRows.length > 1 ) {
        const start = bandiRows[0].number;
        const end = bandiRows[bandiRows.length - 1].number;
        ["A", "B", "C", "D", "E", "F", "G"].forEach( col => {
            sheet.mergeCells( `${ col }${ start }:${ col }${ end }` );
        } );
    }

    // Add photo if exists
    if ( row.photo_path ) {
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
    await workbook.xlsx.writeFile( filePath );
    return filePath;
};
function writeBandiToSheet(
    sheet,
    b,
    language,
    genderNpMap,
    escapeStatusNpMap,
    escapeStatusEnMap,
    sn,
    includePhoto,
    workbook
) {
    const muddas = b.muddas.length ? b.muddas : [{}];

    const rows = muddas.map((m, idx) =>
        sheet.addRow([
            idx === 0 ? sn : "",
            language === "en" ? b.bandi_office_en : b.bandi_office,
            b.office_bandi_id || "",
            b.lagat_no || "",
            b.block_name || "",
            b.bandi_type || "",
            language === "en" ? b.bandi_name_en : b.bandi_name,
            language === "en" ? b.country_name_en : b.country_name_np,
            language === "en"
                ? `${b.city_name_en}-${b.wardno}, ${b.district_name_en}`
                : `${b.city_name_np}-${b.wardno}, ${b.district_name_np}`,
            `${b.govt_id_name_np || ""}, ${b.card_no || ""}`,
            b.dob,
            b.current_age,
            language === "en" ? b.gender : genderNpMap[b.gender] || "",
            b.spouse_name,
            b.spouse_contact_no,
            `${b.father_name || ""}/${b.father_contact_no || ""}`,
            `${b.mother_name || ""}/${b.mother_contact_no || ""}`,
            b.thuna_date_bs,
            b.release_date_bs,
            b.total_fine || 0,
            calculateBSDate(formattedDateNp, b.release_date_bs).percentage || 0,
            language === "en" ? m.mudda_group_name_en : m.mudda_group_name,
            language === "en" ? m.mudda_name_en : m.mudda_name,
            m.mudda_no || "",
            language === "en" ? m.vadi_en : m.vadi,
            language === "en"
                ? m.mudda_phesala_antim_office_en
                : m.mudda_phesala_antim_office,
            m.mudda_phesala_antim_office_date || "",
            b.other_relatives || "",
            language === "en" ? escapeStatusEnMap[b.escape_status] : escapeStatusNpMap[b.escape_status] || "",
            b.escape_date_bs || "",
            b.escape_method || "",
            b.recapture_date_bs || "",
            b.recaptured_office || "",
            includePhoto ? "" : undefined, // Placeholder for photo column
        ])
    );

    // Merge bandi info if multiple mudda rows
    if (rows.length > 1) {
        const start = rows[0].number;
        const end = rows[rows.length - 1].number;
        ["A", "B", "C", "D", "E", "F", "G"].forEach((col) => {
            sheet.mergeCells(`${col}${start}:${col}${end}`);
        });
    }

    // Add photos for the first row of the bandi
    if (includePhoto && b.photo_path) {
        let relativePath = b.photo_path.startsWith("/") ? b.photo_path.slice(1) : b.photo_path;
        const photoFullPath = path.join(process.cwd(), relativePath);

        if (fs.existsSync(photoFullPath)) {
            const ext = path.extname(photoFullPath).toLowerCase().replace(".", "");
            const imageId = workbook.addImage({
                filename: photoFullPath,
                extension: ext === "jpg" ? "jpeg" : ext,
            });

            const photoRow = rows[0];
            photoRow.height = 90;
            sheet.addImage(imageId, {
                tl: { col: sheet.columns.length - 1, row: photoRow.number - 1 },
                ext: { width: 80, height: 100 },
            });
        } else {
            console.warn(`Photo not found: ${photoFullPath}`);
        }
    }

    rows.forEach((r) => r.commit());
}


