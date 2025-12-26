import * as paroleService from "../services/paroleService.js";
import pool from "../utils/db3.js";
import ExcelJS from "exceljs";

export const getParoleNos = async ( req, res ) => {
  try {
    const active_user = req.user?.username;
    const result = await paroleService.getParoleNos();
  } catch ( err ) {
    console.error( err );
    res.status( 500 ).json( { Status: true, message: "Result Fetched Successfully", result } );
  }
};

export const createParoleNos = async ( req, res ) => {
  try {
    const active_user = req.user?.username;
    const result = await paroleService.createParoleNos( req.body, active_user );
    res.status( 200 ).json( { Status: true, message: "प्यारोल नं. Created Successfully", result } );
  } catch ( err ) {
    console.error( err );
    res.status( 500 ).json( { Status: false, message: err.message, error: "Failed to create menu" } );
  }
};

export const updateParoleNos = async ( req, res ) => {
  try {
    const active_user = req.user?.username;
    const id = req.params.id;
    const result = await paroleService.updateParoleNos( req.body, active_user, id );
    res.status( 200 ).json( { Status: true, message: "प्यारोल बैठक विवरण अध्यावधिक भयो ।", result } );
  } catch ( err ) {
    console.log( err );
    res.status( 500 ).json( { Status: false, message: err.message, error: "Failed to update" } );
  }
};

export const deleteParoleNos = async ( req, res ) => {
  try {
    const active_user = req.user?.username;
    console.log( "Trying to delete" );
    res.status( 200 ).json( { Status: true, message: 'Deleted' } );
  } catch ( err ) {
    console.log( err );
    res.status( 500 ).json( { Status: false, message: err.message, error: "Failed to Delete" } );
  }
};

export const updateCourtDecision = async ( req, res ) => {
  const { parole_id } = req.params;
  const userId = req.user.username;
  const currentOffice = req.user.office_id;
  const data = req.body;

  try {
    await paroleService.saveCourtDecisionService( {
      parole_id, data, userId, currentOffice
    } );

    res.json( {
      success: true,
      message: "अदालतको निर्णय अपडेट भयो ।"
    } );
  } catch ( error ) {
    console.error( error );
    res.status( 500 ).json( {
      success: false,
      message: "अदालतको निर्णय अपडेट गर्न सकिएन ।"
    } );
  }

};

// ================= Summary =================
export const getMuddaWiseParoleSummary = async ( req, res ) => {
  try {
    const { type, payrole_no_id } = req.query;

    let whereClause = "";
    const values = [];

    if ( payrole_no_id ) {
      whereClause = "WHERE p.payrole_no_id = ?";
      values.push( payrole_no_id );
    }

    const groupBy =
      type === "gender"
        ? "GROUP BY m.mudda_name, bp.gender"
        : "GROUP BY m.mudda_name";

    const sql = `
      SELECT 
        m.mudda_name
        ${ type === "gender" ? ", bp.gender" : "" }
        ,SUM(CASE WHEN p.pyarole_rakhan_upayukat = 'योग्य' THEN 1 ELSE 0 END) AS parole_yogya
        ,SUM(CASE WHEN p.pyarole_rakhan_upayukat = 'अयोग्य' THEN 1 ELSE 0 END) AS parole_ayogya
        ,SUM(CASE WHEN p.pyarole_rakhan_upayukat = 'छलफल' THEN 1 ELSE 0 END) AS parole_chalfal
        ,SUM(CASE WHEN p.pyarole_rakhan_upayukat = 'पास' THEN 1 ELSE 0 END) AS parole_pass
        ,SUM(CASE WHEN p.pyarole_rakhan_upayukat = 'फेल' THEN 1 ELSE 0 END) AS parole_fail
        ,SUM(CASE WHEN p.court_decision = 'पास' THEN 1 ELSE 0 END) AS court_pass
        ,SUM(CASE WHEN p.court_decision = 'फेल' THEN 1 ELSE 0 END) AS court_fail
      FROM payroles p
      JOIN bandi_person bp ON bp.id = p.bandi_id            
      JOIN bandi_mudda_details bmd ON bp.id = bmd.bandi_id
      JOIN muddas m ON m.id = bmd.mudda_id      
      ${ whereClause }
      ${ groupBy }
      ORDER BY m.mudda_name
    `;

    const [rows] = await pool.query( sql, values );
    res.json( rows );
  } catch ( err ) {
    console.error( err );
    res.status( 500 ).json( { message: "Failed to fetch mudda wise summary" } );
  }
};

// ================= Export Excel =================

export const exportMuddaWiseParoleSummary = async ( req, res ) => {
  try {
    const { type, payrole_no_id } = req.query;

    let totals = {
      parole_yogya: 0,
      parole_chalfal: 0,
      parole_ayogya: 0,
      parole_pass: 0,
      parole_fail: 0,
      court_pass: 0,
      court_fail: 0,
    };

    let whereClause = "";
    const values = [];

    if ( payrole_no_id ) {
      whereClause = "WHERE p.payrole_no_id = ?";
      values.push( payrole_no_id );
    }

    const groupBy =
      type === "gender"
        ? "GROUP BY m.mudda_name, bp.gender"
        : "GROUP BY m.mudda_name";

    const sql = `
      SELECT 
        m.mudda_name
        ${ type === "gender" ? ", bp.gender" : "" }
        ,SUM(CASE WHEN p.pyarole_rakhan_upayukat = 'योग्य' THEN 1 ELSE 0 END) AS parole_yogya
        ,SUM(CASE WHEN p.pyarole_rakhan_upayukat = 'अयोग्य' THEN 1 ELSE 0 END) AS parole_ayogya
        ,SUM(CASE WHEN p.pyarole_rakhan_upayukat = 'छलफल' THEN 1 ELSE 0 END) AS parole_chalfal
        ,SUM(CASE WHEN p.pyarole_rakhan_upayukat = 'पास' THEN 1 ELSE 0 END) AS parole_pass
        ,SUM(CASE WHEN p.pyarole_rakhan_upayukat = 'फेल' THEN 1 ELSE 0 END) AS parole_fail
        ,SUM(CASE WHEN p.court_decision = 'पास' THEN 1 ELSE 0 END) AS court_pass
        ,SUM(CASE WHEN p.court_decision = 'फेल' THEN 1 ELSE 0 END) AS court_fail
      FROM payroles p
      JOIN bandi_person bp ON bp.id = p.bandi_id
      JOIN bandi_mudda_details bmd ON bp.id = bmd.bandi_id
      JOIN muddas m ON m.id = bmd.mudda_id
      ${ whereClause }
      ${ groupBy }
      ORDER BY m.mudda_name
    `;

    const [rows] = await pool.query( sql, values );

    // Create workbook
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet( "Mudda Wise Summary" );

    // Header
    const headers = ["मुद्दा"];
    if ( type === "gender" ) headers.push( "लिङ्ग" );
    headers.push(
      "योग्य",
      "छलफल",
      "अयोग्य",
      "पास",
      "फेल",
      "अदालतबाट पास",
      "अदालतबाट फेल"
    );
    sheet.addRow( headers );

    // Rows
    rows.forEach( ( row ) => {
      const rowData = [
        row.mudda_name,
        ...( type === "gender" ? [row.gender] : [] ),
        Number( row.parole_yogya ),
        Number( row.parole_chalfal ),
        Number( row.parole_ayogya ),
        Number( row.parole_pass ),
        Number( row.parole_fail ),
        Number( row.court_pass ),
        Number( row.court_fail ),
      ];
      sheet.addRow( rowData );

      // Update totals
      totals.parole_yogya += Number( row.parole_yogya );
      totals.parole_chalfal += Number( row.parole_chalfal );
      totals.parole_ayogya += Number( row.parole_ayogya );
      totals.parole_pass += Number( row.parole_pass );
      totals.parole_fail += Number( row.parole_fail );
      totals.court_pass += Number( row.court_pass );
      totals.court_fail += Number( row.court_fail );
    } );

    // Add Total row at the end
    const totalRow = [
      "जम्मा",
      ...( type === "gender" ? [""] : [] ),
      totals.parole_yogya,
      totals.parole_chalfal,
      totals.parole_ayogya,
      totals.parole_pass,
      totals.parole_fail,
      totals.court_pass,
      totals.court_fail,
    ];
    const lastRow = sheet.addRow( totalRow );
    lastRow.font = { bold: true };

    // Send Excel file
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    const filename =
      type === "gender"
        ? "mudda_wise_summary_with_gender.xlsx"
        : "mudda_wise_summary.xlsx";

    res.setHeader( "Content-Disposition", `attachment; filename=${ filename }` );

    await workbook.xlsx.write( res );
    res.end();
  } catch ( err ) {
    console.error( err );
    res.status( 500 ).json( { message: "Failed to export mudda wise summary" } );
  }
};


export const getOfficeWiseParoleSummary = async ( req, res ) => {
  try {
    const { type, payrole_no_id } = req.query;

    let whereClause = "";
    const values = [];

    if ( payrole_no_id ) {
      whereClause = " WHERE p.payrole_no_id = ? ";
      values.push( payrole_no_id );
    }

    const groupBy =
      type === "gender"
        ? " GROUP BY o.letter_address, bp.gender "
        : " GROUP BY o.letter_address ";

    const sql = `
      SELECT 
        o.letter_address
        ${ type === "gender" ? ", bp.gender" : "" },
        SUM(CASE WHEN p.pyarole_rakhan_upayukat = 'योग्य' THEN 1 ELSE 0 END) AS parole_yogya,
        SUM(CASE WHEN p.pyarole_rakhan_upayukat = 'अयोग्य' THEN 1 ELSE 0 END) AS parole_ayogya,
        SUM(CASE WHEN p.pyarole_rakhan_upayukat = 'छलफल' THEN 1 ELSE 0 END) AS parole_chalfal,
        SUM(CASE WHEN p.pyarole_rakhan_upayukat = 'कागजात अपुग' THEN 1 ELSE 0 END) AS parole_lack_of_paper,
        SUM(CASE WHEN p.pyarole_rakhan_upayukat = 'पास' THEN 1 ELSE 0 END) AS parole_pass,
        SUM(CASE WHEN p.pyarole_rakhan_upayukat = 'फेल' THEN 1 ELSE 0 END) AS parole_fail,
        SUM(CASE WHEN p.court_decision = 'पास' THEN 1 ELSE 0 END) AS court_pass,
        SUM(CASE WHEN p.court_decision = 'फेल' THEN 1 ELSE 0 END) AS court_fail
      FROM payroles p
      JOIN bandi_person bp ON bp.id = p.bandi_id
      JOIN offices o ON o.id = bp.current_office_id
      ${ whereClause }
      ${ groupBy }
      ORDER BY o.letter_address
    `;

    const [rows] = await pool.query( sql, values );
    res.json( rows );
  } catch ( err ) {
    console.error( err );
    res.status( 500 ).json( { message: "Failed to fetch mudda wise summary" } );
  }
};

export const exportOfficeWiseParoleSummary = async (req, res) => {
  try {
    const { type, payrole_no_id } = req.query;

    // Build WHERE clause
    let whereClause = "";
    const values = [];
    if (payrole_no_id) {
      whereClause = " WHERE p.payrole_no_id = ? ";
      values.push(payrole_no_id);
    }

    // Grouping
    const groupBy =
      type === "gender"
        ? " GROUP BY o.letter_address, bp.gender "
        : " GROUP BY o.letter_address ";

    // SQL query
    const sql = `
      SELECT 
        o.letter_address
        ${type === "gender" ? ", bp.gender" : ""},
        SUM(CASE WHEN p.pyarole_rakhan_upayukat = 'योग्य' THEN 1 ELSE 0 END) AS parole_yogya,
        SUM(CASE WHEN p.pyarole_rakhan_upayukat = 'अयोग्य' THEN 1 ELSE 0 END) AS parole_ayogya,
        SUM(CASE WHEN p.pyarole_rakhan_upayukat = 'छलफल' THEN 1 ELSE 0 END) AS parole_chalfal,
        SUM(CASE WHEN p.pyarole_rakhan_upayukat = 'कागजात अपुग' THEN 1 ELSE 0 END) AS parole_lack_of_paper,
        SUM(CASE WHEN p.pyarole_rakhan_upayukat = 'पास' THEN 1 ELSE 0 END) AS parole_pass,
        SUM(CASE WHEN p.pyarole_rakhan_upayukat = 'फेल' THEN 1 ELSE 0 END) AS parole_fail,
        SUM(CASE WHEN p.court_decision = 'पास' THEN 1 ELSE 0 END) AS court_pass,
        SUM(CASE WHEN p.court_decision = 'फेल' THEN 1 ELSE 0 END) AS court_fail
      FROM payroles p
      JOIN bandi_person bp ON bp.id = p.bandi_id
      JOIN offices o ON o.id = bp.current_office_id
      ${whereClause}
      ${groupBy}
      ORDER BY o.letter_address
    `;

    const [rows] = await pool.query(sql, values);

    // Create workbook
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Office Wise Summary");

    // Add header
    const headers = [
      "कार्यालय",
      ...(type === "gender" ? ["लिङ्ग"] : []),
      "योग्य",
      "छलफल",
      "अयोग्य",
      "पास",
      "फेल",
      "अदालतबाट पास",
      "अदालतबाट फेल",
    ];
    sheet.addRow(headers);

    // Gender mapping
    const genderMap = { Male: "पुरुष", Female: "महिला", Other: "अन्य" };

    // Totals
    const totals = {
      parole_yogya: 0,
      parole_chalfal: 0,
      parole_ayogya: 0,
      parole_pass: 0,
      parole_fail: 0,
      court_pass: 0,
      court_fail: 0,
    };

    // Add data rows
    rows.forEach((row) => {
      const dataRow = [
        row.letter_address,
        ...(type === "gender" ? [genderMap[row.gender] || "अन्य"] : []),
        Number(row.parole_yogya),
        Number(row.parole_chalfal),
        Number(row.parole_ayogya),
        Number(row.parole_pass),
        Number(row.parole_fail),
        Number(row.court_pass),
        Number(row.court_fail),
      ];

      // Update totals
      totals.parole_yogya += Number(row.parole_yogya);
      totals.parole_chalfal += Number(row.parole_chalfal);
      totals.parole_ayogya += Number(row.parole_ayogya);
      totals.parole_pass += Number(row.parole_pass);
      totals.parole_fail += Number(row.parole_fail);
      totals.court_pass += Number(row.court_pass);
      totals.court_fail += Number(row.court_fail);

      sheet.addRow(dataRow);
    });

    // Add total row
    const totalRow = [
      "जम्मा",
      ...(type === "gender" ? [""] : []),
      totals.parole_yogya,
      totals.parole_chalfal,
      totals.parole_ayogya,
      totals.parole_pass,
      totals.parole_fail,
      totals.court_pass,
      totals.court_fail,
    ];
    const lastRow = sheet.addRow(totalRow);
    lastRow.font = { bold: true };

    // Set headers
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${
        type === "gender"
          ? "office_wise_summary_with_gender.xlsx"
          : "office_wise_summary.xlsx"
      }`
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    // Write to response
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to export office wise summary" });
  }
};