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
  console.log("Update Court Decision Req Data:", req.body)
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

export const getParoleSummary = async ( req, res ) => {
  try {
    const { mode } = req.query; // mudda | office
    // console.log("Mode:", mode)
    const rows = await paroleService.fetchParoleSummary( pool, { ...req.query, mode } );
    res.json( rows );
  } catch ( err ) {
    console.error( err );
    res.status( 500 ).json( { message: "Failed to fetch summary" } );
  }
};

export const exportParoleSummary = async ( req, res ) => {
  try {
    const { mode } = req.query;
    const { type } = req.query;
    const cfg = paroleService.SUMMARY_CONFIG[mode];

    const result = await paroleService.fetchParoleSummary( pool, { ...req.query, mode } );
    const rows = result.rows;
    const totals = result.totals;

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet( cfg.sheetName );

    const headers = [cfg.label];
    if ( type === "gender" ) headers.push( "लिङ्ग" );
    headers.push(
      "सिफारिस संख्या", "हेर्न बाँकी", "योग्य", "अयोग्य", "छलफल", "कागजात अपुग",
      "बोर्डबाट पास", "बोर्डबाट फेल", "अदालतबाट पास", "अदालतबाट फेल"
    );
    sheet.addRow( headers );

    rows.forEach( r => {
      sheet.addRow( [
        r.group_name,
        ...( type === "gender" ? [r.gender] : [] ),
        Number( r.total_parole ),
        Number( r.parole_unseen ),
        Number( r.parole_yogya ),
        Number( r.parole_ayogya ),
        Number( r.parole_chalfal ),
        Number( r.parole_lack_of_paper_work ),
        Number( r.parole_pass ),
        Number( r.parole_fail ),
        Number( r.court_pass ),
        Number( r.court_fail ),
      ] );
    } );

    sheet.addRow( [
      'जम्मा',
      ...( type === "gender" ? [r.gender] : [] ),
      Number( totals.parole_sifaris ),
      Number( totals.parole_unseen ),
      Number( totals.parole_yogya ),
      Number( totals.parole_ayogya ),
      Number( totals.parole_chalfal ),
      Number( totals.parole_lack_of_paper_work ),
      Number( totals.parole_pass ),
      Number( totals.parole_fail ),
      Number( totals.court_pass ),
      Number( totals.court_fail ),
    ] );



    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${ cfg.filename }${ type === "gender" ? "_gender" : "" }.xlsx`
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    await workbook.xlsx.write( res );
    res.end();
  } catch ( err ) {
    console.error( err );
    res.status( 500 ).json( { message: "Failed to export summary" } );
  }
};


