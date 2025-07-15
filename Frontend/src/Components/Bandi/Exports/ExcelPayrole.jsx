import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { calculateBSDate } from '../../../../Utils/dateCalculator';
import NepaliDate from 'nepali-datetime';
import { width } from '@mui/system';

const exportToExcel = async (filteredKaidi, fetchedMuddas) => {
    const npToday = new NepaliDate();
    const formattedDateNp = npToday.format('YYYY-MM-DD');
    const workbook = new ExcelJS.Workbook();

    const worksheet = workbook.addWorksheet('Payrole Export')
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
    const row = worksheet.addRow([
        'सि.नं.', 'कारागार कार्यालय', 'कैदीको नामथर स्थायी ठेगाना', 'उमेर', 'लिङ्ग', 'राष्ट्रियता',
        'मुद्दा', 'जाहेरवाला', 'अन्तिम निकाय/मिति', 'पुनरावेदन प्रमाण', 'कैद परेको मिति',
        'तोकिएको कैद', 'छुट मिति', 'भुक्तान कैद', 'बाकी कैद',
        'जरिवाना प्रमाण',  'कैफियत'
    ]);
    row.eachCell((cell) => {
        cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };
        cell.font = { bold: true }; // Optional: bold for header
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    });

    let currentRow = 2; // Start from row 2 (row 1 = header)

    filteredKaidi.forEach((data, index) => {
        const kaidiMuddas = fetchedMuddas[data.bandi_id] || [{}];
        const muddaCount = kaidiMuddas.length;
        kaidiMuddas.forEach((mudda, mIndex) => {
            const kaidDuration = calculateBSDate(data.thuna_date_bs, data.release_date_bs);
            const bhuktanDuration = calculateBSDate(data.thuna_date_bs, formattedDateNp, kaidDuration);
            const bakiDuration = calculateBSDate(formattedDateNp, data.release_date_bs, kaidDuration);

            const row = worksheet.addRow([
                mIndex === 0 ? index + 1 : '',
                mIndex === 0 ? data.current_payrole_office : '',
                mIndex === 0
                    ? `${data.bandi_name}\n${data.nationality === 'स्वदेशी'
                        ? `${data.city_name_np}-${data.wardno},\n ${data.district_name_np}, ${data.state_name_np}, ${data.country_name_np}`
                        : `${data.bidesh_nagarik_address_details}, ${data.country_name_np}`}`
                    : '',
                mIndex === 0 ? data.current_age : '',
                mIndex === 0 ? (data.gender === 'Male' ? 'पुरुष' : data.gender === 'Female' ? 'महिला' : 'अन्य') : '',

                mIndex === 0 ? data.country_name_np : '',

                `${mudda.mudda_name}\n${mudda.mudda_no}` || '',
                mudda.vadi || '',
                `${mudda.office_name_with_letter_address || ''} \n ${mudda.mudda_phesala_antim_office_date || ''}`,
                mIndex === 0
                    ? `${data.office_name_with_letter_address || ''}को च.नं. ${data.punarabedan_office_ch_no || ''} मिति ${data.punarabedan_office_date || ''}`
                    : '',
                mIndex === 0 ? data.thuna_date_bs : '',
                mIndex === 0 ? `${kaidDuration.formattedDuration}` : '',
                mIndex === 0 ? data.release_date_bs : '',
                mIndex === 0 ? `${bhuktanDuration.formattedDuration}\n${bhuktanDuration.percentage}%` : '',
                mIndex === 0 ? `${bakiDuration.formattedDuration}\n${bakiDuration.percentage}%` : '',
                mIndex === 0
                    ? data.fine_summary : '',
                // mIndex === 0 ? data.other_details || '' : '',
                // mIndex === 0 ? data.payrole_reason || '' : '',
                mIndex === 0 ? data.remark || '' : '',

            ]);
            row.eachCell((cell) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            });
        });

        // 🔄 Merge cells for कैदी info
        const mergeCols = [1, 2, 3, 4, 5, 6, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];

        mergeCols.forEach((colIndex) => {
            worksheet.mergeCells(currentRow, colIndex, currentRow + muddaCount - 1, colIndex);
            // Apply wrapText to merged cell
            const cell = worksheet.getCell(currentRow, colIndex);
            cell.alignment = { wrapText: true, vertical: 'top' };
        });

        currentRow += muddaCount;
    });

    // Set column width
    worksheet.columns.forEach(column => {
        // column.width = 20;

    });




    // Save file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, 'payrole_export.xlsx');
};
export default exportToExcel;