import ExcelJS from "exceljs";

import NepaliDate from "nepali-datetime";

const exportToExcel = async (
    filteredKaidi,
    fetchedMuddas,
    fetchedTransferHistory,
    BASE_URL,
    authState
) => {
    const npToday = new NepaliDate();
    const formattedDateNp = npToday.format( "YYYY-MM-DD" );
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet( "Bandi Export" );
    const { saveAs } = await import( "file-saver" );
    // --- Page setup ---
    worksheet.pageSetup = {
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 0,
        orientation: "landscape",
        paperSize: 9,
        margins: { left: 0.5, right: 0.5, top: 0.75, bottom: 0.75, header: 0.3, footer: 0.3 },
    };

    // --- Insert logo ---
    const imagePath = `/nepal_gov_logo.png`;
    const imageBlob = await fetch( imagePath ).then( ( res ) => res.blob() );
    const imageBuffer = await imageBlob.arrayBuffer();
    const imageId = workbook.addImage( { buffer: imageBuffer, extension: "png" } );
    worksheet.addImage( imageId, { tl: { col: 0, row: 0 }, ext: { width: 130, height: 100 } } );

    // --- Helpers ---
    const letterHeadStyleRow = ( row ) => {
        row.eachCell( ( cell ) => {
            cell.font = { bold: true, name: "Kalimati" };
            cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
        } );
    };

    const headerStyleRow = ( row ) => {
        row.eachCell( ( cell ) => {
            cell.border = {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" },
            };
            cell.font = { bold: true, name: "Kalimati" };
            cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFEFEFEF" } };
        } );
    };

    const mergeFullWidthRow = ( text ) => {
        const row = worksheet.addRow( [text] );
        worksheet.mergeCells( row.number, 1, row.number, 15 );
        letterHeadStyleRow( row );
        return row;
    };

    // --- Letterhead ---
    mergeFullWidthRow( "नेपाल सरकार" );
    mergeFullWidthRow( "गृह मन्त्रालय" );
    mergeFullWidthRow( "कारागार व्यवस्थापन विभाग" );
    mergeFullWidthRow( `${ authState.office_np }` );
    mergeFullWidthRow( `${ authState.office_district }` );
    mergeFullWidthRow( "विषयः बन्दीको स्थानान्तरण सम्बन्धमा" );

    const sn_dobRow = worksheet.addRow( [
        "पत्र सङ्ख्याः",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        `मितिः ${ formattedDateNp }`,
    ] );
    worksheet.mergeCells( sn_dobRow.number, 1, sn_dobRow.number, 2 );
    worksheet.mergeCells( sn_dobRow.number, 13, sn_dobRow.number, 15 );

    const cnRow = worksheet.addRow( ["चलानी नम्बरः"] );
    worksheet.mergeCells( cnRow.number, 1, cnRow.number, 2 );
    letterHeadStyleRow( sn_dobRow );
    letterHeadStyleRow( cnRow );

    //   const dopmAddrRow = mergeFullWidthRow("श्री कारागार व्यवस्थापन विभाग,");
    //   const dopmAddress = mergeFullWidthRow("कालीकास्थान, काठमाण्डौ ।");
    const rowDetails = mergeFullWidthRow(
        "देहाय बमोजिमका बन्दीलाई यस कारागारबाट अन्य कारागारमा स्थानान्तरण गरिदिनुहुन सिफारिस साथ अनुरोध छ।"
    );

    // --- Headers (3 rows) ---
    const row1 = worksheet.addRow( [
        "सि.नं.",
        "बन्दी आई.डी.",
        "बन्दीको नामथर र स्थायी ठेगाना",
        "मुद्दाको किसिम",
        "जन्म मिति/उमेर",
        "कैद परेको मिति",
        "छुट्ने मिति",
        "बन्दीको प्रकार",
        "जेलमा बसेको विवरण (शुरुदेखि हालसम्म)",
        "",
        "",
        "सरुवा गर्न चाहेको कार्यालयको नाम र कारण",
        "पुर्व कारागारबाट प्राप्त आचरण सम्बन्धी विवरण",
        "अन्य व्यहोरा",
        "कैफियत",
    ] );
    const row2 = worksheet.addRow( [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "कारागारको नाम",
        "मिति",
        "",
        "",
        "",
        "",
        "",
    ] );
    const row3 = worksheet.addRow( [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "देखि",
        "सम्म",
        "",
        "",
        "",
        "",
    ] );

    const startRow = row1.number;
    const endRow = startRow + 2;

    // Merges
    worksheet.mergeCells( startRow, 1, endRow, 1 );
    worksheet.mergeCells( startRow, 2, endRow, 2 );
    worksheet.mergeCells( startRow, 3, endRow, 3 );
    worksheet.mergeCells( startRow, 4, endRow, 4 );
    worksheet.mergeCells( startRow, 5, endRow, 5 );
    worksheet.mergeCells( startRow, 6, endRow, 6 );
    worksheet.mergeCells( startRow, 7, endRow, 7 );
    worksheet.mergeCells( startRow, 8, endRow, 8 );
    worksheet.mergeCells( startRow, 9, startRow, 11 );
    worksheet.mergeCells( startRow + 1, 9, endRow, 9 );
    worksheet.mergeCells( startRow + 1, 10, startRow + 1, 11 );
    worksheet.mergeCells( startRow, 12, endRow, 12 );
    worksheet.mergeCells( startRow, 13, endRow, 13 );
    worksheet.mergeCells( startRow, 14, endRow, 14 );
    worksheet.mergeCells( startRow, 15, endRow, 15 );

    // Style headers
    [row1, row2, row3].forEach( headerStyleRow );

    // Columns to rotate (headers + values)
    const rotatedCols = [2, 5, 6, 7, 8];
    // Columns to rotate (headers + values)
    const rotatedHeaders = [1, ...rotatedCols];

    // Rotate specific headers
    rotatedHeaders.forEach( ( col ) => {
        const cell = worksheet.getCell( startRow, col );
        cell.alignment = {
            wrapText: true,
            textRotation: 90,
            vertical: "middle",
            horizontal: "center",
        };
    } );

    // --- Prisoner Data ---
    let currentRow = endRow + 1;

    filteredKaidi.forEach( ( data, index ) => {
        const kaidiMuddas = fetchedMuddas[data.bandi_id] || [{}];
        const transferHistories = fetchedTransferHistory[data.bandi_id] || [{}];
        const transferCount = transferHistories.length;

        // add each transfer row
        transferHistories.forEach( ( t, mIndex ) => {
            const row = worksheet.addRow( [
                mIndex === 0 ? index + 1 : "",
                mIndex === 0 ? data.office_bandi_id : "",
                mIndex === 0
                    ? `${ data.bandi_name }\n\n${ data.country_name_np === "नेपाल"
                        ? `${ data.nepali_address }`
                        : `${ data.bidesh_nagarik_address_details }, ${ data.country_name_np }`
                    }`
                    : "",
                mIndex === 0
                    ? kaidiMuddas
                        .filter( ( mudda ) => Boolean( mudda.mudda_name ) )
                        .map( ( mudda, i ) => `${ i + 1 }. ${ mudda?.mudda_name }\n${ mudda?.mudda_no }` )
                        .join( "\n" )
                    : "",
                mIndex === 0 ? `${ data.dob } \n${ data.current_age } वर्ष` : "",
                mIndex === 0 ? data.thuna_date_bs : "",
                mIndex === 0 ? data.release_date_bs : "",
                mIndex === 0 ? `${ data.bandi_type }` : "",
                t.to_office_name || "",
                t.transfer_from_date || "",
                t.transfer_to_date || "",
                mIndex === 0
                    ? `${ data.recommended_to_office_name }\n${ data.transfer_reason_np }\n${ data.transfer_reason }`
                    : "",
                mIndex === 0 ? data.aacharan : "",
                mIndex === 0 ? data.remark || "" : "",
            ] );

            // Base cell styling for the row
            row.eachCell( ( cell ) => {
                cell.border = {
                    top: { style: "thin" },
                    left: { style: "thin" },
                    bottom: { style: "thin" },
                    right: { style: "thin" },
                };
                cell.alignment = { wrapText: true, vertical: "middle", horizontal: "center" };
            } );
        } );

        // Merge prisoner info cells (these can override alignment, so set rotation here)
        const mergeCols = [1, 2, 3, 4, 5, 6, 7, 8, 12, 13, 14, 15];
        mergeCols.forEach( ( colIndex ) => {
            worksheet.mergeCells( currentRow, colIndex, currentRow + transferCount - 1, colIndex );

            const masterCell = worksheet.getCell( currentRow, colIndex );
            const isRotated = rotatedCols.includes( colIndex );

            // Final alignment AFTER merge (so rotation sticks)
            masterCell.alignment = {
                wrapText: true,
                horizontal: "center",
                vertical: isRotated ? "middle" : "top",
                ...( isRotated ? { textRotation: 90 } : {} ),
            };
        } );

        currentRow += transferCount;
    } );

    // --- Column widths ---
    worksheet.columns = [
        { width: 6 },  // सि.नं.
        { width: 10 }, // बन्दी आई.डी.
        { width: 30 }, // नाम + ठेगाना
        { width: 17 }, // मुद्दा
        { width: 10 }, // DOB/उमेर
        { width: 10 }, { width: 10 }, { width: 10 }, // बन्दीको प्रकार सम्म
        { width: 15 }, { width: 10 }, { width: 10 }, //जेलमा बसेको विवरण
        { width: 25 }, { width: 10 }, { width: 10 }, { width: 10 },
    ];

    // Add signature section
    worksheet.addRow( [""] );
    worksheet.addRow( [""] );
    worksheet.addRow( ["", "", ".........................", "", "", "", "", "", "", "", "", "........................."] );
    worksheet.addRow( ["", "", "कारागार प्रशासक", "", "", "", "", "", "", "", "", "प्रमुख जिल्ला अधिकारी"] );
    worksheet.addRow( ["", "", "(.......)", "", "", "", "", "", "", "", "", "(.........)"] );
    worksheet.addRow( ["", "", `${ authState.office_np }`, "", "", "", "", "", "", "", "", `जिल्ला प्रशासन कार्यालय, ${ authState.office_district }`] );
    worksheet.addRow( [""] );
    worksheet.addRow( [""] );

    // Footer
    // const footerRow = worksheet.addRow( ["", "", "", "", "", "", "", "", "", "", "", "पृष्ठ संख्या: 1"] );
    // footerRow.eachCell( ( cell ) => {
    //     cell.alignment = { vertical: "middle", horizontal: "right" };
    //     cell.font = { name: "Kalimati", size: 10, italic: true };
    // } );

    // Set default font for entire worksheet
    worksheet.eachRow( row => {
        row.eachCell( cell => {
            cell.font = { name: 'Kalimati', size: 14 }; // Set font for each cell            
        } );
    } );

    // Set specific font sizes for header rows
    worksheet.getRow( 2 ).eachCell( cell => {
        cell.font = { name: 'Kalimati', size: 11, bold: true };
    } );
    worksheet.getRow( 3 ).eachCell( cell => {
        cell.font = { name: 'Kalimati', size: 12, bold: true };
    } );
    worksheet.getRow( 4 ).eachCell( cell => {
        cell.font = { name: 'Kalimati', size: 16, bold: true };
    } );
    worksheet.getRow( 5 ).eachCell( cell => {
        cell.font = { name: 'Kalimati', size: 14, bold: true };
    } );
    worksheet.getRow( 6 ).eachCell( cell => {
        cell.font = { name: 'Kalimati', size: 12, bold: true };
    } );


    // --- Freeze header rows ---
    // worksheet.views = [{ state: "frozen", ySplit: endRow }];

    // --- Save file ---
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob( [buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    } );
    saveAs( blob, "transfer_export.xlsx" );
};

export default exportToExcel;
