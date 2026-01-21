import React from "react";
import { Button, LinearProgress, Typography, Box } from "@mui/material";
import useBandiExport from "../hooks/useBandiExport";

const ExportBandiButton = ({ BASE_URL, authState, filters, includePhoto, language }) => {
  const { handleExport, cancelExport, exporting, progress } = useBandiExport(
    BASE_URL,
    authState,
    filters,
    includePhoto,
    language
  );

  return (
    <Box>
      <Button
        variant="contained"
        color="primary"
        onClick={handleExport}
        disabled={exporting}
      >
        Export Bandi Excel
      </Button>

      {exporting && (
        <>
          <Box mt={1} display="flex" gap={1} alignItems="center">
            <Typography variant="body2">Progress: {progress}%</Typography>
            <Button variant="outlined" color="error" size="small" onClick={cancelExport}>
              Cancel Export
            </Button>
          </Box>
          <LinearProgress variant="determinate" value={progress} />
        </>
      )}
    </Box>
  );
};

export default ExportBandiButton;
