import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { calculateBSDate } from '../../../../../Utils/dateCalculator';
import NepaliDate from 'nepali-datetime';
import { width } from '@mui/system';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useBaseURL } from '../../../../Context/BaseURLProvider';

const exportCharacterToExcel = async ( filteredKaidi, fetchedMuddas, fetchedFines, fetchedNoPunarabedan, filters, BASE_URL ) => {
    const npToday = new NepaliDate();
    const formattedDateNp = npToday.format( 'YYYY-MM-DD' );
    const workbook = new ExcelJS.Workbook();


    const worksheet = workbook.addWorksheet( 'Payrole Character Export' );
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

         

    // Add headers
    const anusuchHeader = worksheet.addRow( ['अनुसूची १'] );
    worksheet.mergeCells( `A${ anusuchHeader.number }:J${ anusuchHeader.number }` );
    anusuchHeader.getCell( 1 ).alignment = { vertical: 'middle', horizontal: 'center' };

    const niyamHeader = worksheet.addRow( ['(नियम ४ को उपनियम (१) सँग सम्बन्धित)'] );
    worksheet.mergeCells( `A${ niyamHeader.number }:J${ niyamHeader.number }` );
    niyamHeader.getCell( 1 ).alignment = { vertical: 'middle', horizontal: 'center' };

    const titleHeader = worksheet.addRow( ['कैदीको चालचलन सम्बन्धि अभिलेख'] );
    worksheet.mergeCells( `A${ titleHeader.number }:J${ titleHeader.number }` );
    titleHeader.getCell( 1 ).alignment = { vertical: 'middle', horizontal: 'center' };

    const officeHeader = worksheet.addRow( ['कारागार कार्यालय _____________'] );
    worksheet.mergeCells( `A${ officeHeader.number }:J${ officeHeader.number }` );
    officeHeader.getCell( 1 ).alignment = { vertical: 'middle', horizontal: 'center' };


    const tableHeader = worksheet.addRow( [
        'सि.नं.', 'बन्दी आई.डि.', 'कैदीको नाम थर', 'कैदीको उमेर (वर्ष)', 'गरेको कसूर', 'भएको सजाय', 'कैद भुक्तान अवधि',
        'कैदमा कुनै किसिमको अनुचित काम गरे/नगरेको', 'अनुचित काम गरेको भए त्यसको विवरण', 'कारागार प्रमुखको राय'
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

    let currentRow = 20; // Start from row 2 (row 1 = header)

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
                // mIndex === 0 ? data.letter_address : '',
                mIndex === 0 ? data.office_bandi_id : '',
                mIndex === 0
                    ? `${ data.bandi_name }\n${ data.nationality === 'स्वदेशी'
                        ? `${ data.city_name_np }-${ data.wardno },\n ${ data.district_name_np }, ${ data.state_name_np }, ${ data.country_name_np }`
                        : `${ data.bidesh_nagarik_address_details }, ${ data.country_name_np }` }`
                    : '',
                mIndex === 0 ? data.current_age : '',

                `${ mudda.mudda_name }` || '',

                mIndex === 0
                    ? [
                        ( data.hirasat_days || data.hirasat_months || data.hirasat_years )
                            ? `जम्मा कैदः \n ${ totalKaidDuration.formattedDuration }\n` +
                            `हिरासत/थुना अवधीः \n ${ data?.hirasat_years || 0 } | ${ data?.hirasat_months || 0 } | ${ data?.hirasat_days || 0 }`
                            : '',
                        `बेरुजु कैदः \n ${ kaidDuration.formattedDuration }`
                    ].filter( Boolean ).join( '\n\n' )
                    : '',

                mIndex === 0 ?
                    ( data.hirasat_days || data.hirasat_months || data.hirasat_years ) ?
                        `${ totalBhuktanDuration?.formattedDuration } \n ${ totalBhuktanDuration.percentage }%` :
                        `${ bhuktanDuration?.formattedDuration } \n ${ bhuktanDuration.percentage }%`
                    : '',
                // mIndex === 0 ? `${ bakiDuration.formattedDuration }\n${ bakiDuration.percentage }%` : '',               

                mIndex === 0 ? '' : '',
                mIndex === 0 ? '' : '',
                mIndex === 0 ? '' : '',
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
        const mergeCols = [1, 2, 3, 5, 6, 7, 8, 9, 10];
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
    saveAs( blob, 'payrole_character_export.xlsx' );
};
export default exportCharacterToExcel;