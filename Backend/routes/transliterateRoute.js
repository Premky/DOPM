import express from "express";
import pkg from "python-shell";
const { PythonShell } = pkg;
import multer from "multer";
import path from "path";
import fs from "fs";
import XLSX from "xlsx";
import { fileURLToPath } from "url";
import { spawn } from "child_process";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure folders exist
if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");
if (!fs.existsSync("outputs")) fs.mkdirSync("outputs");

// 1️⃣ Get sheet names
router.post("/get_sheets", upload.single("file"), (req, res) => {
  const filePath = path.resolve(req.file.path);
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetNames = workbook.SheetNames;
    res.json({ sheetNames, filePath });
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to read Excel file");
  }
});

// 2️⃣ Get columns
router.post("/get_columns", (req, res) => {
  const { filePath, sheetName } = req.body;
  const absPath = path.resolve(filePath);
  try {
    const workbook = XLSX.readFile(absPath);
    const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
    const columns = sheet[0];
    res.json({ columns });
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to read columns");
  }
});

// 3️⃣ Transliterate
router.post("/transliterate_excel", async (req, res) => {
  const timestamp = Date.now();
  const { filePath, sheetName, selectedColumns } = req.body;
  const absFilePath = path.resolve(filePath);
  const outputFile = path.join(__dirname, "../outputs", `${timestamp}_transliterated.xlsx`);
  const scriptPath = path.join(__dirname, "../scripts/transliterate_excel.py");

  // Spawn Python process
  const pyProcess = spawn("python", [scriptPath, absFilePath, sheetName, JSON.stringify(selectedColumns), outputFile]);

  pyProcess.stdout.on("data", (data) => {
    console.log("Python stdout:", data.toString());
  });

  pyProcess.stderr.on("data", (data) => {
    console.error("Python stderr:", data.toString());
  });

  pyProcess.on("close", (code) => {
    console.log(`Python process exited with code ${code}`);

    if (!fs.existsSync(outputFile)) {
      console.error("Output file not found:", outputFile);
      return res.status(500).send("Transliterated file not found");
    }

    // Send the file
    res.download(outputFile, `Transliterated.xlsx`, (err) => {
      if (err) console.error("Download error:", err);

      // Clean up
      try {
        if (fs.existsSync(absFilePath)) fs.unlinkSync(absFilePath);
        if (fs.existsSync(outputFile)) fs.unlinkSync(outputFile);
      } catch (delErr) {
        console.error("Error deleting files:", delErr);
      }
    });
  });
});



export { router as transliterateRouter };
