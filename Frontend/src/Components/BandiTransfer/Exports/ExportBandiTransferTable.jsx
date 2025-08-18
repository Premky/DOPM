import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { calculateBSDate } from '../../../../Utils/dateCalculator';
import NepaliDate from 'nepali-datetime';


const exportToExcel = async ( filteredKaidi, fetchedMuddas, fetchedTransferHistory, BASE_URL, authState ) => {

    const npToday = new NepaliDate();
    const formattedDateNp = npToday.format( 'YYYY-MM-DD' );
    const workbook = new ExcelJS.Workbook();

    const worksheet = workbook.addWorksheet( 'Bandi Export' );
    // Set page setup
    worksheet.pageSetup = {
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 0,
        orientation: 'landscape',
        paperSize: 9
    };

    // Set margins
    worksheet.pageSetup.margins = {
        left: 0.5,
        right: 0.5,
        top: 0.75,
        bottom: 0.75,
        header: 0.3,
        footer: 0.3
    };

    const imagePath = `/nepal_gov_logo.png`;
    const imageBuffer = await fetch( imagePath ).then( res => res.blob() );


    const imageId = workbook.addImage( {
        buffer: imageBuffer,
        extension: 'png'
    } );

    function applyFontToWholeSheet( worksheet ) {
        worksheet.eachRow( ( row ) => {
            row.eachCell( ( cell ) => {
                // Set the font for each cell
                cell.font = {
                    name: 'Kalimati', // Set the font family
                    // family: 4,     // Optional: set font family (e.g., 4 is for 'Arial')
                    size: 12,      // Font size (optional)
                    bold: false,   // Font weight (optional)
                    italic: false  // Font style (optional)
                };
            } );
        } );
    }

    function letterHeadStyleRow( row ) {
        row.eachCell( ( cell ) => {
            cell.font = { bold: true, name: 'Kalimati', };
            cell.alignment = { textRotation: 0, vertical: 'middle', horizontal: 'center', wrapText: true };
        } );
    }

    function basicStyleRow( row ) {
        row.eachCell( ( cell ) => {
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' },
            };
            cell.font = { bold: true };
            cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        } );
    }
    // Add headers
    // 'रोगी/अशक्त',
    // 'सिफारिसको आधार',
    const logoRow = worksheet.addImage( imageId, { tl: { col: 0, row: 0 }, ext: { width: 130, height: 100 }, } );
    // worksheet.mergeCells( logoRow.number, 1, logoRow.number, 15 );
    const nepalGovRow = worksheet.addRow( ['नेपाल सरकार'] );
    worksheet.mergeCells( nepalGovRow.number, 1, nepalGovRow.number, 15 );
    const homeMinistryRow = worksheet.addRow( ['गृह मन्त्रालय'] );
    worksheet.mergeCells( homeMinistryRow.number, 1, homeMinistryRow.number, 15 );
    const dopmRow = worksheet.addRow( ['कारागार व्यवस्थापन विभाग'] );
    worksheet.mergeCells( dopmRow.number, 1, dopmRow.number, 15 );
    const officeRow = worksheet.addRow( [`${ authState.office_np }`] );
    worksheet.mergeCells( officeRow.number, 1, officeRow.number, 15 );
    const officeAddressRow = worksheet.addRow( [`${ authState.office_district }`] );
    worksheet.mergeCells( officeAddressRow.number, 1, officeAddressRow.number, 15 );
    const subRow = worksheet.addRow( ['विषयः बन्दीको स्थानान्तरण सम्बन्धमा'] );
    worksheet.mergeCells( subRow.number, 1, subRow.number, 15 );
    const sn_dobRow = worksheet.addRow( ['पत्र सङ्ख्याः', '', '', '', '', '', '', '', '', '', '', 'मितिः', formattedDateNp] );
    worksheet.mergeCells( sn_dobRow.number, 1, sn_dobRow.number, 2 );
    worksheet.mergeCells( sn_dobRow.number, 13, sn_dobRow.number, 15 );
    const cnRow = worksheet.addRow( ['चलानी नम्बरः'] );
    worksheet.mergeCells( cnRow.number, 1, cnRow.number, 2 );
    const dopmAddrRow = worksheet.addRow( ['श्री कारागार व्यवस्थापन विभाग,'] );
    worksheet.mergeCells( dopmAddrRow.number, 1, dopmAddrRow.number, 15 );
    const dopmAddress = worksheet.addRow( ['कालीकास्थान, काठमाण्डौ ।'] );
    worksheet.mergeCells( dopmAddress.number, 1, dopmAddress.number, 15 );
    const rowDetails = worksheet.addRow( ['देहाय बमोजिमका बन्दीलाई यस कारागारबाट अन्य कारागारमा स्थानान्तरण गरिदिनुहुन सिफारिस साथ अनुरोध छ।'] );
    worksheet.mergeCells( rowDetails.number, 1, rowDetails.number, 15 );



    const row = worksheet.addRow( [
        'सि.नं.', 'बन्दी आई.डी.', 'बन्दीको नामथर र स्थायी ठेगाना', 'मुद्दाको किसिम', 'जन्म मिति/उमेर',
        'कैद परेको मिति', 'छुट्ने मिति', 'बन्दीको प्रकार', 'जेलमा बसेको विवरण (शुरुदेखि हालसम्म)', '', '',
        'सरुवा गर्न चाहेको कार्यालयको नाम र कारण', 'पुर्व कारागारबाट प्राप्त आचरण सम्बन्धी विवरण',
        'अन्य व्यहोरा', 'कैफियत'
    ] );
    const headerrow2 = worksheet.addRow( ['', '', '', '', '', '', '', '', 'कारागारको नाम', 'मिति', '', '', ''] );
    const headerrow3 = worksheet.addRow( ['', '', '', '', '', '', '', '', '', 'देखि', 'सम्म', '', ''] );

    // Calculate the new row numbers dynamically
    let startRow = 13;
    let endRow = startRow + 2; // Merging over three rows (11 to 13)

    // Merge cells dynamically based on row references
    worksheet.mergeCells( startRow, 1, endRow, 1 ); // A11:A13
    worksheet.mergeCells( startRow, 2, endRow, 2 ); // B11:B13
    worksheet.mergeCells( startRow, 3, endRow, 3 ); // C11:C13
    worksheet.mergeCells( startRow, 4, endRow, 4 ); // D11:D13
    worksheet.mergeCells( startRow, 5, endRow, 5 ); // E11:E13
    worksheet.mergeCells( startRow, 6, endRow, 6 ); // F11:F13
    worksheet.mergeCells( startRow, 7, endRow, 7 ); // G11:G13
    worksheet.mergeCells( startRow, 8, endRow, 8 ); // H11:H13
    worksheet.mergeCells( startRow, 9, startRow, 11 ); // I11:K11
    worksheet.mergeCells( startRow + 1, 9, startRow + 2, 9 ); // I12:I13
    worksheet.mergeCells( startRow + 1, 10, startRow + 1, 11 ); // J12:K12
    worksheet.mergeCells( startRow, 12, endRow, 12 ); // L11:L13
    worksheet.mergeCells( startRow, 13, endRow, 13 ); // M11:M13
    worksheet.mergeCells( startRow, 14, endRow, 14 ); // N11:N13
    worksheet.mergeCells( startRow, 15, endRow, 15 ); // O11:O13

    basicStyleRow( row );
    basicStyleRow( headerrow2 );
    basicStyleRow( headerrow3 );

    let currentRow = 16; // Start from row 2 (row 1 = header)
    console.log( filteredKaidi );
    filteredKaidi.forEach( ( data, index ) => {
        const kaidiMuddas = fetchedMuddas[data.bandi_id] || [{}];
        const transferHistories = fetchedTransferHistory[data.bandi_id] || [{}];
        const transferCount = transferHistories.length;

        transferHistories.forEach( ( t, mIndex ) => {

            const row = worksheet.addRow( [
                mIndex === 0 ? index + 1 : '',
                mIndex === 0 ? data.office_bandi_id : '',
                mIndex === 0
                    ? `${ data.bandi_name }\n\n${ data.country_name_np === 'नेपाल'
                        ? `${ data.nepali_address }`
                        : `${ data.bidesh_nagarik_address_details }, ${ data.country_name_np }` }`
                    : '',
                mIndex === 0
                    ? kaidiMuddas
                        .filter( mudda => Boolean( mudda.mudda_name ) ) // ✅ Only keep valid ones
                        .map( ( mudda, i ) =>
                            `${ i + 1 }. ${ mudda?.mudda_name }\n${ mudda?.mudda_no }`
                        )
                        .join( '\n' )
                    : '',
                mIndex === 0 ? `${ data.dob } \n${ data.current_age } वर्ष` : '',

                mIndex === 0 ? data.thuna_date_bs : '',
                mIndex === 0 ? data.release_date_bs : '',
                mIndex === 0 ? `${ data.bandi_type }` : '',


                t.to_office_name || '',
                t.transfer_from_date || '',
                t.transfer_to_date || '',


                mIndex === 0 ? `${ data.recommended_to_office_name }\n${ data.transfer_reason_np }\n${ data.transfer_reason }` : '',
                mIndex === 0 ? data.aacharan : '',

                mIndex === 0 ? data.remark || '' : '',

            ] );
            // row.eachCell( ( cell ) => {
            //     cell.border = {
            //         top: { style: 'thin' },
            //         left: { style: 'thin' },
            //         bottom: { style: 'thin' },
            //         right: { style: 'thin' }
            //     };
            // } );
            applyFontToWholeSheet( worksheet );

            row.eachCell( ( cell ) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' },
                };
                cell.alignment = { textRotation: 0, vertical: 'middle', horizontal: 'center', wrapText: true };
            } );
            officeRow.eachCell( ( cell ) => {
                cell.font = {
                    name: 'Kalimati', // Set the font family
                    // family: 4,     // Optional: set font family (e.g., 4 is for 'Arial')
                    size: 16,      // Font size (optional)
                    bold: false,   // Font weight (optional)
                    italic: false  // Font style (optional)
                };
                cell.alignment = { textRotation: 0, vertical: 'middle', horizontal: 'center', wrapText: true };
            } );

            letterHeadStyleRow( nepalGovRow );
            letterHeadStyleRow( homeMinistryRow );
            letterHeadStyleRow( dopmRow );
            letterHeadStyleRow( officeRow );
            letterHeadStyleRow( officeAddressRow );
            letterHeadStyleRow( subRow );

        } );

        // 🔄 Merge cells for कैदी info
        const mergeCols = [1, 2, 3, 4, 5, 6, 7, 8, 12, 13, 14, 15, 16, 17, 18, 19];

        mergeCols.forEach( ( colIndex ) => {
            worksheet.mergeCells( currentRow, colIndex, currentRow + transferCount - 1, colIndex );
            // Apply wrapText to merged cell
            const cell = worksheet.getCell( currentRow, colIndex );
            cell.alignment = { wrapText: true, vertical: 'top' };
        } );

        // ✅ Rotate ONLY the DOB/age merged cell (column 5) for this prisoner
        const dobMergedCell = worksheet.getCell( currentRow, 5 );
        dobMergedCell.alignment = {
            wrapText: true,
            textRotation: 90,
            vertical: 'middle',
            horizontal: 'center',
        };
        const dobBandiCell = worksheet.getCell( currentRow, 2 );
        dobBandiCell.alignment = {
            wrapText: true,
            textRotation: 90,
            vertical: 'middle',
            horizontal: 'center',
        };

        currentRow += transferCount;
    } );

    // Set column width
    worksheet.columns.forEach( column => {
        // column.width = 20;

    } );




    // Save file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob( [buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' } );
    saveAs( blob, 'transfer_export.xlsx' );
};
export default exportToExcel;