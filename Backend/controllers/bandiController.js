// controllers/bandiExportController.js
import ExcelJS from "exceljs";
import path from "path";
import fs from "fs";
import { getBandiForExport } from "../services/bandiExportService.js";
import { finalReleaseDateWithFine } from "../utils/dateCalculator.js";

export const exportBandiExcel = async (req, res) => {
  const {
    includePhoto = "false",
    language = "np",
    ...filters
  } = req.query;

  const addPhotos = includePhoto === "true";

  res.setHeader(
    "Content-Disposition",
    `attachment; filename=${language === "en" ? "Bandi_Records.xlsx" : "बन्दी_विवरण.xlsx"}`
  );
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );

  const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
    stream: res,
    useStyles: true,
    useSharedStrings: true,
  });

  const worksheet = workbook.addWorksheet(
    language === "en" ? "Bandi Details" : "बन्दी विवरण"
  );

  /* ---------------- HEADER (100% same columns) ---------------- */

  const bandiColumns = language === "en"
    ? [
        "Prison Office", "Bandi Id", "Log No.", "Prisoner Type",
        "Prisoner's Name", "Address",
        "Identity Card Type", "Identity Card No.",
        "Age", "Gender", "Fine (if due)",
        "Date of arrest", "Release date",
        "Remaining Days to Release (Including Fine)"
      ]
    : [
        "कारागार कार्यालय", "बन्दी आईडी", "लगत नं.", "बन्दी प्रकार",
        "बन्दीको नामथर", "ठेगाना",
        "परिचयपत्र प्रकार", "परिचयपत्र नं.",
        "उमेर", "लिङ्ग", "जरिवाना (तिर्न बाँकी)",
        "थुना परेको मिति", "कैदमुक्त मिति",
        "कैदमुक्त हुन बाँकी दिन (जरिवाना समेत)"
      ];

  const muddaColumns = language === "en"
    ? ["Mudda Group", "Case", "Case No.", "Complainant", "Decision Office", "Decision Date"]
    : ["मुद्दा समूह", "मुद्दा", "मुद्दा नं.", "जाहेरवाला", "फैसला गर्ने कार्यालय", "फैसला मिति"];

  const header = ["S.N.", ...bandiColumns, ...muddaColumns];
  if (addPhotos) header.push(language === "en" ? "Photo" : "फोटो");

  worksheet.addRow(header).commit();

  worksheet.columns.forEach(col => col.width = 20);

  /* ---------------- DATA STREAM ---------------- */

  let sn = 1;

  for await (const bandi of getBandiForExport(filters)) {
    const muddas = bandi.muddas?.length ? bandi.muddas : [{}];
    const startRow = worksheet.lastRow.number + 1;

    muddas.forEach((mudda, idx) => {
      const row = [
        idx === 0 ? sn : "",
        language === "en" ? bandi.bandi_office_en : bandi.bandi_office,
        bandi.office_bandi_id,
        bandi.lagat_no,
        bandi.bandi_type,
        language === "en" ? bandi.bandi_name_en : bandi.bandi_name,
        buildAddress(bandi, language),
        language === "en" ? bandi.govt_id_name_en : bandi.govt_id_name_np,
        bandi.card_no,
        bandi.current_age,
        bandi.gender,
        bandi.total_jariwana_amount,
        bandi.thuna_date_bs,
        bandi.release_date_bs,
        finalReleaseDateWithFine(
          bandi.thuna_date_bs,
          bandi.release_date_bs,
          bandi.total_jariwana_amount
        ),
        language === "en" ? mudda.mudda_group_name_en : mudda.mudda_group_name,
        language === "en" ? mudda.mudda_name_en : mudda.mudda_name,
        mudda.mudda_no,
        language === "en" ? mudda.vadi_en : mudda.vadi,
        language === "en"
          ? mudda.mudda_phesala_antim_office_en
          : mudda.mudda_phesala_antim_office,
        mudda.mudda_phesala_antim_office_date,
      ];

      if (addPhotos) row.push("");

      worksheet.addRow(row).commit();
    });

    const endRow = worksheet.lastRow.number;

    /* -------- MERGES -------- */
    if (muddas.length > 1) {
      for (let c = 1; c <= bandiColumns.length + 1; c++) {
        worksheet.mergeCells(startRow, c, endRow, c);
      }
    }

    /* -------- IMAGE -------- */
    if (addPhotos && bandi.photo_path) {
      const imgPath = path.join(process.env.UPLOAD_DIR, bandi.photo_path);
      if (fs.existsSync(imgPath)) {
        const imageId = workbook.addImage({
          filename: imgPath,
          extension: "jpeg",
        });
        worksheet.addImage(imageId, {
          tl: { col: header.length - 1, row: startRow - 1 },
          ext: { width: 120, height: 150 },
        });
      }
    }

    sn++;
  }

  await workbook.commit();
};
