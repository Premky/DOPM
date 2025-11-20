import React from "react";
import { Box, Typography } from "@mui/material";

const JSONPreview = ({ data }) => {
  let parsed = {};
  if (typeof data === "string") {
    try {
      parsed = JSON.parse(data);
    } catch {
      parsed = { value: data };
    }
  } else {
    parsed = data || {};
  }

  return (
    <Box
      sx={{
        background: "#f5f5f5",
        padding: 1,
        borderRadius: 1,
        fontSize: 12,
        maxHeight: 150,
        overflowY: "auto",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
      }}
    >
      <Typography variant="caption">
        {JSON.stringify(parsed, null, 2)}
      </Typography>
    </Box>
  );
};

export default JSONPreview;
