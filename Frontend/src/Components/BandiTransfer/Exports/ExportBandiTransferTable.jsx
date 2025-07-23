import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { calculateBSDate } from '../../../../Utils/dateCalculator';
import NepaliDate from 'nepali-datetime';
import { width } from '@mui/system';

const exportToExcel = async ( filteredKaidi, fetchedMuddas, fetchedTransferHistory ) => {
    const npToday = new NepaliDate();
    const formattedDateNp = npToday.format( 'YYYY-MM-DD' );
    const workbook = new ExcelJS.Workbook();

    const worksheet = workbook.addWorksheet( 'Payrole Export' );
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
    // Add headers
    // 'रोगी/अशक्त',
    // 'सिफारिसको आधार',
    const nepalGovRow = worksheet.addRow( ['नेपाल सरकार'] );    
    const homeMinistryRow = worksheet.addRow( ['गृह मन्त्रालय'] );    
    const dopmRow = worksheet.addRow( ['कारागार व्यवस्थापन विभाग'] );    
    const subRow = worksheet.addRow( ['विषयः बन्दीको स्थानान्तरण सम्बन्धमा'] );
    const sn_dobRow= worksheet.addRow(['पत्र सङ्ख्याः','','', '', '', '', '', '', 'मिति'])
    const cnRow= worksheet.addRow(['चलानी नम्बरः','','', '', '', '', '', '', ''])
   
     subRow.eachCell( ( cell ) => {
        cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };
        cell.font = { bold: true }; // Optional: bold for header
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    } );
    const dopmAddrRow = worksheet.addRow( ['श्री कारागार व्यवस्थापन विभाग,'] );
    const row1 = worksheet.addRow( ['कालीकास्थान, काठमाण्डौ ।'] );
    const rowDetails = worksheet.addRow( ['देहाय बमोजिमका बन्दीलाई यस कारागारबाट अन्य कारागारमा स्थानान्तरण गरिदिनुहुन सिफारिस साथ अनुरोध छ।'] );
    const row = worksheet.addRow( [
        'सि.नं.', 'बन्दी आई.डी.', 'बन्दीको नामथर र स्थायी ठेगाना', 'मुद्दाको किसिम', 'जन्म मिति/उमेर',
        'कैद परेको मिति', 'छुट्ने मिति', 'बन्दीको प्रकार', 'जेलमा बसेको विवरण (शुरुदेखि हालसम्म)', '', '',
        'सरुवा गर्न चाहेको कार्यालयको नाम र कारण', 'पुर्व कारागारबाट प्राप्त आचरण सम्बन्धी विवरण',
        'अन्य व्यहोरा', 'कैफियत'
    ] );
    const headerrow2 = worksheet.addRow( ['', '', '', '', '', '', '', '', 'कारागारको नाम', 'मिति', '', '', ''] );
    const headerrow3 = worksheet.addRow( ['', '', '', '', '', '', '', '', '', 'देखि', 'सम्म', '', ''] );
    // worksheet.mergeCells( 'I6:K6' );
    // worksheet.mergeCells( 'A6:A7' );
    // worksheet.mergeCells( 'B5:B7' );
    // worksheet.mergeCells( 'C5:C7' );
    // worksheet.mergeCells( 'D5:D7' );
    // worksheet.mergeCells( 'E5:E7' );
    // worksheet.mergeCells( 'F5:F7' );
    // worksheet.mergeCells( 'G5:G7' );
    // worksheet.mergeCells( 'H5:H7' );
    // worksheet.mergeCells( 'I6:I7' );
    // worksheet.mergeCells( 'J6:K6' );
    // worksheet.mergeCells( 'L5:L7' );
    // worksheet.mergeCells( 'M5:M7' );
    // worksheet.mergeCells( 'N5:N7' );
    // worksheet.mergeCells( 'O5:O7' );

    row.eachCell( ( cell ) => {
        cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };
        cell.font = { bold: true }; // Optional: bold for header
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    } );
    headerrow2.eachCell( ( cell ) => {
        cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };
        cell.font = { bold: true }; // Optional: bold for header
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    } );
    headerrow3.eachCell( ( cell ) => {
        cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };
        cell.font = { bold: true }; // Optional: bold for header
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    } );

    let currentRow = 8; // Start from row 2 (row 1 = header)

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
                
                
                mIndex === 0 ? `${data.recommended_to_office_name}\n${data.transfer_reason_np}\n${data.transfer_reason}`: '',
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
        const mergeCols = [1, 2, 3, 4, 5, 6,7,8, 12, 13, 14, 15, 16, 17, 18, 19];
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