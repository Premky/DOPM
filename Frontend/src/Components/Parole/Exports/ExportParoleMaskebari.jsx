
export const exportMaskebariCountToExcel = async ( filteredRecords, totals ) => {
    const ExcelJS = await import( 'exceljs' );
    const { saveAs } = await import( "file-saver" );
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet( "Parole Maskebari" );

    worksheet.pageSetup = {
        fitToPage: true,
        orientation: "landscape",
        margins: { left: 0.5, right: 0.5, top: 0.75, bottom: 0.75 },
    };

    // --- Header rows with merged cells ---
    // Row 1 (main headers)
    const main_headers = [
        { title: "क्र.सं.", colspan: 1 },
        { title: "कारागार कार्यालयको नाम", colspan: 1 },
        { title: "प्यारोल बोर्डबाट प्यारोलमा राख्न सिफारिस", colspan: 4 },
        { title: "हाल सम्म प्यारोलमा रहेका", colspan: 4 },
        { title: "प्यारोल बोर्डबाट सिफारिस भएकाहरु मध्ये अदालतबाट प्यारोलमा नराख्ने", colspan: 4 },
        { title: "प्यारोलमा रहेका मध्ये कैद भुक्तान", colspan: 4 },
        { title: "हाल प्यारोलमा रहेका जम्मा", colspan: 4 },
        { title: "अन्य जिल्लाबाट आएकाहरुको जिल्लागत कैदी संख्या", colspan: 4 },
        { title: "अन्य जिल्लामा गएका जि्लागत कैदी संख्या", colspan: 4 },
        { title: "शर्त पालना नगर्नेको संख्या", colspan: 4 },
        { title: "शर्त पालना गर्नेको संख्या", colspan: 4 },
        { title: "कैफियत", colspan: 1 }
    ];
    let mainHeader = [];
    main_headers.forEach( h => {
        mainHeader.push( h.title );
        for ( let i = 1; i < h.colspan; i++ ) mainHeader.push( "" ); //adds banks cells
    } );
    const mainHeaderRow = worksheet.addRow( mainHeader );

    //Row 2 (heaers description)

    // Row 3 (sub-headers: महिला, पुरुष, अन्य, जम्मा)
    const sub_headers = [
        "", "",
        "महिला", "पुरुष", "अन्य", "जम्मा",
        "महिला", "पुरुष", "अन्य", "जम्मा",
        "महिला", "पुरुष", "अन्य", "जम्मा",
        "महिला", "पुरुष", "अन्य", "जम्मा",
        "महिला", "पुरुष", "अन्य", "जम्मा",
        "महिला", "पुरुष", "अन्य", "जम्मा",
        "महिला", "पुरुष", "अन्य", "जम्मा",
        "महिला", "पुरुष", "अन्य", "जम्मा",
        "महिला", "पुरुष", "अन्य", "जम्मा",
    ];
    const subHeaderRow = worksheet.addRow( sub_headers );

    // 4. Set column widths to make text visible
    const columnWidths = [
        5, 40, 20, 20, 20, 20, 20, 20, 20, 20, 20, 25
    ];
    for ( let i = 1; i <= columnWidths.length; i++ ) {
        worksheet.getColumn( i ).width = columnWidths[i - 1];
    }
    for ( let i = 13; i <= 38; i++ ) {
        worksheet.getColumn( i ).width = 12; // placeholder columns
    }
    // --- Totals row ---
    const totalsRow = [
        "कुल जम्मा", "",
        totals.total_decision_count_female || 0,
        totals.total_decision_count_male || 0,
        totals.total_decision_count_other || 0,
        totals.total_decision_count || 0,
        totals.total_payrole_count_female || 0,
        totals.total_payrole_count_male || 0,
        totals.total_payrole_count_other || 0,
        totals.total_payrole_count || 0,
        totals.total_no_from_court_count_female || 0,
        totals.total_no_from_court_count_male || 0,
        totals.total_no_from_court_count_other || 0,
        totals.total_no_from_court_count || 0,
        totals.total_bhuktan_count_female || 0,
        totals.total_bhuktan_count_male || 0,
        totals.total_bhuktan_count_other || 0,
        totals.total_bhuktan_count || 0,
        totals.total_current_payrole_count_female || 0,
        totals.total_current_payrole_count_male || 0,
        totals.total_current_payrole_count_other || 0,
        totals.total_current_payrole_count || 0,
        totals.total_in_district_wise_count_female || 0,
        totals.total_in_district_wise_count_male || 0,
        totals.total_in_district_wise_count_other || 0,
        totals.total_in_district_wise_count || 0,
        totals.total_out_district_wise_count_female || 0,
        totals.total_out_district_wise_count_male || 0,
        totals.total_out_district_wise_count_other || 0,
        totals.total_out_district_wise_count || 0,
        totals.total_no_payrole_count_female || 0,
        totals.total_no_payrole_count_male || 0,
        totals.total_no_payrole_count_other || 0,
        totals.total_no_payrole_count || 0,
        totals.total_payrole_regulation_female || 0,
        totals.total_payrole_regulation_male || 0,
        totals.total_payrole_regulation_other || 0,
        totals.total_payrole_regulation || 0,
        ""
    ];


    // --- Data rows ---
    filteredRecords.forEach( ( row, index ) => {
        worksheet.addRow( [
            index + 1,
            row.office_name,
            row.total_decision_count_female,
            row.total_decision_count_male,
            row.total_decision_count_other,
            row.total_decision_count,
            row.total_payrole_count_female,
            row.total_payrole_count_male,
            row.total_payrole_count_other,
            row.total_payrole_count,
            row.total_no_from_court_count_female,
            row.total_no_from_court_count_male,
            row.total_no_from_court_count_other,
            row.total_no_from_court_count,
            row.total_bhuktan_count_female,
            row.total_bhuktan_count_male,
            row.total_bhuktan_count_other,
            row.total_bhuktan_count,
            row.total_current_payrole_count_female,
            row.total_current_payrole_count_male,
            row.total_current_payrole_count_other,
            row.total_current_payrole_count,
            row.total_in_district_wise_count_female,
            row.total_in_district_wise_count_male,
            row.total_in_district_wise_count_other,
            row.total_in_district_wise_count,
            row.total_out_district_wise_count_female,
            row.total_out_district_wise_count_male,
            row.total_out_district_wise_count_other,
            row.total_out_district_wise_count,
            row.total_no_payrole_count_female,
            row.total_no_payrole_count_male,
            row.total_no_payrole_count_other,
            row.total_no_payrole_count,
            row.total_payrole_regulation_female,
            row.total_payrole_regulation_male,
            row.total_payrole_regulation_other,
            row.total_payrole_regulation,
            row.remarks || ""
        ] );
    } );

    // worksheet.addRow( totalsRow );
    // --- Footer for signatures ---
    worksheet.addRow( [] );
    worksheet.addRow( [] );
    worksheet.addRow( ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "कारागार प्रशासक"] );

    // --- Merge cells ---
    worksheet.mergeCells( 'A1:A2' );
    worksheet.mergeCells( 'B1:B2' );
    let colIndex = 1;
    main_headers.forEach( h => {
        if ( h.colspan > 1 ) {
            const start = colIndex;
            const end = colIndex + h.colspan - 1;
            worksheet.mergeCells( mainHeaderRow.number, start, mainHeaderRow.number, end );
        }
        colIndex += h.colspan;
    } );

    // --- Style header cells ---
    worksheet.getRow( 1 ).eachCell( ( cell ) => {
        cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
        cell.font = { bold: true };
    } );
    worksheet.getRow( 2 ).eachCell( ( cell ) => {
        cell.alignment = { vertical: "middle", horizontal: "center" };
        cell.font = { bold: true };
    } );
    
    // --- Export ---
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs( new Blob( [buffer] ), "payrole_maskebari.xlsx" );
};