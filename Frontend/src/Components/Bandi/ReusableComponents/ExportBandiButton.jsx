import React from "react";
import { Button, LinearProgress, Typography } from "@mui/material";
import useBandiExport from "../Apis_to_fetch/useBandiExport";

const ExportBandiButton = ({ BASE_URL, authState, filters, includePhoto, language }) => {
  const { handleExport, exporting, progress } = useBandiExport(BASE_URL, authState, filters, includePhoto, language);

  return (
    <div>
      <Button variant="contained" onClick={handleExport} disabled={exporting}>
        {exporting ? "Exporting..." : "Export Bandi Excel"}
      </Button>

      {exporting && (
        <div style={{ marginTop: 10 }}>
          <Typography variant="body2">Progress: {progress}%</Typography>
          <LinearProgress variant="determinate" value={progress} />
        </div>
      )}
    </div>
  );
};

export default ExportBandiButton;
