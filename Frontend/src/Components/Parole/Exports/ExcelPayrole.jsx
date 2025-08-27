import { calculateBSDate, calculateDateDetails } from '../../../../Utils/dateCalculator';
import NepaliDate from 'nepali-datetime';
import axios from 'axios';

const exportToExcel = async ( filteredKaidi, fetchedMuddas, fetchedFines, fetchedNoPunarabedan, filters, BASE_URL ) => {
    const ExcelJS = await import('exceljs');
    const npToday = new NepaliDate();
    const formattedDateNp = npToday.format( 'YYYY-MM-DD' );
    const workbook = new ExcelJS.Workbook();
    const { saveAs } = await import("file-saver");


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
        bottom: 0.5,
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
            // console.log( data);            
            office = data?.Result[0].letter_address || "अज्ञात कार्यालय";
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
            // console.log( data.Result[0] );
            mudda = data?.Result[0].mudda_group_name || "अज्ञात मुद्दा समूह";
        } catch ( err ) {
            console.error( "Mudda fetch failed:", err );
        }
    }

    worksheet.mergeCells( 'A1', 'I1' );
    worksheet.getCell( 'A1' ).value = `कार्यालय: ${ office }`;
    worksheet.mergeCells( 'J1', 'N1' );
    worksheet.getCell( 'J1' ).value = `मुद्दा: ${ mudda }`;
    worksheet.mergeCells( 'Q1', 'S1' );
    worksheet.getCell( 'Q1' ).value = `संख्या: ${ filteredKaidi.length }`;

    const colsToRotate = [1, 2, 3, 5, 6, 7];
    const tableHeader = worksheet.addRow( [
        'सि.नं.', 'कारागार कार्यालय', 'बन्दी आई.डी.', 'कैदीको नामथर स्थायी ठेगाना', 'उमेर (वर्ष)', 'लिङ्ग', 'राष्ट्रियता',
        'मुद्दा', 'जाहेरवाला', 'मुद्दाको अन्तिम कारवाही गर्ने निकाय र अन्तिम फैसला मिति', 'पुनरावेदन नपरेको प्रमाण', 'कैद परेको मिति',
        'तोकिएको कैद (वर्ष|महिना|दिन)', 'कैदी पुर्जीमा उल्लेखित छुटि जाने मिति', 'भुक्तान कैद (वर्ष|महिना|दिन) र प्रतिशत', 'प्यारोलमा राख्नुपर्ने कैद (वर्ष|महिना|दिन) र प्रतिशत',
        'तोकिएको जरिवाना/क्षतिपुर्ती/बिगो/पिडित राहत कोष तिरेको प्रमाण',
        'कैफियत (कारागार)',
        'कैफियत (विभाग)'
    ] );
    tableHeader.eachCell( ( cell ) => {
        cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };
        cell.font = { bold: true, size: 14 }; // Optional: bold for header
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    } );

    [tableHeader].forEach( row => {
        colsToRotate.forEach( col => {
            const cell = row.getCell( col );
            cell.alignment = {
                wrapText: true,
                textRotation: 90,
                vertical: 'middle',
                horizontal: 'center'
            };
        } );
    } );

    let currentRow = 3; // Start from row 2 (row 1 = header)

    filteredKaidi.forEach( ( data, index ) => {
        // console.log( data );
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
            // console.log(mudda.mudda_office)
            const row = worksheet.addRow( [
                mIndex === 0 ? index + 1 : '',
                mIndex === 0 ? data.letter_address : '',
                mIndex === 0 ? data.office_bandi_id : '',
                mIndex === 0
                    ? `${ data.bandi_name }\n\n${ data.nationality === 'स्वदेशी'
                        ? `${ data.city_name_np }-${ data.wardno },\n ${ data.district_name_np }, ${ data.state_name_np }, ${ data.country_name_np }`
                        : `${ data.bidesh_nagarik_address_details }, ${ data.country_name_np }` }`
                    : '',
                mIndex === 0 ? data.current_age : '',
                mIndex === 0 ? ( data.gender === 'Male' ? 'पुरुष' : data.gender === 'Female' ? 'महिला' : 'अन्य' ) : '',

                mIndex === 0 ? data.country_name_np === 'नेपाल' ? 'नेपाली' : data.country_name_np : '',

                `${ mudda.mudda_name }\n${ mudda.mudda_no }` || '',
                mudda.vadi || '',
                `${ mudda.mudda_office || '' } \n ${ mudda.mudda_phesala_antim_office_date || '' }`,
                mIndex === 0
                    ? bandiNoPunarabedan.map( ( noPunrabedan, i ) =>
                        `${ i + 1 }. ${ noPunrabedan.punarabedan_office || '' }को च.नं. ${ noPunrabedan.punarabedan_office_ch_no || '' }, मिति ${ noPunrabedan.punarabedan_office_date || '' } गतेको पत्र ।` )
                        .join( '\n' )
                    : '',
                mIndex === 0 ? data.thuna_date_bs : '',

                mIndex === 0
                    ? [
                        ( data.hirasat_days || data.hirasat_months || data.hirasat_years )
                            ? `जम्मा कैदः \n ${ totalKaidDuration.formattedDuration }\n` +
                            `हिरासत/थुना अवधीः \n ${ data?.hirasat_years || 0 } | ${ data?.hirasat_months || 0 } | ${ data?.hirasat_days || 0 } \n बेरुजु कैदः \n ${ kaidDuration.formattedDuration }` : `${ kaidDuration.formattedDuration }`
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
                            `${ i + 1 }. ${ fine.deposit_office }को च.नं. ${ fine.deposit_ch_no }, मिति ${ fine.deposit_date } गतेको पत्रबाट रु.${ fine.deposit_amount } ${ fine.fine_name_np } बुझाएको ।`
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
                cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }; // Center align and wrap text            
            } );
        } );

        // 🔄 Merge cells for कैदी info
        const mergeCols = [1, 2, 3, 4, 5, 6, 7, 11, 12, 13, 14, 15, 16, 17, 18];

        const manualWidth2Cols = [4, 9, 11, 17, 10, 18, 19];
        manualWidth2Cols.forEach( ( colIndex ) => {
            worksheet.getColumn( colIndex ).width = 21; // Set width for specific columns
        } );
        worksheet.getColumn(17).width=27;
        const manualWidth3Cols = [8, 12, 13, 14, 15, 16];
        manualWidth3Cols.forEach( ( colIndex ) => {
            worksheet.getColumn( colIndex ).width = 15; // Set width for specific columns
        } );

        mergeCols.forEach( ( colIndex ) => {
            worksheet.mergeCells( currentRow, colIndex, currentRow + muddaCount - 1, colIndex );
            // Apply wrapText to merged cell
            const cell = worksheet.getCell( currentRow, colIndex );
            cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }; // Center align and wrap text
        } );

        // After merging cells for this prisoner
        const cellsToRotate = [
            { col: 3, name: 'bandiCell' },
            { col: 5, name: 'ageCell' },
            { col: 6, name: 'ageGender' },
            { col: 7, name: 'ageNationality' }
        ];

        cellsToRotate.forEach( ( { col } ) => {
            const cell = worksheet.getCell( currentRow, col );
            cell.alignment = {
                wrapText: true,
                textRotation: 90,
                vertical: 'middle',
                horizontal: 'center'
            };
        } );

        currentRow += muddaCount;
    } );

    // Set column width
    worksheet.columns.forEach( column => {
        // column.width = 20;

    } );

    // Set default font for entire worksheet
    worksheet.eachRow( row => {
        row.eachCell( cell => {
            cell.font = { name: 'Kalimati', size: 14 }; // Set font for each cell            
        } );
    } );

    worksheet.getRow( 1 ).eachCell( cell => {
        cell.font = { name: 'Kalimati', size: 22, bold: true };
    } );
    worksheet.getRow( 2 ).eachCell( cell => {
        cell.font = { name: 'Kalimati', size: 14, bold: true };
    } );

    worksheet.views = [{ state: "frozen", ySplit: 2 }];

    // Save file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob( [buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' } );
    saveAs( blob, 'payrole_export.xlsx' );
};
export default exportToExcel;