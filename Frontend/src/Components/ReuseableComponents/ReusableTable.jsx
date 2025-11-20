import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Box, Button, Paper } from "@mui/material";

const ReusableTable = ({ rows = [], columns = [], pageSize = 20 }) => {
  if (!Array.isArray(rows)) {
    console.warn("ReusableTable: rows is not an array", rows);
    rows = [];
  }

  // Add actions column if needed
  const enhancedColumns = columns.map((col) => {
    if (col.field === "actions") {
      return {
        ...col,
        renderCell: (params) => (
          <Box sx={{ display: "flex", gap: 1 }}>
            {col.viewHandler && (
              <Button
                variant="outlined"
                size="small"
                onClick={() => col.viewHandler(params.row.id)}
              >
                View
              </Button>
            )}
            {col.restoreHandler && params.row.action !== "restore" && (
              <Button
                variant="contained"
                color="error"
                size="small"
                onClick={() => col.restoreHandler(params.row.id)}
              >
                Restore
              </Button>
            )}
          </Box>
        ),
      };
    }
    return col;
  });

  return (
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
      <DataGrid
        rows={rows}
        columns={enhancedColumns}
        pageSize={pageSize}
        rowsPerPageOptions={[10, 20, 50]}
        autoHeight
        getRowId={(row) => row.id ?? row.record_id} // fallback if id missing
      />
    </Paper>
  );
};

export default ReusableTable;
