import ExcelJS from 'exceljs';
// import { saveAs } from 'file-saver';


// Inside your component file, e.g. TotalCountOfficeWise.jsx

const exportOfficeWiseMaskebariExcel = async (count, onlineOfficeIds) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Total Count Office Wise');
  const { saveAs } = await import("file-saver");

  // Define header row (same as table headers)
  worksheet.addRow([
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

  // Add data rows
  count.forEach((data, index) => {
    worksheet.addRow([
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

  // Optional: Style header row
  worksheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true };
    cell.alignment = { horizontal: 'center' };
  });

  // Generate buffer and save as file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, 'TotalCountOfficeWise.xlsx');
};
export default exportOfficeWiseMaskebariExcel;