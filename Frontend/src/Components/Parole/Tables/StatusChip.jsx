import { Chip } from "@mui/material";
import { resolveParoleStatus } from "./resolveParoleStatus";

const StatusChip = ({ row }) => {
  const { label, color } = resolveParoleStatus(row);

  return (
    <Chip
      size="small"
      label={label}
      color={color}
      variant="contained"
      sx={{ fontWeight: 500 }}
    />
  );
};

export default StatusChip;
