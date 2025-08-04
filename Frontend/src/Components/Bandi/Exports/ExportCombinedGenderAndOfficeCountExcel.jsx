import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const exportCombinedGenderAndOfficeCountExcel = async (totals, count, onlineOfficeIds) => {
  const workbook = new ExcelJS.Workbook();

  // =========== Sheet 1: Total Gender Wise Count ===========
  const worksheetGender = workbook.addWorksheet('Gender Wise Count');

  // Headers and data rows based on your TotalGenderWiseCount structure

  // Header rows (with bold)
  worksheetGender.addRow([
    '', 'कैदी पुरुष', 'थुनुवा पुरुष', 'पुरुष संख्या', '६५ वर्ष माथिको संख्या', 'कैदी बालक'
  ]);
  worksheetGender.addRow([
    'पुरुष',
    totals.kaidi_male ?? 0,
    totals.thunuwa_male ?? 0,
    totals.total_male ?? 0,
    (totals.kaidi_male_65plus + totals.kaidi_female_65plus + totals.thunuwa_male_65plus + totals.thunuwa_female_65plus) ?? 0,
    totals.aashrit ?? 0,
  ]);

  worksheetGender.addRow(['']); // empty row

  worksheetGender.addRow([
    '', 'कैदी महिला', 'थुनुवा महिला', 'महिला संख्या', 'आश्रित बालबालिका', 'कैदी बालिका'
  ]);
  worksheetGender.addRow([
    'महिला',
    totals.kaidi_female ?? 0,
    totals.thunuwa_female ?? 0,
    totals.total_female ?? 0,
    totals.total_aashrit ?? 0,
    totals.aashrit ?? 0,
  ]);

  worksheetGender.addRow(['']);

  worksheetGender.addRow(['', 'कैदी अन्य', 'थुनुवा अन्य', 'अन्य संख्या']);
  worksheetGender.addRow([
    'अन्य',
    totals.kaidi_other ?? 0,
    totals.thunuwa_other ?? 0,
    totals.total_other ?? 0,
  ]);

  worksheetGender.addRow(['']);

  worksheetGender.addRow(['', 'कुल कैदी', 'कुल थुनुवा', 'कुल संख्या', 'विदेशी संख्या', 'थुनुवा बालक']);
  worksheetGender.addRow([
    'कुल',
    totals.total_kaidi ?? 0,
    totals.total_thunuwa ?? 0,
    ((totals.total_kaidi ?? 0) + (totals.total_thunuwa ?? 0)),
    totals.foreign_count ?? 0,
    totals.aashrit ?? 0,
  ]);

  worksheetGender.addRow(['']);

  // Footer notes (merged cells)
  worksheetGender.mergeCells(`A${worksheetGender.lastRow.number + 1}:E${worksheetGender.lastRow.number + 1}`);
  worksheetGender.getCell(`A${worksheetGender.lastRow.number}`).value = 'कुल कैदीबन्दीमा बालसुधार गृहका बालबालिकाहरु समावेश छैन ।';
  worksheetGender.getCell(`A${worksheetGender.lastRow.number}`).alignment = { horizontal: 'center' };
  worksheetGender.getCell(`A${worksheetGender.lastRow.number}`).font = { italic: true };

  worksheetGender.addRow(['']);

  worksheetGender.mergeCells(`A${worksheetGender.lastRow.number + 1}:E${worksheetGender.lastRow.number + 1}`);
  worksheetGender.getCell(`A${worksheetGender.lastRow.number}`).value = 'कैदी र बन्दीको संख्यामा बृद्ध र विदेशी समेत समावेश गरिएको छ ।';
  worksheetGender.getCell(`A${worksheetGender.lastRow.number}`).alignment = { horizontal: 'center' };
  worksheetGender.getCell(`A${worksheetGender.lastRow.number}`).font = { italic: true };

  // Style headers bold and center aligned (rows 1,4,7,10)
  [1, 4, 7, 10].forEach(rowNum => {
    const row = worksheetGender.getRow(rowNum);
    row.font = { bold: true };
    row.alignment = { horizontal: 'center' };
  });

  // Auto width for columns in gender sheet
  worksheetGender.columns.forEach(column => {
    let maxLength = 10;
    column.eachCell({ includeEmpty: true }, cell => {
      const cellValue = cell.value ? cell.value.toString() : '';
      maxLength = Math.max(maxLength, cellValue.length);
    });
    column.width = maxLength + 2;
  });

  // =========== Sheet 2: Total Count Office Wise ===========
  const worksheetOffice = workbook.addWorksheet('Total Count Office Wise');

  // Header row
  worksheetOffice.addRow([
    'प्रदेश',
    'क्र.सं.',
    'कारागार',
    'कुल कैदीबन्दी',
    'कैदी पुरुष',
    'कैदी महिला',
    'कुल कैदी',
    'थुनुवा पुरुष',
    'थुनुवा महिला',
    'कुल थुनुवा',
    'लिङ्ग अनुसार पुरुष',
    'लिङ्ग अनुसार महिला',
    '६५ वर्ष माथिका कैदी',
    '६५ वर्ष माथिका थुनुवा',
    'आश्रित',
    'विदेशी देशहरू',
    'विदेशी संख्या',
  ]);

  // Data rows
  count.forEach((data, index) => {
    worksheetOffice.addRow([
      data.state_name_np,
      index + 1,
      data.office_short_name,
      (data.total_male + data.total_female) || 0,
      data.kaidi_male,
      data.kaidi_female,
      data.total_kaidi,
      data.thunuwa_male,
      data.thunuwa_female,
      data.total_thunuwa,
      data.total_male,
      data.total_female,
      data.kaidi_male_65plus + data.kaidi_female_65plus,
      data.thunuwa_male_65plus + data.thunuwa_female_65plus,
      data.total_aashrit,
      data.foreign_countries,
      data.foreign_count,
    ]);
  });

  // Style header row for office sheet
  worksheetOffice.getRow(1).eachCell((cell) => {
    cell.font = { bold: true };
    cell.alignment = { horizontal: 'center' };
  });

  // Auto width for columns in office sheet
  worksheetOffice.columns.forEach(column => {
    let maxLength = 10;
    column.eachCell({ includeEmpty: true }, cell => {
      const cellValue = cell.value ? cell.value.toString() : '';
      maxLength = Math.max(maxLength, cellValue.length);
    });
    column.width = maxLength + 2;
  });

  // Generate buffer and save file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, 'CombinedGenderAndOfficeCount.xlsx');
};

export default exportCombinedGenderAndOfficeCountExcel;
