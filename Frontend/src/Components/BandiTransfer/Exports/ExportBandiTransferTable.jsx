import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { calculateBSDate } from '../../../../Utils/dateCalculator';
import NepaliDate from 'nepali-datetime';

const exportToExcel = async ( filteredKaidi, fetchedMuddas, fetchedTransferHistory, BASE_URL ) => {
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

    const imagePath = `/nepal_gov_logo.png`
    const imageBuffer = await fetch(imagePath).then(res=>res.blob());
    

    const imageId = workbook.addImage({
        buffer:imageBuffer, 
        extension:'png'
    })

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

    applyFontToWholeSheet(worksheet)

    function letterHeadStyleRow( row ) {
        row.eachCell( ( cell ) => {
            cell.font = { bold: true };
            cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
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
    worksheet.addImage(imageId, {tl:{col:0, row:0},ext:{width:150, height:100},})
    const nepalGovRow = worksheet.addRow( ['नेपाल सरकार'] );
    worksheet.mergeCells( nepalGovRow.number, 1, nepalGovRow.number, 15 );
    const homeMinistryRow = worksheet.addRow( ['गृह मन्त्रालय'] );
    worksheet.mergeCells( homeMinistryRow.number, 1, homeMinistryRow.number, 15 );
    const dopmRow = worksheet.addRow( ['कारागार व्यवस्थापन विभाग'] );
    worksheet.mergeCells( dopmRow.number, 1, dopmRow.number, 15 );
    const officeRow = worksheet.addRow( ['कारागार कार्यालय ..........'] );
    worksheet.mergeCells( officeRow.number, 1, officeRow.number, 15 );
    const officeAddressRow = worksheet.addRow( ['(..........)'] );
    worksheet.mergeCells( officeAddressRow.number, 1, officeAddressRow.number, 15 );
    const subRow = worksheet.addRow( ['विषयः बन्दीको स्थानान्तरण सम्बन्धमा'] );
    worksheet.mergeCells( subRow.number, 1, subRow.number, 15 );
    const sn_dobRow = worksheet.addRow( ['पत्र सङ्ख्याः', '', '', '', '', '', '', '', '', '', '', 'मिति'] );
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

    letterHeadStyleRow( nepalGovRow );
    letterHeadStyleRow( homeMinistryRow );
    letterHeadStyleRow( dopmRow );
    letterHeadStyleRow( officeRow );
    letterHeadStyleRow( officeAddressRow );
    letterHeadStyleRow( subRow );
    officeRow.eachCell( ( cell ) => {
        cell.font = {
            name: 'Kalimati', // Set the font family
            // family: 4,     // Optional: set font family (e.g., 4 is for 'Arial')
            size: 16,      // Font size (optional)
            bold: false,   // Font weight (optional)
            italic: false  // Font style (optional)
        };
    } );

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

    filteredKaidi.forEach( ( data, index ) => {
        const transferHistories = fetchedTransferHistory[data.bandi_id] || [{}];
        const transferCount = transferHistories.length;
        transferHistories.forEach( ( t, mIndex ) => {

            const row = worksheet.addRow( [
                mIndex === 0 ? index + 1 : '',
                mIndex === 0 ? data.office_bandi_id : '',
                mIndex === 0
                    ? `${ data.bandi_name }\n${ data.nationality === 'स्वदेशी'
                        ? `${ data.city_name_np }-${ data.wardno },\n ${ data.district_name_np }, ${ data.state_name_np }, ${ data.country_name_np }`
                        : `${ data.bidesh_nagarik_address_details }, ${ data.country_name_np }` }`
                    : '',
                `${ t.mudda_name }\n${ t.mudda_no }` || '',
                mIndex === 0 ? `${ data.dob } \n${ data.current_age }` : '',

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
            row.eachCell( ( cell ) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            } );
        } );

        // 🔄 Merge cells for कैदी info
        const mergeCols = [1, 2, 3, 4, 5, 6, 7, 8, 12, 13, 14, 15, 16, 17, 18, 19];
        // const mergeCols = [2, 3, 4, 5, 6,7, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

        mergeCols.forEach( ( colIndex ) => {
            worksheet.mergeCells( currentRow, colIndex, currentRow + transferCount - 1, colIndex );
            // Apply wrapText to merged cell
            const cell = worksheet.getCell( currentRow, colIndex );
            cell.alignment = { wrapText: true, vertical: 'top' };
        } );

        currentRow += transferCount;
    } );

    // Set column width
    worksheet.columns.forEach( column => {
        // column.width = 20;

    } );




    // Save file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob( [buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' } );
    saveAs( blob, 'payrole_export.xlsx' );
};
export default exportToExcel;