import * as ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const exportToExcel = async ( releaseRecords, records, totals, foreignrecords, foreignTotals, fy, fm ) => {
    console.log( totals );
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet( "Prisoner Records" );

    // Page Setup
    worksheet.pageSetup = {
        paperSize: 9, // A4 size (9), Letter (1)
        orientation: 'portrait', // 'portrait' or 'landscape'
        margins: {
            left: 0.75, right: 0.5, top: 0.75, bottom: 0.75,
            header: 0.3, footer: 0.3
        },
        fitToPage: true, // Scale to fit on one page
        fitToWidth: 1, // Fit to 1 page wide
        fitToHeight: 1, // Fit to 1 page tall
        horizontalCentered: true, // Center content horizontally
        verticalCentered: false, // Center content vertically
    };

    // Headers for the Excel sheet
    const conditionalAashrit = totals.TotalAashrit > 0 ? ['आश्रित'] : [];
    const conditionalNabalkrNabalik = totals.TotalNabalkrNabalik > 0 ? ['नाबालक/नाबालिका'] : [];

    const headers = [
        // [''],
        // [''],
        ['श्री कारागार व्यवस्थापन विभाग'],
        ['कालिकास्थान, काठमाडौं'],
        [`विषयः मास्केवारी विवरण पठाइएको बारे ।`],
        [`यस कार्यालयको ${ fy } सालको ${ fm } महिनाको मास्केबारी निम्नानुसार पठाइएको व्यहोरा सादर अनुरोध छ ।`],
        ['तपसिल'],
        ['चालु आर्थिक वर्षमा छुटेका कैदीबन्दीको संख्या'],
        [
            'अदालतको आदेश वा नियमित छुट संख्या', '', '', '',
            'कामदारी सुविधा पाएका कुल संख्या', '', '', '',
            'माफिमिनाहा पाएका छुट संख्या', '', '', '',
            'मुलुकी फौजदारी कार्यविधि संहिता २०७४ को दफा १५५', '', '', ''
        ],
        [
            'हालसम्मको', '', 'यो महिनाको', '',
            'हालसम्मको', '', 'यो महिनाको', '',
            'हालसम्मको', '', 'यो महिनाको', '',
            'हालसम्मको', '', 'यो महिनाको', '',
        ],
        [
            `${ parseInt(releaseRecords[0].till_last_month.Total)+ parseInt(releaseRecords[1].till_last_month.Total) }`,'', `${ parseInt(releaseRecords[0].this_month.Total)+parseInt(releaseRecords[1].this_month.Total) }`,'',
            `${releaseRecords[4].till_last_month.Total}`, '', `${releaseRecords[4].this_month.Total}`,
            `${releaseRecords[3].till_last_month.Total}`, '', `${releaseRecords[3].this_month.Total}`,
            `${releaseRecords[5].till_last_month.Total}`, '', `${releaseRecords[5].this_month.Total}`
        ],

        [`${ fy } सालको ${ fm } महिनाको मसान्त सम्मको कैदीबन्दी संख्या`],
        ['सि.नं.', 'विवरण', '', '', '', '', '', '', '', '', 'पुरुष', 'महिला', 'जम्मा', 'कैफियत', '', ''],
        ['१', 'अघिल्लो महिनाको संख्या', '', '', '', '', '', '', '', '', `${ releaseRecords[8].this_month.Male }`, `${ releaseRecords[8].this_month.Female }`, `${ releaseRecords[8].this_month.Total }`, '', '', ''],
        ['२', 'यस महिनाको थप संख्या', '', '', '', '', '', '', '', '', `${ releaseRecords[10].this_month.Male }`, `${ releaseRecords[10].this_month.Female }`, `${ releaseRecords[10].this_month.Total }`, '', '', ''],
        ['३', 'यस महिनामा छुटेको संख्या', '', '', '', '', '', '', '', '', `${ releaseRecords[0].this_month.Male + releaseRecords[1].this_month.Male + releaseRecords[2].this_month.Male + releaseRecords[3].this_month.Male + releaseRecords[4].this_month.Male + releaseRecords[5].this_month.Male }`,
            `${ releaseRecords[0].this_month.Female }`,
            `${ releaseRecords[0].this_month.Total }`,
            '', '', ''],
        ['४', 'यस महिनामा सरुवा भएको संख्या', '', '', '', '', '', '', '', '', `${ releaseRecords[6].this_month.Male }`, `${ releaseRecords[6].this_month.Male }`, `${ releaseRecords[6].this_month.Total }`, '', '', ''],
        ['५', 'यस महिनामा मृत्यु भएको संख्या', '', '', '', '', '', '', '', '', `${ releaseRecords[7].this_month.Male }`, `${ releaseRecords[7].this_month.Female }`, `${ releaseRecords[7].this_month.Total }`, '', '', ''],
        ['६', 'यस महिनामा कायम रहेको कैदीबन्दी संख्या', '', '', '', '', '', '', '', '', `${ releaseRecords[9].this_month.Male }`, `${ releaseRecords[7].this_month.Female }`, `${ releaseRecords[7].this_month.Total }`, '', '', ''],
        // ['७', 'हालको आश्रित बालबालिकाको संख्या', '', '', '', '', '', '', '', '', `${releaseRecords[11].this_month.Male}`, `${releaseRecords[11].this_month.Female}`, `${releaseRecords[11].this_month.Total}`, '', '', ''],
        ['', 'जम्मा', '', '', '', '', '', '', '', '', `${ parseInt( totals.KaidiMale ) + parseInt( totals.ThunuwaMale ) + parseInt( totals.Maashrit ) }`, `${ parseInt( totals.KaidiFemale ) + parseInt( totals.ThunuwaFemale ) + parseInt( totals.Faashrit ) }`, `${ parseInt( totals.KaidiMale ) + parseInt( totals.ThunuwaMale ) + parseInt( totals.KaidiFemale ) + parseInt( totals.ThunuwaFemale ) + parseInt( totals.TotalAashrit ) }`, '', '', ''],
       
        ['मुद्दा अनुसारको स्वदेशी कैदीबन्दीहरुको संख्या', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],

        [
            'सि.नं.', 'मुद्दाको विवरण', '', '', 'जम्मा', '', 'पुरुष', '', 'महिला', '',
            ...conditionalAashrit, ...( totals.TotalAashrit > 0 ? [''] : [] ),  // Only added if TotalAashrit > 0
            ...conditionalNabalkrNabalik, ...( totals.TotalNabalkrNabalik > 0 ? [''] : [] ),  // Only added if TotalNabalkrNabalik > 0
            '६५ वर्ष माथिका', '', 'कैफियत', ''
        ],
        [
            '', '', '', '', 'कैदी', 'थुनुवा', 'कैदी', 'थुनुवा', 'कैदी', 'थुनुवा',
            ...( totals.TotalAashrit > 0 ? ['नाबालक'] : [] ),  // Only included if condition is true
            ...( totals.TotalAashrit > 0 ? ['नाबालिका'] : [] ),
            ...( totals.TotalNabalkrNabalik > 0 ? ['कैदी'] : [] ),
            ...( totals.TotalNabalkrNabalik > 0 ? ['थुनुवा'] : [] ),
            'कैदी', 'थुनुवा', '', ''
        ]
    ];



    // Adding headers
    headers.forEach( ( headerRow, index ) => {
        const row = worksheet.addRow( headerRow );
        row.font = { name: "Kalimati", bold: true, size: 12 };
        row.alignment = { vertical: "middle", wrapText: true };

        // worksheet.mergeCells(`A${index + 1}:P${index + 1}`);
    } );

   
    // Adding data rows
    records.forEach( ( record, index ) => {
        const nepRow = worksheet.addRow( [
            index + 1,
            record.mudda_name, "", "",
            record.KaidiTotal, record.ThunuwaTotal,
            record.KaidiMale, record.ThunuwaMale,
            record.KaidiFemale, record.ThunuwaFemale,
            ...( totals.TotalAashrit > 0 ? [record.Maashrit] : [] ),
            ...( totals.TotalAashrit > 0 ? [record.Faashrit] : [] ),
            ...( totals.TotalNabalkrNabalik > 0 ? [record.KaidiNabalak] : [] ),
            ...( totals.TotalNabalkrNabalik > 0 ? [record.ThunuwaNabalak] : [] ),
            record.KaidiAgeAbove65, record.ThunuwaAgeAbove65,
            record.Remarks
        ] );
        nepRow.alignment = { vertical: "middle", horizontal: 'center', wrapText: true };
        worksheet.mergeCells( `B${ nepRow.number }:D${ nepRow.number }` );
        worksheet.mergeCells( `O${ nepRow.number }:P${ nepRow.number }` );
    } );

    // Totals row
    const totalRow = worksheet.addRow( [
        "जम्मा", "", "", "",
        totals.KaidiTotal, totals.ThunuwaTotal,
        totals.KaidiMale, totals.ThunuwaMale,
        totals.KaidiFemale, totals.ThunuwaFemale,
        ...( totals.TotalAashrit > 0 ? [totals.Maashrit] : [] ),
        ...( totals.TotalAashrit > 0 ? [totals.Faashrit] : [] ),
        ...( totals.TotalNabalkrNabalik > 0 ? [totals.KaidiNabalak] : [] ),
        ...( totals.TotalNabalkrNabalik > 0 ? [totals.ThunuwaNabalak] : [] ),
        totals.KaidiAgeAbove65, totals.ThunuwaAgeAbove65
    ] );
    const totalRowIndex = totalRow.number;
    worksheet.mergeCells( `A${ totalRowIndex }:D${ totalRowIndex }` );
    worksheet.mergeCells( `O${ totalRowIndex }:P${ totalRowIndex }` );
    totalRow.font = { name: "Kalimati", bold: true };
    totalRow.alignment = { vertical: "middle", horizontal: "center", wrapText: true };

    // Foreign Prisoners

    const foreignheader = worksheet.addRow( ['मुद्दा अनुसारको विदेशी कैदीबन्दीहरुको संख्या'] );
    worksheet.mergeCells( `A${ foreignheader.number }:P${ foreignheader.number }` );
    foreignheader.font = { name: "Kalimati", bold: true };

    const foreignTabheader1 = worksheet.addRow( [
        'सि.नं.', 'मुद्दाको विवरण', '', '', 'जम्मा', '', 'पुरुष', '', 'महिला', '',
        ...conditionalAashrit, ...( totals.TotalAashrit > 0 ? [''] : [] ),  // Only added if TotalAashrit > 0
        ...conditionalNabalkrNabalik, ...( totals.TotalNabalkrNabalik > 0 ? [''] : [] ),  // Only added if TotalNabalkrNabalik > 0
        '६५ वर्ष माथिका', '', 'कैफियत', ''
    ] );

    foreignTabheader1.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    foreignTabheader1.font = { name: "Kalimati", bold: true };

    const foreignTabheader2 = worksheet.addRow( [
        '', '', '', '', 'कैदी', 'थुनुवा', 'कैदी', 'थुनुवा', 'कैदी', 'थुनुवा',
        ...( totals.TotalAashrit > 0 ? ['नाबालक'] : [] ),  // Only included if condition is true
        ...( totals.TotalAashrit > 0 ? ['नाबालिका'] : [] ),
        ...( totals.TotalNabalkrNabalik > 0 ? ['कैदी'] : [] ),
        ...( totals.TotalNabalkrNabalik > 0 ? ['थुनुवा'] : [] ),
        'कैदी', 'थुनुवा', '', ''
    ] );

    foreignTabheader2.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    foreignTabheader2.font = { name: "Kalimati", bold: true };

    // Adding data rows
    foreignrecords.forEach( ( record, index ) => {
        const nepRow = worksheet.addRow( [
            index + 1,
            record.mudda_name, "", "",
            record.KaidiTotal, record.ThunuwaTotal,
            record.KaidiMale, record.ThunuwaMale,
            record.KaidiFemale, record.ThunuwaFemale,
            ...( totals.TotalAashrit > 0 ? [record.Maashrit] : [] ),
            ...( totals.TotalAashrit > 0 ? [record.Faashrit] : [] ),
            ...( totals.TotalNabalkrNabalik > 0 ? [record.KaidiNabalak] : [] ),
            ...( totals.TotalNabalkrNabalik > 0 ? [record.ThunuwaNabalak] : [] ),
            record.KaidiAgeAbove65, record.ThunuwaAgeAbove65,
            record.CountryName
        ] );
        nepRow.alignment = { vertical: "middle", horizontal: 'center', wrapText: true };
        worksheet.mergeCells( `B${ nepRow.number }:D${ nepRow.number }` );
        worksheet.mergeCells( `O${ nepRow.number }:P${ nepRow.number }` );
    } );

    // Totals row
    const totalForeignRow = worksheet.addRow( [
        "जम्मा", "", "", "",
        foreignTotals.KaidiTotal, foreignTotals.ThunuwaTotal,
        foreignTotals.KaidiMale, foreignTotals.ThunuwaMale,
        foreignTotals.KaidiFemale, foreignTotals.ThunuwaFemale,
        ...( foreignTotals.TotalAashrit > 0 ? [foreignTotals.Maashrit] : [] ),
        ...( foreignTotals.TotalAashrit > 0 ? [foreignTotals.Faashrit] : [] ),
        ...( foreignTotals.TotalNabalkrNabalik > 0 ? [foreignTotals.KaidiNabalak] : [] ),
        ...( foreignTotals.TotalNabalkrNabalik > 0 ? [foreignTotals.ThunuwaNabalak] : [] ),
        foreignTotals.KaidiAgeAbove65, foreignTotals.ThunuwaAgeAbove65
    ] );
    totalForeignRow.font = { name: "Kalimati", bold: true };
    totalForeignRow.alignment = { vertical: "middle", horizontal: "center", wrapText: true };

    const officeDetails = [
        ['कारागार कार्यालयः', ''],
        ['दस्तखत:', ''],
        ['नामः', ''],
        ['पदः', ''],
        ['मितिः', ''],
        ['कार्यालयको छापः', '']
    ];

    officeDetails.forEach( ( headerRow, index ) => {
        const row = worksheet.addRow( headerRow );
        row.font = { name: "Kalimati", bold: true, size: 12 };
        row.alignment = { vertical: "middle", wrapText: true };
        worksheet.mergeCells( `A${ row.number }:P${ row.number }` );
    } );



    const totalForeignRowIndex = totalForeignRow.number;
    worksheet.mergeCells( `A${ totalForeignRowIndex }:D${ totalForeignRowIndex }` );
    worksheet.mergeCells( `O${ totalForeignRowIndex }:P${ totalForeignRowIndex }` );
    worksheet.mergeCells( `B${ foreignTabheader1.number }:D${ foreignTabheader1.number }` );
    worksheet.mergeCells( `E${ foreignTabheader1.number }:F${ foreignTabheader1.number }` );
    worksheet.mergeCells( `G${ foreignTabheader1.number }:H${ foreignTabheader1.number }` );
    worksheet.mergeCells( `I${ foreignTabheader1.number }:J${ foreignTabheader1.number }` );
    worksheet.mergeCells( `K${ foreignTabheader1.number }:L${ foreignTabheader1.number }` );
    worksheet.mergeCells( `M${ foreignTabheader1.number }:N${ foreignTabheader1.number }` );
    worksheet.mergeCells( `O${ foreignTabheader1.number }:P${ foreignTabheader1.number }` );
    worksheet.mergeCells( `B${ foreignTabheader2.number }:D${ foreignTabheader2.number }` );
    worksheet.mergeCells( `E${ foreignTabheader2.number }:F${ foreignTabheader2.number }` );
    worksheet.mergeCells( `G${ foreignTabheader2.number }:H${ foreignTabheader2.number }` );
    worksheet.mergeCells( `I${ foreignTabheader2.number }:J${ foreignTabheader2.number }` );
    worksheet.mergeCells( `K${ foreignTabheader2.number }:L${ foreignTabheader2.number }` );
    worksheet.mergeCells( `M${ foreignTabheader2.number }:N${ foreignTabheader2.number }` );
    worksheet.mergeCells( `O${ foreignTabheader2.number }:P${ foreignTabheader2.number }` );



    const officeDetailsIndex = totalForeignRow.number + 1;
    // Borders
    worksheet.eachRow( ( row, index ) => {
        if ( index > 6 && index < officeDetailsIndex ) {
            row.eachCell( ( cell ) => {
                cell.border = {
                    top: { style: "thin" },
                    left: { style: "thin" },
                    bottom: { style: "thin" },
                    right: { style: "thin" }
                };
            } );
        }
    } );
    // Adjust column widths
    worksheet.columns.forEach( ( column, index ) => {
        // column.width = index === 1 ? 30 : 10;  For specific column width 
        column.width = 7; //For all column width
    } );

    worksheet.getRow( 3 ).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    worksheet.getRow( 5 ).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    worksheet.getRow( 7 ).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    worksheet.getRow( 8 ).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    worksheet.getRow( 9 ).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    worksheet.getRow( 11 ).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    worksheet.getColumn( 2 ).width = 10;
    worksheet.getColumn( 2 ).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
    worksheet.getColumn( 2 ).font = { name: "Kalimati", bold: true };

    // Merge specific column headers (for grouped headers)
    worksheet.mergeCells( 'A1:P1' ); // कार्यालयको नाम
    worksheet.mergeCells( 'A2:P2' ); // कार्यालयको ठेगाना
    worksheet.mergeCells( 'A3:P3' ); // विषय
    worksheet.mergeCells( 'A4:P4' ); // विवरण२
    worksheet.mergeCells( 'A5:P5' ); // तपसिल
    worksheet.mergeCells( 'A6:P6' ); // विवरण२
    worksheet.mergeCells( 'A7:D7' ); // अदालतको आदेश वा नियमित छुट संख्या
    worksheet.mergeCells( 'E7:H7' ); // कामदारी सुविधा पाएका कुल संख्या
    worksheet.mergeCells( 'I7:L7' ); // माफिमिनाहा पाएका छुट संख्या
    worksheet.mergeCells( 'M7:P7' ); // मुलुकी फौजदारी कार्यविधि संहिता २०७४ को दफा १५५
    worksheet.mergeCells( 'A8:B8' ); // हाल सम्मको
    worksheet.mergeCells( 'C8:D8' ); // यो महिनाको
    worksheet.mergeCells( 'E8:F8' ); // हाल सम्मको
    worksheet.mergeCells( 'G8:H8' ); // यो महिनाको
    worksheet.mergeCells( 'I8:J8' ); // हाल सम्मको
    worksheet.mergeCells( 'K8:L8' ); // यो महिनाको
    worksheet.mergeCells( 'M8:N8' ); // हाल सम्मको
    worksheet.mergeCells( 'O8:P8' ); // यो महिनाको

    //Values
    worksheet.mergeCells( 'A9:B9' ); // हाल सम्मको
    worksheet.mergeCells( 'C9:D9' ); // यो महिनाको
    worksheet.mergeCells( 'E9:F9' ); // हाल सम्मको
    worksheet.mergeCells( 'G9:H9' ); // यो महिनाको
    worksheet.mergeCells( 'I9:J9' ); // हाल सम्मको
    worksheet.mergeCells( 'K9:L9' ); // यो महिनाको
    worksheet.mergeCells( 'M9:N9' ); // हाल सम्मको
    worksheet.mergeCells( 'O9:P9' ); // यो महिनाको
    worksheet.mergeCells( 'A10:P10' ); // यो सालको __ महिनाको मसान्त सम्मको कैदीबन्दी संख्या

    worksheet.mergeCells( 'B11:J11' ); // विवरण
    worksheet.mergeCells( 'B12:J12' ); // विवरण
    worksheet.mergeCells( 'B13:J13' ); // विवरण
    worksheet.mergeCells( 'B14:J14' ); // विवरण
    worksheet.mergeCells( 'B15:J15' ); // विवरण
    worksheet.mergeCells( 'B16:J16' ); // विवरण
    worksheet.mergeCells( 'B17:J17' ); // विवरण
    worksheet.mergeCells( 'B18:J18' ); // विवरण
    
    worksheet.mergeCells( 'N11:P11' ); // विवरण
    worksheet.mergeCells( 'N12:P12' ); // विवरण
    worksheet.mergeCells( 'N13:P13' ); // विवरण
    worksheet.mergeCells( 'N14:P14' ); // विवरण
    worksheet.mergeCells( 'N15:P15' ); // विवरण
    worksheet.mergeCells( 'N16:P16' ); // विवरण
    worksheet.mergeCells( 'N17:P17' ); // विवरण
    worksheet.mergeCells( 'N18:P18' ); // विवरण
    worksheet.mergeCells( 'A19:P19' ); // विवरण
    worksheet.mergeCells( 'B20:D20' ); // मुद्दा विवरण
    worksheet.mergeCells( 'E20:F20' ); // मुद्दा विवरण
    worksheet.mergeCells( 'G20:H20' ); // मुद्दा विवरण
    worksheet.mergeCells( 'I20:J20' ); // मुद्दा विवरण
    worksheet.mergeCells( 'K20:L20' ); // मुद्दा विवरण
    worksheet.mergeCells( 'M20:P21' ); // मुद्दा विवरण
    
    worksheet.mergeCells( 'B21:D21' ); // मुद्दा विवरण


    // worksheet.mergeCells( 'A19:A19' ); // मुद्दा अनुसारको स्वदेशी कैदीबन्दीहरुको संख्या
    // worksheet.mergeCells( 'A20:P20' ); // विवरण

    // worksheet.mergeCells('A21:A22'); // सि.नं.
    // worksheet.mergeCells('B21:D22'); // मुदद्ाको विवरण
    // worksheet.mergeCells( 'E21:F21' ); // मुदद्ाको विवरण
    // worksheet.mergeCells( 'G21:H21' ); // मुदद्ाको विवरण
    // worksheet.mergeCells( 'I21:J21' ); // मुदद्ाको विवरण
    // worksheet.mergeCells( 'K21:L21' ); // मुदद्ाको विवरण
    // worksheet.mergeCells( 'M21:N21' ); // मुदद्ाको विवरण
    // worksheet.mergeCells('O21:P22'); // मुदद्ाको विवरण







    // Save the file
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

export { MaskebariExport, exportToExcel };