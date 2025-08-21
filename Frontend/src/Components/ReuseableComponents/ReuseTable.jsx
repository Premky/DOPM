import React, { useState } from "react";
import { DataGrid, GridToolbar, useGridApiRef } from "@mui/x-data-grid";
import ExcelJS from "exceljs";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { Button, Paper } from "@mui/material";
import Swal from "sweetalert2";

const ActionsCell = ({ params, showView, showEdit, showDelete, onView, onEdit, onDelete }) => (
  <div style={{ display: "flex", gap: 8 }}>
    {showView && (
      <Button
        variant="contained"
        color="success"
        size="small"
        onClick={() => onView?.(params.row)}
      >
        View
      </Button>
    )}
    {showEdit && (
      <Button
        variant="contained"
        color="primary"
        size="small"
        onClick={() => onEdit?.(params.row)}
      >
        Edit
      </Button>
    )}
    {showDelete && (
      <Button
        variant="contained"
        color="secondary"
        size="small"
        onClick={() => onDelete?.(params.row.id)}
      >
        Delete
      </Button>
    )}
  </div>
);

const ReusableTable = ({
  columns,
  rows,
  height = 700,
  width = "100%",
  showView = false,
  showEdit = false,
  showDelete = false,
  onView,
  onEdit,
  onDelete,
  enableExport = false,
  includeSerial = true,
  serialLabel = "S.No",
  pageSizeOptions,
}) => {
  const apiRef = useGridApiRef();
  const defaultPageSize = parseInt(localStorage.getItem("pageSize")) || 25;

  const [paginationModel, setPaginationModel] = useState({
    pageSize: defaultPageSize,
    page: 0,
  });

  const [filterModel, setFilterModel] = useState({ items: [] });

  const handlePaginationChange = (newModel) => {
    setPaginationModel(newModel);
    localStorage.setItem("pageSize", newModel.pageSize);
  };

  // Cleanup duplicate serial column
  const cleanedColumns = columns.filter(
    (col) => col.field !== "sn" && col.headerName !== "S.No" && col.headerName !== "सि.नं."
  );

  const updatedColumns = [
    ...(includeSerial
      ? [
          {
            field: "sn",
            headerName: serialLabel,
            width: 70,
            sortable: false,
            filterable: false,
            renderCell: (params) => {
              const index = rows.findIndex((row) => row.id === params.row.id);
              return index + 1;
            },
          },
        ]
      : []),
    ...cleanedColumns.map((col) => ({
      ...col,
      flex: 1,
      minWidth: col.minWidth || 150,
      sortable: true,
      hideable: true,
      hide: col.hide || false,
      renderCell:
        col.field === "photo_path"
          ? (params) =>
              params.value ? (
                <img
                  src={params.value}
                  alt="photo"
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 5,
                    objectFit: "cover",
                    cursor: "pointer",
                  }}
                  onClick={() => previewImage(params.value)}
                />
              ) : (
                "No Image"
              )
          : col.renderCell || ((params) => params.value ?? ""),
    })),
    (showView || showEdit || showDelete) && {
      field: "actions",
      headerName: "Actions",
      minWidth: 150,
      flex: 1,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <ActionsCell
          params={params}
          showView={showView}
          showEdit={showEdit}
          showDelete={showDelete}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ),
    },
  ].filter(Boolean);

  const previewImage = (url) => {
    Swal.fire({
      imageUrl: url || "https://placeholder.pics/svg/300x1500",
      imageWidth: "100%",
      imageHeight: "100%",
      imageAlt: "Preview Image",
      showConfirmButton: false,
    });
  };

  const handleExportExcel = async () => {
    const { saveAs } = await import("file-saver");
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Data");

    worksheet.addRow(updatedColumns.map((col) => col.headerName));

    let visibleRows = apiRef.current.getSortedRowIds().map((id) => apiRef.current.getRow(id));

    // Apply filters
    filterModel.items.forEach((filter) => {
      visibleRows = visibleRows.filter((row) =>
        String(row[filter.field] || "")
          .toLowerCase()
          .includes(String(filter.value || "").toLowerCase())
      );
    });

    visibleRows.forEach((row, rowIndex) => {
      worksheet.addRow(
        updatedColumns.map((col) => (col.field === "sn" ? rowIndex + 1 : row[col.field]))
      );
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), "table_data.xlsx");
  };

  return (
    <div style={{ height, width }}>
      {enableExport && (
        <div style={{ marginBottom: 10 }}>
          <Button variant="contained" color="primary" onClick={handleExportExcel}>
            Export to Excel
          </Button>
        </div>
      )}

      <Paper sx={{ height, width }} style={{ overflowX: "auto" }}>
        <DataGrid
          sx={{
            border: 0,
            "& .MuiDataGrid-cell": {
              whiteSpace: "normal",
              wordBreak: "break-word",
              lineHeight: "1.5rem",
            },
          }}
          apiRef={apiRef}
          rows={rows}
          columns={updatedColumns}
          pagination
          paginationMode="client"
          getRowId={(row) => row.id}
          components={{ Toolbar: GridToolbar }}
          paginationModel={paginationModel}
          onPaginationModelChange={handlePaginationChange}
          pageSizeOptions={pageSizeOptions || [25, 50, 100]}
          filterModel={filterModel}
          onFilterModelChange={setFilterModel}
        />
      </Paper>
    </div>
  );
};

export default ReusableTable;
