// import ExcelJS from 'exceljs';
import { calculateBSDate } from '../../../../Utils/dateCalculator';
import NepaliDate from 'nepali-datetime';
import axios from 'axios';

const exportToExcel = async ( filteredKaidi, fetchedMuddas, fetchedFines, filters, BASE_URL ) => {
    const ExcelJS = await import("exceljs");
    const { saveAs } = await import("file-saver");
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
        top: 1,
        bottom: 0.75,
        header: 0.3,
        footer: 0.3
    };
    // Add headers
    // 'रोगी/अशक्त',
    // 'सिफारिसको आधार',

    let office = "सबै";
    if ( filters.searchOffice ) {
        try {
            const { data } = await axios.get( `${ BASE_URL }/payrole/get_selected_office/${ filters.searchOffice }`, {
                withCredentials: true,
            } );
            office = data?.[0]?.office_name || "अज्ञात कार्यालय";
        } catch ( err ) {
            console.error( "Office fetch failed:", err );
        }
    }

    let mudda = "सबै";
    if ( filters.searchmudda_id ) {
        try {
            const { data } = await axios.get( `${ BASE_URL }/payrole/get_selected_mudda_group/${ filters.searchmudda_id }`, {
                withCredentials: true,
            } );
            mudda = data?.[0]?.mudda_group_name || "अज्ञात मुद्दा समूह";
        } catch ( err ) {
            console.error( "Mudda fetch failed:", err );
        }
    }


    worksheet.getCell( 'A1' ).value = 'कार्यालय';
    worksheet.mergeCells( 'B1', 'G1' );
    worksheet.getCell( 'B1' ).value = office;
    worksheet.getCell( 'H1' ).value = 'मुद्दा';
    worksheet.mergeCells( 'I1', 'L1' );
    worksheet.getCell( 'I1' ).value = mudda;
    worksheet.getCell( 'Q1' ).value = 'संख्या';
    worksheet.getCell( 'R1' ).value = filteredKaidi.length;
    const tableHeader1 = worksheet.addRow( [
        'सि.नं.', 'कारागार कार्यालय',
        'प्यारोल बोर्डबाट प्यारोलमा राख्न सिफारिस भएका कुल संख्या', '', '', '',
        'हाल सम्म प्यारोलमा रहेका कुल संख्या(प्यारोल बोर्डको पहिलो बैठक देखि हालसम्मा प्यारोलमा राख्न सिफारिस भएकाहरु मध्ये शुरु जिल्ला अदालतको आदेश बमोजिम प्यारोलमा रहेका जम्मा संख्या)', '', '', '',
        'प्यारोल बोर्डबाट सिफारिस भएकाहरु मध्ये अदालतबाट प्यारोलमा राख्ने नमिल्ने भनि आदेश भएका संख्या', '', '', '',
        'प्यारोलमा रहेका मध्ये कैद भुक्तान भएका संख्या(तहाँ कारागारबाट अन्य कारागारमा प्यारोलमा रही कैद भुक्तान भएकाहरुको संख्या समेत जोड्ने)', '', '', '',
        'हाल प्यारोलमा रहेका जम्मा संख्या(अन्य जि्लामा गएका हाल नियमित रुपमा तारेखमा रहेका समेत जोड्ने र शर्त पालना नभएकाहरु अन्य जि्लाबाट आएकाहरु नियमित हाजिर भएकाहरु समेत समावेश नगर्ने)', '', '', '',
        'अन्य जिल्लाबाट आएकाहरुको जिल्लागत कैदी संख्या(हाल नियमित तारेखमा रहेका मात्र उल्लेख गर्ने)', '', '', '',
        'अन्य जिल्लामा गएकाहरुको जि्लागत कैदी संख्या(अन्य जिल्लामा गएका हाल नियमित तारेखमा रहेकाको संख्या उल्लेख गर्ने)', '', '', '',
        'शर्त पालना नगर्नेको संख्या(तहाँ जिल्लाबाट प्यारोलमा रहेको वा अन्य जिल्लाबाट आएको वा अन्य जिल्ला गएको सो समेत खुलाउने)', '', '', '',
        'शर्त पालना गर्नेको संख्या','','','',
        'कैफियत'
    ] );
    const tableHeader2 = worksheet.addRow( [
        'सि.नं.', 'कारागार कार्यालय',
        'प्यारोल बोर्डबाट प्यारोलमा राख्न सिफारिस भएका कुल संख्या', '', '', '',
        'हाल सम्म प्यारोलमा रहेका कुल संख्या(प्यारोल बोर्डको पहिलो बैठक देखि हालसम्मा प्यारोलमा राख्न सिफारिस भएकाहरु मध्ये शुरु जिल्ला अदालतको आदेश बमोजिम प्यारोलमा रहेका जम्मा संख्या)', '', '', '',
        'प्यारोल बोर्डबाट सिफारिस भएकाहरु मध्ये अदालतबाट प्यारोलमा राख्ने नमिल्ने भनि आदेश भएका संख्या', '', '', '',
        'प्यारोलमा रहेका मध्ये कैद भुक्तान भएका संख्या(तहाँ कारागारबाट अन्य कारागारमा प्यारोलमा रही कैद भुक्तान भएकाहरुको संख्या समेत जोड्ने)', '', '', '',
        'हाल प्यारोलमा रहेका जम्मा संख्या(अन्य जि्लामा गएका हाल नियमित रुपमा तारेखमा रहेका समेत जोड्ने र शर्त पालना नभएकाहरु अन्य जि्लाबाट आएकाहरु नियमित हाजिर भएकाहरु समेत समावेश नगर्ने)', '', '', '',
        'अन्य जिल्लाबाट आएकाहरुको जिल्लागत कैदी संख्या(हाल नियमित तारेखमा रहेका मात्र उल्लेख गर्ने)', '', '', '',
        'अन्य जिल्लामा गएकाहरुको जि्लागत कैदी संख्या(अन्य जिल्लामा गएका हाल नियमित तारेखमा रहेकाको संख्या उल्लेख गर्ने)', '', '', '',
        'शर्त पालना नगर्नेको संख्या(तहाँ जिल्लाबाट प्यारोलमा रहेको वा अन्य जिल्लाबाट आएको वा अन्य जिल्ला गएको सो समेत खुलाउने)', '', '', '',
        'शर्त पालना गर्नेको संख्या','','','',
        'कैफियत'
    ] );
    tableHeader.eachCell( ( cell ) => {
        cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };
        cell.font = { bold: true }; // Optional: bold for header
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    } );

    let currentRow = 3; // Start from row 2 (row 1 = header)

    filteredKaidi.forEach( ( data, index ) => {
        const kaidiMuddas = fetchedMuddas[data.bandi_id] || [{}];
        const kaidiFines = fetchedFines[data.bandi_id] || [{}];
        const muddaCount = kaidiMuddas.length;
        kaidiMuddas.forEach( ( mudda, mIndex ) => {
            const kaidDuration = calculateBSDate( data.thuna_date_bs, data.release_date_bs );
            const bhuktanDuration = calculateBSDate( data.thuna_date_bs, formattedDateNp, kaidDuration );
            const bakiDuration = calculateBSDate( formattedDateNp, data.release_date_bs, kaidDuration );

            const row = worksheet.addRow( [
                mIndex === 0 ? index + 1 : '',
                mIndex === 0 ? data.letter_address : '',
                mIndex === 0 ? data.office_bandi_id : '',
                mIndex === 0
                    ? `${ data.bandi_name }\n${ data.nationality === 'स्वदेशी'
                        ? `${ data.city_name_np }-${ data.wardno },\n ${ data.district_name_np }, ${ data.state_name_np }, ${ data.country_name_np }`
                        : `${ data.bidesh_nagarik_address_details }, ${ data.country_name_np }` }`
                    : '',
                mIndex === 0 ? data.current_age : '',
                mIndex === 0 ? ( data.gender === 'Male' ? 'पुरुष' : data.gender === 'Female' ? 'महिला' : 'अन्य' ) : '',

                mIndex === 0 ? data.country_name_np : '',

                `${ mudda.mudda_name }\n${ mudda.mudda_no }` || '',
                mudda.vadi || '',
                `${ mudda.punarabedan_office || '' } \n ${ mudda.mudda_phesala_antim_office_date || '' }`,
                mIndex === 0
                    ? `${ data.office_name_with_letter_address || '' }को च.नं. ${ data.punarabedan_office_ch_no || '' } मिति ${ data.punarabedan_office_date || '' }`
                    : '',
                mIndex === 0 ? data.thuna_date_bs : '',
                mIndex === 0 ? `${ kaidDuration.formattedDuration }` : '',
                mIndex === 0 ? data.release_date_bs : '',
                mIndex === 0 ? `${ bhuktanDuration.formattedDuration }\n${ bhuktanDuration.percentage }%` : '',
                mIndex === 0 ? `${ bakiDuration.formattedDuration }\n${ bakiDuration.percentage }%` : '',
                mIndex === 0
                    ? kaidiFines
                        .map( ( fine, i ) => `${ i + 1 }. ${ fine.deposit_office }को मिति ${ fine.deposit_date } गतेको च.नं. ${ fine.deposit_ch_no } बाट रु.${ fine.deposit_amount } ${ fine.fine_name_np } बुझाएको ।` )
                        .join( '\n' )
                    : '',

                // mIndex === 0 ? data.other_details || '' : '',
                // mIndex === 0 ? data.payrole_reason || '' : '',
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
        const mergeCols = [1, 2, 3, 4, 5, 6, 7, 11, 12, 13, 14, 15, 16, 17, 18];
        // const mergeCols = [2, 3, 4, 5, 6,7, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

        mergeCols.forEach( ( colIndex ) => {
            worksheet.mergeCells( currentRow, colIndex, currentRow + muddaCount - 1, colIndex );
            // Apply wrapText to merged cell
            const cell = worksheet.getCell( currentRow, colIndex );
            cell.alignment = { wrapText: true, vertical: 'top' };
        } );

        currentRow += muddaCount;
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