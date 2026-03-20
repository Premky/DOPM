// import ExcelJS from 'exceljs';
// import { saveAs } from 'file-saver';


// Inside your component file, e.g. TotalCountOfficeWise.jsx
const addTable = ( worksheet, count ) => {
  // Header rows
  const headerRow1 = [
    'प्रदेश', 'सि.नं.', 'कारागार', 'कुल कैदीबन्दी', 
    'कैदी', '', 'जम्मा कैदी', 'थुनुवा', '', 'जम्मा थुनुवा',
    'लिङ्ग अनुसार','', '६५ वर्ष माथिका','', 'आश्रित', 'फरार/फिर्ता', '', 'विदेशी देशहरू', ''
  ];
  const headerRow2 = [
    '', '', '', '', 
    'पुरुष', 'महिला', '', 'पुरुष', 'महिला', '',
    'पुरुष', 'महिला', 'कैदी', 'थुनुवा', '', 'फरार', 'फिर्ता', 'संख्या', 'देश अनुसार'
    
  ];

  // Add headerRow1
  const row1 = worksheet.addRow( headerRow1 );
  row1.font = { name: "Kalimati", bold: true, size: 12 };
  row1.alignment = { vertical: "middle", horizontal: "center", wrapText: true };

  // Add headerRow2
  const row2 = worksheet.addRow( headerRow2 );
  row2.font = { name: "Kalimati", bold: true, size: 12 };
  row2.alignment = { vertical: "middle", horizontal: "center", wrapText: true };

  // Apply merges for headerRow1 (grouping)
  worksheet.mergeCells( `A${ row1.number }:A${ row2.number }` );
  worksheet.mergeCells( `B${ row1.number }:B${ row2.number }` );
  worksheet.mergeCells( `C${ row1.number }:C${ row2.number }` );
  worksheet.mergeCells( `D${ row1.number }:D${ row2.number }` );
  worksheet.mergeCells( `E${ row1.number }:F${ row1.number }` );
  worksheet.mergeCells( `G${ row1.number }:G${ row2.number }` );
  worksheet.mergeCells( `H${ row1.number }:I${ row1.number }` );
  worksheet.mergeCells( `J${ row1.number }:J${ row2.number }` );
  worksheet.mergeCells( `K${ row1.number }:L${ row1.number }` );
  worksheet.mergeCells( `M${ row1.number }:N${ row1.number }` );
  worksheet.mergeCells( `O${ row1.number }:O${ row2.number }` );
  worksheet.mergeCells( `P${ row1.number }:Q${ row1.number }` );
  worksheet.mergeCells( `R${ row1.number }:S${ row1.number }` );
  // addStyledRow( worksheet, headerRow1, { center: true } );
  // addStyledRow( worksheet, headerRow2, { center: true } );
  // item.country_name!='नेपाल' && item.country_name
  // Data rows
   count.forEach( ( data, index ) => {
    worksheet.addRow( [
      data.state_name_np,
      index + 1,
      data.office_short_name,
      ( data.total_male + data.total_female ) || 0,
      data.kaidi_male,
      data.kaidi_female,
      data.total_kaidi,
      data.thunuwa_male,
      data.thunuwa_female,
      data.total_thunuwa,
      data.total_male,
      data.total_female,
      data.kaidi_male_65plus + data.kaidi_female_65plus,
      data.thunuwa_male_65plus + data.thunuwa_female_65plus,
      data.total_aashrit,
      data.totalEscaped,
      data.totalReturned,
      data.foreign_count,

      data.foreign_countries
        .map( c => `${ c.country }-${ c.count }` )
        .join( ', ' )
      ,
    ] );
  } );


  // Totals row
  // const totalRow = [
  //   "जम्मा", "", "", "",
  //   totals.KaidiTotal, totals.ThunuwaTotal,
  //   totals.KaidiMale, totals.ThunuwaMale,
  //   totals.KaidiFemale, totals.ThunuwaFemale,
  //   ...( conditionalAashrit.length ? [totals.Maashrit, totals.Faashrit] : [] ),
  //   ...( conditionalNabalik.length ? [totals.KaidiNabalak, totals.ThunuwaNabalak] : [] ),
  //   totals.KaidiAgeAbove65, totals.ThunuwaAgeAbove65,
  //   totals.totalEscaped, totals.totalReturned,
  //   '', ''
  // ];
  // const totalRowAdded = worksheet.addRow( totalRow );
  // totalRowAdded.font = { name: "Kalimati", bold: true };
  // totalRowAdded.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
  // worksheet.mergeCells( `A${ totalRowAdded.number }:D${ totalRowAdded.number }` );
  // worksheet.mergeCells( `O${ totalRowAdded.number }:P${ totalRowAdded.number }` );

  // return totalRowAdded.number;
};

const exportOfficeWiseMaskebariExcel = async ( count, onlineOfficeIds ) => {
  const ExcelJS = await import( 'exceljs' );
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet( 'Total Count Office Wise' );
  const { saveAs } = await import( "file-saver" );

  addTable(worksheet, count);
  // Define header row 
  // worksheet.addRow( [
  //   'प्रदेश',
  //   'क्र.सं.',
  //   'कारागार',
  //   'कुल कैदीबन्दी',
  //   'कैदी पुरुष',
  //   'कैदी महिला',
  //   'कुल कैदी',
  //   'थुनुवा पुरुष',
  //   'थुनुवा महिला',
  //   'कुल थुनुवा',
  //   'लिङ्ग अनुसार पुरुष',
  //   'लिङ्ग अनुसार महिला',
  //   '६५ वर्ष माथिका कैदी',
  //   '६५ वर्ष माथिका थुनुवा',
  //   'आश्रित',
  //   'फरार',
  //   'फिर्ता',
  //   'विदेशी संख्या',
  //   'विदेशी देशहरू',
  // ] );

  // Add data rows
  // count.forEach( ( data, index ) => {
  //   worksheet.addRow( [
  //     data.state_name_np,
  //     index + 1,
  //     data.office_short_name,
  //     ( data.total_male + data.total_female ) || 0,
  //     data.kaidi_male,
  //     data.kaidi_female,
  //     data.total_kaidi,
  //     data.thunuwa_male,
  //     data.thunuwa_female,
  //     data.total_thunuwa,
  //     data.total_male,
  //     data.total_female,
  //     data.kaidi_male_65plus + data.kaidi_female_65plus,
  //     data.thunuwa_male_65plus + data.thunuwa_female_65plus,
  //     data.total_aashrit,
  //     data.totalEscaped,
  //     data.totalReturned,
  //     data.foreign_count,

  //     data.foreign_countries
  //       .map( c => `${ c.country }-${ c.count }` )
  //       .join( ', ' )
  //     ,
  //   ] );
  // } );

  // Optional: Style header row
  worksheet.getRow( 1 ).eachCell( ( cell ) => {
    cell.font = { bold: true };
    cell.alignment = { horizontal: 'center' };
  } );

  // Generate buffer and save as file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob( [buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' } );
  saveAs( blob, 'TotalCountOfficeWise.xlsx' );
};
export default exportOfficeWiseMaskebariExcel;