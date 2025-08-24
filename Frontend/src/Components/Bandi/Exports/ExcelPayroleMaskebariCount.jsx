// import ExcelJS from 'exceljs';
// import { saveAs } from 'file-saver';
import NepaliDate from 'nepali-datetime';

const exportMaskebariCountToExcel = async (filteredRecords, totals) => {
    const ExcelJS = await import('exceljs')
    const saveAs = await import('file-saver')
    const npToday = new NepaliDate();
    const formattedDateNp = npToday.format('YYYY-MM-DD');
    const workbook = new ExcelJS.Workbook();

    const worksheet = workbook.addWorksheet('Payrole Export');

    worksheet.pageSetup = {
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 0,
        orientation: 'landscape',
        paperSize: 9
    };

    worksheet.pageSetup.margins = {
        left: 0.5,
        right: 0.5,
        top: 0.75,
        bottom: 0.75,
        header: 0.3,
        footer: 0.3
    };

    // 🟨 Title Row
    const totalColumns = 3 + 9 * 4 + 1; // 3 fixed columns + 9 sections * 4 genders + 1 remarks
    worksheet.mergeCells(1, 1, 1, totalColumns);
    const titleCell = worksheet.getCell('A1');
    titleCell.value = `मिति ${formattedDateNp} सम्मको मासिक प्यारोल विवरण`;
    titleCell.font = { bold: true, size: 14 };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

    // 🟩 Main Headers (Row 2)
    const row2 = worksheet.getRow(2);
    row2.getCell(1).value = 'सि.नं.';
    row2.getCell(2).value = 'कारागार कार्यालय';
    row2.getCell(3).value = 'मिति';

    // Merge for first 3 fixed columns



    // Main section headers
    const sections = [
        'प्यारोल बोर्डबाट प्यारोलमा राख्न सिफारिस भएका कुल संख्या',
        'हाल सम्म प्यारोलमा रहेका कुल संख्या',
        'प्यारोल बोर्डबाट सिफारिस भएकाहरु मध्ये अदालतबाट प्यारोलमा राख्ने नमिल्ने भनि आदेश भएका संख्या',
        'प्यारोलमा रहेका मध्ये कैद भुक्तान भएका संख्या',
        'हाल प्यारोलमा रहेका जम्मा संख्या',
        'अन्य जिल्लाबाट आएकाहरुको जिल्लागत कैदी संख्या',
        'अन्य जिल्लामा गएकाहरुको जिल्लागत कैदी संख्या',
        'शर्त पालना नगर्नेको संख्या',
        'शर्त पालना गर्नेको संख्या'
    ];

    let colIndex = 4;
    sections.forEach((label) => {
        worksheet.mergeCells(2, colIndex, 2, colIndex + 3); // Merge 4 columns (महिला, पुरुष, अन्य, जम्मा)
        row2.getCell(colIndex).value = label;
        row2.getCell(colIndex).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        row2.getCell(colIndex).font = { bold: true };
        colIndex += 4;
    });

    // Remarks column
    worksheet.mergeCells(2, colIndex, 4, colIndex);
    worksheet.getCell(2, colIndex).value = 'कैफियत';
    worksheet.getCell(2, colIndex).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    worksheet.getCell(2, colIndex).font = { bold: true };

    // 🟦 Subheaders (Row 3)
    const row3 = worksheet.getRow(3);
    row3.values = [
        '', '', '',
        ...Array(sections.length).fill(['महिला', 'पुरुष', 'अन्य', 'जम्मा']).flat(),
        ''
    ];

    [row2, row3].forEach(row => {
        row.eachCell((cell) => {
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
            cell.font = { bold: true };
            cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        });
    });

    const totalData = worksheet.getRow(4);
    totalData.values = [
        "कुल जम्मा(हाल सम्मको)", "", "",
        totals.total_decision_count_female,
        totals.total_decision_count_male,
        totals.total_decision_count_other,
        totals.total_decision_count,

        totals.total_payrole_count_female,
        totals.total_payrole_count_male,
        totals.total_payrole_count_other,
        totals.total_payrole_count,

        totals.total_no_from_court_count_female,
        totals.total_no_from_court_count_male,
        totals.total_no_from_court_count_other,
        totals.total_no_from_court_count,

        totals.total_bhuktan_count_female,
        totals.total_bhuktan_count_male,
        totals.total_bhuktan_count_other,
        totals.total_bhuktan_count,

        totals.total_current_payrole_count_female,
        totals.total_current_payrole_count_male,
        totals.total_current_payrole_count_other,
        totals.total_current_payrole_count,

        totals.total_in_district_wise_count_female,
        totals.total_in_district_wise_count_male,
        totals.total_in_district_wise_count_other,
        totals.total_in_district_wise_count,

        totals.total_out_district_wise_count_female,
        totals.total_out_district_wise_count_male,
        totals.total_out_district_wise_count_other,
        totals.total_out_district_wise_count,

        totals.total_no_payrole_count_female,
        totals.total_no_payrole_count_male,
        totals.total_no_payrole_count_other,
        totals.total_no_payrole_count,

        totals.total_payrole_regulation_female,
        totals.total_payrole_regulation_male,
        totals.total_payrole_regulation_other,
        totals.total_payrole_regulation
    ]
    // worksheet.mergeCells(4, 1, 4, 3);
    worksheet.mergeCells('A2:A3');
    worksheet.mergeCells('B2:B3');
    worksheet.mergeCells('C2:C3');
    worksheet.mergeCells('A4:C4')

    totalData.eachCell((cell) => {
        cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };
        cell.alignment = { vertical: 'top', horizontal: 'center', wrapText: true };
    });

    // 🟨 Fill Data (Row 5+)
    let currentRow = 5;
    filteredRecords.forEach((record, index) => {
        const row = worksheet.addRow([
            index + 1,
            record.office_name || '',
            `${record.year_bs}-${record.month_bs}`,

            record.total_decision_count_female,
            record.total_decision_count_male,
            record.total_decision_count_other,
            record.total_decision_count,

            record.total_payrole_count_female,
            record.total_payrole_count_male,
            record.total_payrole_count_other,
            record.total_payrole_count,

            record.total_no_from_court_count_female,
            record.total_no_from_court_count_male,
            record.total_no_from_court_count_other,
            record.total_no_from_court_count,

            record.total_bhuktan_count_female,
            record.total_bhuktan_count_male,
            record.total_bhuktan_count_other,
            record.total_bhuktan_count,

            record.total_current_payrole_count_female,
            record.total_current_payrole_count_male,
            record.total_current_payrole_count_other,
            record.total_current_payrole_count,

            record.total_in_district_wise_count_female,
            record.total_in_district_wise_count_male,
            record.total_in_district_wise_count_other,
            record.total_in_district_wise_count,

            record.total_out_district_wise_count_female,
            record.total_out_district_wise_count_male,
            record.total_out_district_wise_count_other,
            record.total_out_district_wise_count,

            record.total_no_payrole_count_female,
            record.total_no_payrole_count_male,
            record.total_no_payrole_count_other,
            record.total_no_payrole_count,

            record.total_payrole_regulation_female,
            record.total_payrole_regulation_male,
            record.total_payrole_regulation_other,
            record.total_payrole_regulation,

            record.remarks || ''
        ]);

        row.eachCell((cell) => {
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
            cell.alignment = { vertical: 'top', horizontal: 'center', wrapText: true };
        });
    });

    // Save file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, 'payrole_maskebari_export.xlsx');
};

export default exportMaskebariCountToExcel;
