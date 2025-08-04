import ExcelJS from 'exceljs';

export async function exportLongTable(data, vehicles, accidentReasonList) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Accident Report');

    const mergeSafe = (rowStart, colStart, rowEnd, colEnd, value) => {
        const cell = worksheet.getCell(rowStart, colStart);
        cell.value = value;
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        worksheet.mergeCells(rowStart, colStart, rowEnd, colEnd);
    };

    let col = 1;

    // Static fields
    const staticFields = ["सि.नं.","जिल्ला", "मिति", "समय", "स्थान", "सडक", "ठाउँको नाम"];
    staticFields.forEach(field => {
        mergeSafe(1, col, 2, col, field);
        col++;
    });

    // Vehicles
    mergeSafe(1, col, 1, col + vehicles.length - 1, "सवारी साधन");
    vehicles.forEach(vehicle => {
        worksheet.getCell(2, col).value = vehicle;
        col++;
    });

    // Total vehicles
    mergeSafe(1, col, 2, col, "जम्मा");
    col++;

    // Human casualties
    const groupFields = ["पुरुष", "महिला", "बालक", "बालिका", "जम्मा"];
    ["मानव मृत्यु", "मानव गम्भिर घाइते", "मानव साधारण घाइते"].forEach(label => {
        mergeSafe(1, col, 1, col + groupFields.length - 1, label);
        groupFields.forEach(f => {
            worksheet.getCell(2, col).value = f;
            col++;
        });
    });

    // Animal
    mergeSafe(1, col, 2, col, "चौपाया मृत्यु");
    col++;
    mergeSafe(1, col, 2, col, "चौपाया घाइते");
    col++;

    // Time ranges
    const timeRanges = ["00:06-12:00", "12:00-18:00", "18:00-00:00", "00:00-06:00", "समय नखुलेको", "जम्मा"];
    mergeSafe(1, col, 1, col + timeRanges.length - 1, "दुर्घटना भएको समय");
    timeRanges.forEach(time => {
        worksheet.getCell(2, col).value = time;
        col++;
    });

    // Group accident reasons
    const groupedReasons = {};
    for (const item of accidentReasonList) {
        const { accident_type, accident_reason } = item;
        if (!groupedReasons[accident_type]) {
            groupedReasons[accident_type] = [];
        }
        groupedReasons[accident_type].push(accident_reason);
    }

    // Add grouped accident reasons
    Object.entries(groupedReasons).forEach(([group, reasons]) => {
        if (reasons.length > 1) {
            mergeSafe(1, col, 1, col + reasons.length - 1, group);
            reasons.forEach(reason => {
                worksheet.getCell(2, col).value = reason;
                col++;
            });
        } else {
            mergeSafe(1, col, 2, col, group);
            col++;
        }
    });

    mergeSafe(1, col, 2, col, "जम्मा सवारी दुर्घटना संख्या");
    col++;
    mergeSafe(1, col, 2, col, "जम्मा सवारी साधन क्षेती");
    col++;
    mergeSafe(1, col, 2, col, "अनुमानित रकम");
    col++;
    mergeSafe(1, col, 2, col, "कसरी सवारी दुर्घटना भएको");
    col++;
    mergeSafe(1, col, 2, col, "कैफियत");
    col++;
    // Freeze top 2 header rows
    worksheet.views = [{ state: 'frozen', ySplit: 2 }];

    // Apply border and styling to first 2 rows
    for (let row = 1; row <= 2; row++) {
        for (let c = 1; c < col; c++) {
            const cell = worksheet.getCell(row, c);
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
            cell.font = { bold: true };
        }
    }

    // TODO: Add actual data rows here
    // data.forEach(d => worksheet.addRow([...]));
    data.forEach((row, index) => {
        const time = row.accident_time || "";
        const timeFlags = [
            time > "00:06" && time <= "12:00" ? 1 : 0,
            time > "12:00" && time <= "18:00" ? 1 : 0,
            time > "18:00" && time <= "23:59" ? 1 : 0,
            time > "00:00" && time <= "00:06" ? 1 : 0,
            !time ? 1 : 0,
        ];
        const timeTotal = timeFlags.reduce((a, b) => a + b, 0);
        const timeSlotsFinal = [...timeFlags, timeTotal];

        const rowData = [
            index + 1,
            row.district,
            row.date,
            row.accident_time,
            row.accident_location,
            row.road_name,
            row.location,
            ...vehicles.map(v => row.vehicles?.[v] || 0),
            Object.values(row.vehicles || {}).reduce((a, b) => a + b, 0),

            row.death_male,
            row.death_female,
            row.death_boy,
            row.death_girl,
            row.death_total,

            row.gambhir_male,
            row.gambhir_female,
            row.gambhir_boy,
            row.gambhir_girl,
            row.gambhir_total,

            row.general_male,
            row.general_female,
            row.general_boy,
            row.general_girl,
            row.general_total,

            row.animal_death,
            row.animal_injured,

            ...timeSlotsFinal,
            
            ...Object.values(groupedReasons).flat().map(reason => row.reasons?.[reason] || 0),
            1,
            row.damage_vehicle,
            row.est_amount, 
            row.txt_accident_reason,
            row.remarks,
        ];

        worksheet.addRow(rowData);
    });

    // Create and download file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'accident_report.xlsx';
    link.click();
}

export default exportLongTable;
