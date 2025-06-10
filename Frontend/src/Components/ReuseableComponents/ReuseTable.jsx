import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { Button, Paper } from "@mui/material";
import Swal from "sweetalert2";

const ReusableTable = ({ columns, rows, height, width, showEdit, showDelete, onEdit, onDelete, enableExport }) => {

  // 🔹 Export to Excel
  const handleExportExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Data");

    // Add headers
    worksheet.addRow(columns.map(col => col.headerName));

    // Add rows
    rows.forEach(row => {
      worksheet.addRow(columns.map(col => row[col.field]));
    });

    // Save file
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), "table_data.xlsx");
  };

  // 🔹 Export to PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();
    const tableHeaders = columns.map(col => col.headerName);
    const tableRows = rows.map(row => columns.map(col => row[col.field]));

    doc.autoTable({
      head: [tableHeaders],
      body: tableRows,
    });

    doc.save("table_data.pdf");
  };

  const previewImage = (url) => {
    Swal.fire({
      imageUrl: url || "https://placeholder.pics/svg/300x1500", // Use passed URL or fallback
      imageWidth: '100%',
      imageHeight: '100%', // Adjusted for better view
      imageAlt: "Preview Image",
      showConfirmButton: false, // Hides "OK" button for a cleaner preview
    });
  };

  // 🔹 Updated Columns with Sorting, Image Display, and Hidden Fields
  const updatedColumns = [
    // Add "sn" column only if it does not already exist
    ...(!columns.some(col => col.field === "sn")
      ? [{
        field: "id",
        headerName: "S.No",
        width: 70,
        renderCell: (params) => params.rowIndex + 1, // Dynamic row number
      }]
      : []),

    ...columns.map(col => ({
      ...col,
      flex: 1,
      sortable: true,
      hideable: true,
      hide: col.hide || false,
      renderCell: col.field === "driverphoto" ? (params) => (
        params.value ? (
          <img
            src={params.value}
            alt="Driver"
            style={{ width: 50, height: 50, borderRadius: "5px", objectFit: "cover" }}
            onClick={() => previewImage(params.value)}
          />
        ) : (
          "No Image"
        )
      ) : undefined,
    })),
  ];

  return (
    <div style={{ height, width }}>
      {enableExport && (
        <div style={{ marginBottom: 10 }}>
          <Button variant="contained" color="primary" onClick={handleExportExcel} style={{ marginRight: 10 }}>
            Export to Excel
          </Button>
          {/* <Button variant="contained" color="secondary" onClick={handleExportPDF}>
            Export to PDF
          </Button> */}
        </div>
      )}

      {/* Data Table */}
      <Paper sx={{ height: 400, width: '100%' }} style={{ overflowX: 'auto' }}>
        <DataGrid
          sx={{ border: 0 }}
          columns={[
            ...updatedColumns,
            {
              field: "actions",
              headerName: "Actions",
              renderCell: (params) => (
                <div>
                  {showEdit && (
                    <Button variant="contained" color="primary" size="small" onClick={() => onEdit(params.row)}>
                      Edit
                    </Button>
                  )}
                  {showDelete && (
                    <Button variant="contained" color="secondary" size="small" onClick={() => onDelete(params.row.id)}>
                      Delete
                    </Button>
                  )}
                </div>
              ),
              width: 150,
            },
          ]}
          rows={rows}
          pageSize={10}
          initialState={{
            columns: {
              columnVisibilityModel: Object.fromEntries(
                columns.map((column) => [
                  column.field,
                  !column.hide // Ensure columns with `hide` false are visible
                ])
              ),
            },
          }}
        />
      </Paper>
    </div>
  );
};

export default ReusableTable;
