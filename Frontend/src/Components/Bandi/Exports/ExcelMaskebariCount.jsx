import * as ExcelJS from "exceljs";
// import { saveAs } from "file-saver";


const setupWorksheet = ( workbook ) => {

  const worksheet = workbook.addWorksheet( "Prisoner Records" );
  worksheet.pageSetup = {
    paperSize: 9,
    orientation: "portrait",
    margins: { left: 0.75, right: 0.5, top: 0.75, bottom: 0.75, header: 0.3, footer: 0.3 },
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 1,
    horizontalCentered: true,
    verticalCentered: false,
  };
  return worksheet;
};

const addStyledRow = ( worksheet, data, options = {} ) => {
  const row = worksheet.addRow( data );
  row.font = { name: "Kalimati", bold: true, size: 12 };
  row.alignment = { vertical: "middle", wrapText: true, horizontal: options.center ? "center" : undefined };
  if ( options.merge ) {
    options.merge.forEach( ( range ) => worksheet.mergeCells( range ) );
  }
  return row;
};

const addSummaryRows = ( worksheet, releaseRecords, totals ) => {
  const summaryRows = [
    ['१', 'अघिल्लो महिनाको संख्या', '', '', '', '', '', '', '', '', releaseRecords[8].this_month.Male, releaseRecords[8].this_month.Female, releaseRecords[8].this_month.Total, '', '', ''],
    ['२', 'यस महिनाको थप संख्या', '', '', '', '', '', '', '', '', releaseRecords[10].this_month.Male, releaseRecords[10].this_month.Female, releaseRecords[10].this_month.Total, '', '', ''],
    ['३', 'यस महिनामा छुटेको संख्या', '', '', '', '', '', '', '', '',
      releaseRecords[0].this_month.Male + releaseRecords[1].this_month.Male + releaseRecords[2].this_month.Male + releaseRecords[3].this_month.Male + releaseRecords[4].this_month.Male + releaseRecords[5].this_month.Male,
      releaseRecords[0].this_month.Female,
      releaseRecords[0].this_month.Total, '', '', ''],
    ['४', 'यस महिनामा सरुवा भएको संख्या', '', '', '', '', '', '', '', '', releaseRecords[6].this_month.Male, releaseRecords[6].this_month.Male, releaseRecords[6].this_month.Total, '', '', ''],
    ['५', 'यस महिनामा मृत्यु भएको संख्या', '', '', '', '', '', '', '', '', releaseRecords[7].this_month.Male, releaseRecords[7].this_month.Female, releaseRecords[7].this_month.Total, '', '', ''],
    ['६', 'यस महिनामा कायम रहेको कैदीबन्दी संख्या', '', '', '', '', '', '', '', '', releaseRecords[9].this_month.Male, releaseRecords[7].this_month.Female, releaseRecords[7].this_month.Total, '', '', ''],
    ['', 'जम्मा', '', '', '', '', '', '', '', '',
      parseInt( totals.KaidiMale ) + parseInt( totals.ThunuwaMale ) + parseInt( totals.Maashrit ),
      parseInt( totals.KaidiFemale ) + parseInt( totals.ThunuwaFemale ) + parseInt( totals.Faashrit ),
      parseInt( totals.KaidiMale ) + parseInt( totals.ThunuwaMale ) + parseInt( totals.KaidiFemale ) + parseInt( totals.ThunuwaFemale ) + parseInt( totals.TotalAashrit ),
      '', '', '']
  ];

  summaryRows.forEach( ( rowData ) => {
    const row = worksheet.addRow( rowData );
    row.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    worksheet.mergeCells( `B${ row.number }:J${ row.number }` );
    worksheet.mergeCells( `N${ row.number }:P${ row.number }` );
    row.font = { name: "Kalimati", bold: false, size: 12 };
  } );
};

const addPrisonerTable = ( worksheet, records, totals, conditionalAashrit, conditionalNabalik, isForeign = false ) => {
  // Header rows
  const headerRow1 = [
    'सि.नं.', 'मुद्दाको विवरण', '', '', 'जम्मा', '', 'पुरुष', '', 'महिला', '',
    ...conditionalAashrit, ...( conditionalAashrit.length ? [''] : [] ),
    ...conditionalNabalik, ...( conditionalNabalik.length ? [''] : [] ),
    '६५ वर्ष माथिका', '', 'कैफियत', ''
  ];
  const headerRow2 = [
    '', '', '', '', 'कैदी', 'थुनुवा', 'कैदी', 'थुनुवा', 'कैदी', 'थुनुवा',
    ...( conditionalAashrit.length ? ['नाबालक', 'नाबालिका'] : [] ),
    ...( conditionalNabalik.length ? ['कैदी', 'थुनुवा'] : [] ),
    'कैदी', 'थुनुवा', '', ''
  ];

  addStyledRow( worksheet, headerRow1, { center: true } );
  addStyledRow( worksheet, headerRow2, { center: true } );

  // Data rows
  records.forEach( ( record, i ) => {
    const row = [
      i + 1,
      record.mudda_name, "", "",
      record.KaidiTotal, record.ThunuwaTotal,
      record.KaidiMale, record.ThunuwaMale,
      record.KaidiFemale, record.ThunuwaFemale,
      ...( conditionalAashrit.length ? [record.Maashrit, record.Faashrit] : [] ),
      ...( conditionalNabalik.length ? [record.KaidiNabalak, record.ThunuwaNabalak] : [] ),
      record.KaidiAgeAbove65, record.ThunuwaAgeAbove65,
      isForeign ? record.CountryName || "" : ( record.Remarks || "" ),
      ''
    ];
    const dataRow = worksheet.addRow( row );
    dataRow.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    worksheet.mergeCells( `B${ dataRow.number }:D${ dataRow.number }` );
    worksheet.mergeCells( `O${ dataRow.number }:P${ dataRow.number }` );
  } );

  // Totals row
  const totalRow = [
    "जम्मा", "", "", "",
    totals.KaidiTotal, totals.ThunuwaTotal,
    totals.KaidiMale, totals.ThunuwaMale,
    totals.KaidiFemale, totals.ThunuwaFemale,
    ...( conditionalAashrit.length ? [totals.Maashrit, totals.Faashrit] : [] ),
    ...( conditionalNabalik.length ? [totals.KaidiNabalak, totals.ThunuwaNabalak] : [] ),
    totals.KaidiAgeAbove65, totals.ThunuwaAgeAbove65,
    '', ''
  ];
  const totalRowAdded = worksheet.addRow( totalRow );
  totalRowAdded.font = { name: "Kalimati", bold: true };
  totalRowAdded.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
  worksheet.mergeCells( `A${ totalRowAdded.number }:D${ totalRowAdded.number }` );
  worksheet.mergeCells( `O${ totalRowAdded.number }:P${ totalRowAdded.number }` );

  return totalRowAdded.number;
};

const addOfficeDetails = ( worksheet ) => {
  const officeDetails = [
    ['कारागार कार्यालयः', ''],
    ['दस्तखत:', ''],
    ['नामः', ''],
    ['पदः', ''],
    ['मितिः', ''],
    ['कार्यालयको छापः', '']
  ];

  officeDetails.forEach( ( rowData ) => {
    const row = worksheet.addRow( rowData );
    row.font = { name: "Kalimati", bold: true, size: 12 };
    row.alignment = { vertical: "middle", wrapText: true };
    worksheet.mergeCells( `A${ row.number }:P${ row.number }` );
  } );
};

export const exportToExcel = async ( releaseRecords, nativeRecords, nativeTotals, foreignRecords, foreignTotals, fy, fm ) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = setupWorksheet( workbook );
  const { saveAs } = await import( "file-saver" );
  // Conditional columns
  const conditionalAashrit = nativeTotals.TotalAashrit > 0 ? ['आश्रित'] : [];
  const conditionalNabalik = nativeTotals.TotalNabalkrNabalik > 0 ? ['नाबालक/नाबालिका'] : [];

  // Add initial header lines
  addStyledRow( worksheet, ["श्री कारागार व्यवस्थापन विभाग"], { merge: ["A1:P1"], center: true } );
  addStyledRow( worksheet, ["कालिकास्थान, काठमाडौं"], { merge: ["A2:P2"], center: true } );
  addStyledRow( worksheet, ["विषयः मास्केवारी विवरण पठाइएको बारे ।"], { merge: ["A3:P3"], center: true } );
  addStyledRow( worksheet, [`यस कार्यालयको ${ fy } सालको ${ fm } महिनाको मास्केबारी निम्नानुसार पठाइएको व्यहोरा सादर अनुरोध छ ।`], { merge: ["A4:P4"], center: true } );
  addStyledRow( worksheet, ["तपसिल"], { merge: ["A5:P5"], center: true } );

  // Add Release Records Summary (you can add those rows like in your original, or skip if you want)
  // For example you may add your original releaseRecords summary here if needed.

  // Add Summary rows (like अघिल्लो महिनाको संख्या)
  addSummaryRows( worksheet, releaseRecords, nativeTotals );

  // Add Domestic Prisoner Table
  addStyledRow( worksheet, ['मुद्दा अनुसारको स्वदेशी कैदीबन्दीहरुको संख्या'], { merge: [`A${ worksheet.lastRow.number + 1 }:P${ worksheet.lastRow.number + 1 }`], center: true } );
  const nativeEndRow = addPrisonerTable( worksheet, nativeRecords, nativeTotals, conditionalAashrit, conditionalNabalik );

  // Add Foreign Prisoner Table
  addStyledRow( worksheet, ['मुद्दा अनुसारको विदेशी कैदीबन्दीहरुको संख्या'], { merge: [`A${ worksheet.lastRow.number + 1 }:P${ worksheet.lastRow.number + 1 }`], center: true } );
  const foreignEndRow = addPrisonerTable( worksheet, foreignRecords, foreignTotals, conditionalAashrit, conditionalNabalik, true );

  // Add office details at the bottom
  addOfficeDetails( worksheet );

  // Apply borders (from row 7 to last data row)
  worksheet.eachRow( { includeEmpty: true }, ( row, rowNumber ) => {
    if ( rowNumber >= 7 && rowNumber <= foreignEndRow ) {
      row.eachCell( ( cell ) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      } );
    }
  } );

  // Adjust column widths
  worksheet.columns.forEach( ( col, index ) => {
    col.width = 7;
  } );
  worksheet.getColumn( 2 ).width = 10;
  worksheet.getColumn( 2 ).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
  worksheet.getColumn( 2 ).font = { name: "Kalimati", bold: true };

  // Merge common header cells (some examples, extend if you want)
  //   worksheet.mergeCells('A1:P1');
  //   worksheet.mergeCells('A2:P2');
  //   worksheet.mergeCells('A3:P3');
  //   worksheet.mergeCells('A4:P4');
  //   worksheet.mergeCells('A5:P5');

  // Save file
  const buffer = await workbook.xlsx.writeBuffer();
  saveAs( new Blob( [buffer] ), `Maskebari_Report_${ fy }_${ fm }.xlsx` );
};

const MaskebariExport = ( { records, totals, fy, fm } ) => {
  return (
    <button onClick={() => exportToExcel( records, totals, fy, fm )} className="btn btn-primary">
      Export to Excel
    </button>
  );
};

export { MaskebariExport };