import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { calculateBSDate } from '../../../../../Utils/dateCalculator';
import NepaliDate from 'nepali-datetime';
import { width } from '@mui/system';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useBaseURL } from '../../../../Context/BaseURLProvider';

const exportToExcel = async ( filteredKaidi, fetchedMuddas, fetchedFines, fetchedNoPunarabedan, filters, BASE_URL ) => {
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
    const tableHeader = worksheet.addRow( [
        'सि.नं.', 'कारागार कार्यालय', 'बन्दी आई.डी.', 'कैदीको नामथर स्थायी ठेगाना', 'उमेर (वर्ष)', 'लिङ्ग', 'राष्ट्रियता',
        'मुद्दा', 'जाहेरवाला', 'मुद्दाको अन्तिम कारवाही गर्ने निकाय र अन्तिम फैसला मिति', 'पुनरावेदन नपरेको प्रमाण', 'कैद परेको मिति',
        'तोकिएको कैद (वर्ष|महिना|दिन)', 'कैदी पुर्जीमा उल्लेखित छुटि जाने मिति', 'भुक्तान कैद (वर्ष|महिना|दिन) र प्रतिशत', 'प्यारोलमा राख्नुपर्ने कैद (वर्ष|महिना|दिन) र प्रतिशत',
        'तोकिएको जरिवाना/क्षतिपुर्ती/बिगो/पिडित राहत कोष तिरेको प्रमाण',
        'कैफियत(कारागार)',
        'कैफियत(विभाग)'
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
        console.log( data );
        const kaidiMuddas = fetchedMuddas[data.bandi_id] || [{}];
        const kaidiFines = fetchedFines[data.bandi_id] || [{}];
        const bandiNoPunarabedan = fetchedNoPunarabedan[data.bandi_id] || [];

        const muddaCount = kaidiMuddas.length;
        kaidiMuddas.forEach( ( mudda, mIndex ) => {
            const kaidDuration = calculateBSDate( data.thuna_date_bs, data.release_date_bs );
            const bhuktanDuration = calculateBSDate( data.thuna_date_bs, formattedDateNp, kaidDuration );
            const bakiDuration = calculateBSDate( formattedDateNp, data.release_date_bs, kaidDuration );

            const hirasatDays = data?.hirasat_days || 0;
            const hirasatMonths = data?.hirasat_months || 0;
            const hirasatYears = data?.hirasat_years || 0;
            let totalKaidDuration = kaidDuration;
            let totalBhuktanDuration = bhuktanDuration;
            let totalBakiDuration = bakiDuration;
            if ( hirasatDays > 0 || hirasatMonths > 0 || hirasatYears > 0 ) {
                totalKaidDuration = calculateBSDate( data.thuna_date_bs, data.release_date_bs, 0, hirasatYears, hirasatMonths, hirasatDays );
                totalBhuktanDuration = calculateBSDate( data.thuna_date_bs, formattedDateNp, totalKaidDuration, hirasatYears, hirasatMonths, hirasatDays );
                totalBakiDuration = calculateBSDate( formattedDateNp, data.release_date_bs, totalKaidDuration );
            }

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
                `${ mudda.mudda_phesala_antim_office || '' } \n ${ mudda.mudda_phesala_antim_office_date || '' }`,
                mIndex === 0
                    ? bandiNoPunarabedan.map( ( noPunrabedan, i ) =>
                        `${ i + 1 }. ${ noPunrabedan.punarabedan_office || '' }को च.नं. ${ noPunrabedan.punarabedan_office_ch_no || '' } मिति ${ noPunrabedan.punarabedan_office_date || '' } ` )
                        .join( '\n' )
                    : '',
                mIndex === 0 ? data.thuna_date_bs : '',

                mIndex === 0
                    ? [
                        ( data.hirasat_days || data.hirasat_months || data.hirasat_years )
                            ? `जम्मा कैदः \n ${ totalKaidDuration.formattedDuration }\n` +
                            `हिरासत/थुना अवधीः \n ${ data?.hirasat_years || 0 } | ${ data?.hirasat_months || 0 } | ${ data?.hirasat_days || 0 }`
                            : '',
                        `बेरुजु कैदः \n ${ kaidDuration.formattedDuration }`
                    ].filter( Boolean ).join( '\n\n' )
                    : '',

                mIndex === 0 ? data.release_date_bs : '',
                // mIndex === 0 ? `${ bhuktanDuration.formattedDuration }\n${ bhuktanDuration.percentage }%` : '',
                mIndex === 0 ?
                    ( data.hirasat_days || data.hirasat_months || data.hirasat_years ) ?
                        `${ totalBhuktanDuration?.formattedDuration } \n ${ totalBhuktanDuration.percentage }%` :
                        `${ bhuktanDuration?.formattedDuration } \n ${ bhuktanDuration.percentage }%`
                    : '',
                // mIndex === 0 ? `${ bakiDuration.formattedDuration }\n${ bakiDuration.percentage }%` : '',
                mIndex === 0 ?
                    ( data.hirasat_days || data.hirasat_months || data.hirasat_years ) ?
                        `${ totalBakiDuration?.formattedDuration } \n ${ totalBakiDuration.percentage }%` :
                        `${ bakiDuration?.formattedDuration } \n ${ bakiDuration.percentage }%`
                    : '',
                mIndex === 0
                    ? kaidiFines
                        .filter( fine => Boolean( fine.deposit_office ) ) // ✅ Only keep valid ones
                        .map( ( fine, i ) =>
                            `${ i + 1 }. ${ fine.deposit_office }को मिति ${ fine.deposit_date } गतेको च.नं. ${ fine.deposit_ch_no } बाट रु.${ fine.deposit_amount } ${ fine.fine_name_np } बुझाएको ।`
                        )
                        .join( '\n' )
                    : '',


                // mIndex === 0 ? data.other_details || '' : '',
                // mIndex === 0 ? data.payrole_reason || '' : '',
                mIndex === 0 ? data.remark || '' : '',
                mIndex === 0 ? data.dopm_remarks || '' : '',
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