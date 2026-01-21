import ExcelJS from "exceljs";
import fs from "fs";
import path from "path";
import pool from "../utils/db3.js";

// temp folder for exported files
const TEMP_DIR = path.join( process.cwd(), "temp_exports" );
if ( !fs.existsSync( TEMP_DIR ) ) fs.mkdirSync( TEMP_DIR );

export const generateBandiExcel = async ( job, filters ) => {
    const PAGE_SIZE = 1000;
    let offset = 0;
    let sn = 1;
    const language = filters.language || "np";

    const fileName = `Bandi_Records_${ Date.now() }.xlsx`;
    const filePath = path.join( TEMP_DIR, fileName );

    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter( {
        filename: filePath,
        useStyles: true,
        useSharedStrings: true,
    } );

    const sheet = workbook.addWorksheet( "बन्दी विवरण" );

    // All headers (keep all columns you need)
    const headers1 = [
        "S.N.", "Prison Office", "Office Bandi ID", "Lagat No.", "Block",
        "Bandi Type", "Bandi Name", "Country", "Address", "ID Type & Number",
        "DOB (B.S.)", "DOB (A.D.)", "Age", "Gender", "Spouse Name",
        "Spouse Contact No.", "Father Name", "Father Contact No.", "Mother Name",
        "Mother Contact No.", "Date of imprisonment (B.S.)", "Release Date (B.S.)",
        "Mudda Group", "Mudda", "Mudda No.", "Vadi", "Decision Office",
        "Decision Date", "Contact Person",
    ];

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
        language === "en" ? "Mudda Group" : "मुद्दा समूह",
        language === "en" ? "Mudda" : "मुद्दा",
        language === "en" ? "Mudda No." : "मुद्दा नं.",
        language === "en" ? "Vadi" : "वादी",
        language === "en" ? "Decision Office" : "फैसला गर्ने निकाय",
        language === "en" ? "Decision Date" : "फैसला मिति",
        language === "en" ? "Contact Person" : "सम्पर्क व्यक्ति",
    ];

    sheet.addRow( headers ).commit();

    let totalRows = 0;

    // Optional: estimate total rows for progress (rough)
    const [[{ total }]] = await pool.query(
        "SELECT COUNT(*) as total FROM view_bandi_full"
    );

    while ( true ) {
        const [rows] = await pool.query(
            `SELECT * FROM view_bandi_full ORDER BY bandi_id DESC LIMIT ? OFFSET ?`,
            [PAGE_SIZE, offset]
        );

        if ( !rows.length ) break;
        const genderNpMap = { Male: "पुरुष", Female: "महिला", Other: "अन्य" };
        for ( const b of rows ) {
            // For simplicity, only basic row (add muddas if you want)
            sheet.addRow( [
                sn++,
                // b.bandi_office,
                language === "en" ? b.bandi_office_en : b.bandi_office,
                b.office_bandi_id,
                b.lagat_no,
                b.block_name,
                b.bandi_type,
                language === "en" ? b.bandi_name_en : b.bandi_name,
                language === "en" ? b.country_name_en : b.country_name_np,
                b.country_name_en === "Nepal" ?
                    language === "en" ? `${ b.city_name_en }-${ b.wardno }, ${ b.district_name_en }, ${ b.state_name_en }` :
                        `${ b.city_name_np }-${ b.wardno }, ${ b.district_name_np }, ${ b.state_name_np }` :
                    b.bidesh_nagarik_address_details,
                language === "en" ? b.govt_id_name_en : b.govt_id_name_np + ` - ` + b.card_no,
                b.dob,
                // b.dob_ad,
                b.current_age,
                language === "en" ? b.gender : genderNpMap[b.gender] || "",
                b.spouse_name,
                b.spouse_contact_no,
                b.father_name + '/' + b.father_contact_no,
                b.mother_name + '/' + b.mother_contact_no,
                b.thuna_date_bs,
                b.release_date_bs,
                b.mudda_group_name,
                b.mudda_name,
                b.mudda_no,
                b.vadi,
                b.mudda_phesala_antim_office,
                b.mudda_phesala_antim_office_date,
                b.other_relatives,
            ] ).commit();
            totalRows++;
        }

        offset += PAGE_SIZE;

        // Update job progress
        const progress = Math.min( 100, Math.floor( ( totalRows / total ) * 100 ) );
        await job.updateProgress( progress );
    }

    await workbook.commit();

    return filePath; // return path for download
};
