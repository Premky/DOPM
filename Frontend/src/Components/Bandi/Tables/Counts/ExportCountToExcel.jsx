import { FmdBad } from "@mui/icons-material";
import { tooltipClasses } from "@mui/material";
import * as ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const exportToExcel = async (start_Date, end_Date, records, totals, fy, fm, current_date) => {
    //Create a new workbook and worksheet

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Counts');

    //set Page layout
    worksheet.pageSetup = {
        paperSize: 9, //A4 Size (9), Letter (1)
        orientation: "landscape",
        margins: {
            left: 0.5, right: 0.5, top: 0.75, bottom: 0.75,
            header: 0.3, footer: 0.3
        },
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 1,
        horizontalCentered: true,
        verticalCentered: false,
    };

    //Headers for the Excel Sheet
    const headers = [
        [`संख्या`],
        ['सि.नं.', 'मुद्दा',
            'जम्मा', '', '', '',
            'कैदी', '', '', '',
            'थुनुवा', '', '', '',
            'आएको संख्या', 'छुटेको संख्या', 'कैफियत'],
        [
            '', '',
            'कैदी', 'थुनुवा', 'आश्रीत', 'जम्मा',
            'पुरुष', 'महिला', 'जम्मा',
            'पुरुष', 'महिला', 'जम्मा',
            '', '', '']
    ];

    //Add headers to the worksheet
    headers.forEach((headerRow, index) => {
        const row = worksheet.addRow(headerRow);
        if (index === 0) {
            row.font = { bold: true, size: 12 };
            row.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        }
        row.font = { name: 'Kalimati', bold: true, size: 11 };
        row.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    })

    //Add data rows
    records.forEach((record, index) => {
        worksheet.addRow([
            index + 1,
            record.mudda_name,
            record.KaidiTotal,
            record.ThunuwaTota,
            parseInt(record.Nabalak) + parseInt(record.Nabalika),
            parseInt(record.KaidiTotal) + parseInt(record.ThunuwaTotal),
            record.KaidiMale,
            record.KaidiFemale,
            parseInt(record.KaidiMale) + parseInt(record.KaidiFemale),
            record.ThunuwaMale,
            record.ThunuwaFemale,
            parseInt(record.ThunuwaMale) + parseInt(record.ThunuwaFemale),
            record.TotalArrestedInDateRange,
            record.TotalReleasedInDateRange,
            record.Remarks || ''
        ]);
    });
    //Add totals row
    const totalRow = worksheet.addRow([
        '',
        'जम्मा',
        totals.KaidiTotal,
        totals.ThunuwaTotal,
        totals.Nabalak + totals.Nabalika,
        totals.KaidiTotal + totals.ThunuwaTotal + totals.Nabalak + totals.Nabalika,
        totals.KaidiMale,
        totals.KaidiFemale,
        totals.KaidiMale + totals.KaidiFemale,
        totals.ThunuwaMale,
        totals.ThunuwaFemale,
        totals.ThunuwaMale + totals.ThunuwaFemale,
        totals.SumOfArrestedInDateRange,
        totals.SumOfReleasedInDateRange,
        ''
    ]);

    //Add border to all cells
    worksheet.eachRow((row, rowNumber) => {
        row.eachCell((cell) => {
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });
        // skip the first three header rows to avoid overwriting theri font
        if (rowNumber > 3) {
            row.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
            row.font = { name: 'Kalimati' };
        }
    });

    totalRow.font = { bold: true, name: 'Kalimati' };

    //Merge Cells
    worksheet.mergeCells('A1:01');  //Title
    worksheet.mergeCells('A2:A3');  //सि.नं.
    worksheet.mergeCells('B2:B3');  //मुद्दा
    worksheet.mergeCells('C2:F2');  //जम्मा
    worksheet.mergeCells('G2:I2');  //कैदी
    worksheet.mergeCells('J2:L2');  //थुनुवा
    worksheet.mergeCells('M2:M3');  //आएको संख्या
    worksheet.mergeCells('N2:N3');  //छुटेको संख्या
    worksheet.mergeCells('O2:O3');  //कैफियत

    //Adjust column widths
    worksheet.columns.forEach((column, index) => {
        column.width = 10; //For all column width
        //column.width = index === 1 ? 30:10; For specific columns width
    });
    worksheet.getColumn(2).width = 30; //For specific width
    worksheet.getColumn(2).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `Count Report.xlsx`);
}

const ExportCountReport = ({ start_date, end_date, records, totals, fy, fm, current_date }) => {
    return (
        <button onClick={() => exportToExcel(start_date, end_date, records, totals, fy, fm, current_date)}>
            Export to Excel
        </button>
    );
}


export { ExportCountReport, exportToExcel };