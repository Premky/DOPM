import ExcelJS from "exceljs";
import fs from "fs";
import path from "path";
import pool from "../utils/db3.js";

// temp folder for exported files
const TEMP_DIR = path.join(process.cwd(), "temp_exports");
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR);

export const generateBandiExcel = async (job, filters) => {
  const PAGE_SIZE = 1000;
  let offset = 0;
  let sn = 1;

  const fileName = `Bandi_Records_${Date.now()}.xlsx`;
  const filePath = path.join(TEMP_DIR, fileName);

  const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
    filename: filePath,
    useStyles: true,
    useSharedStrings: true,
  });

  const sheet = workbook.addWorksheet("बन्दी विवरण");

  // All headers (keep all columns you need)
  const headers = [
    "S.N.", "Prison Office", "Office Bandi ID", "Lagat No.", "Block",
    "Bandi Type", "Bandi Name", "Country", "Address", "ID Type & Number",
    "DOB (B.S.)", "DOB (A.D.)", "Age", "Gender", "Spouse Name",
    "Spouse Contact No.", "Father Name", "Father Contact No.", "Mother Name",
    "Mother Contact No.", "Date of imprisonment (B.S.)", "Release Date (B.S.)",
    "Mudda Group", "Mudda", "Mudda No.", "Vadi", "Decision Office",
    "Decision Date", "Contact Person",
  ];
  sheet.addRow(headers).commit();

  let totalRows = 0;

  // Optional: estimate total rows for progress (rough)
  const [[{ total }]] = await pool.query(
    "SELECT COUNT(*) as total FROM view_bandi_full"
  );

  while (true) {
    const [rows] = await pool.query(
      `SELECT * FROM view_bandi_full ORDER BY bandi_id DESC LIMIT ? OFFSET ?`,
      [PAGE_SIZE, offset]
    );

    if (!rows.length) break;

    for (const b of rows) {
      // For simplicity, only basic row (add muddas if you want)
      sheet.addRow([
        sn++,
        b.bandi_office,
        b.office_bandi_id,
        b.lagat_no,
        b.block_name,
        b.bandi_type,
        b.bandi_name,
        b.country_name,
        `${b.city_name}-${b.wardno}, ${b.district_name}, ${b.state_name}`,
        `${b.govt_id_name}, ${b.card_no}`,
        b.dob,
        b.dob_ad,
        b.current_age,
        b.gender,
        b.spouse_name,
        b.spouse_contact_no,
        b.father_name,
        b.father_contact_no,
        b.mother_name,
        b.mother_contact_no,
        b.thuna_date_bs,
        b.release_date_bs,
        b.mudda_group_name,
        b.mudda_name,
        b.mudda_no,
        b.vadi,
        b.mudda_phesala_antim_office,
        b.mudda_phesala_antim_office_date,
        b.other_relatives,
      ]).commit();
      totalRows++;
    }

    offset += PAGE_SIZE;

    // Update job progress
    const progress = Math.min(100, Math.floor((totalRows / total) * 100));
    await job.updateProgress(progress);
  }

  await workbook.commit();

  return filePath; // return path for download
};
