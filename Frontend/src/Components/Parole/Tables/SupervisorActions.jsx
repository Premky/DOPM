import { MenuItem } from "@mui/material";

const SupervisorActions = ({
  onForward,
  onApprove,
  canApprove = true
}) => {
  return (
    <>
      {/* Forward / Backward */}
      <MenuItem onClick={onForward}>
        विभागमा पेश / फिर्ता पठाउनुहोस्
      </MenuItem>

      {/* Approve (Board / Final Recommendation) */}
      {canApprove && (
        <MenuItem
          onClick={onApprove}
          sx={{ color: "success.main", fontWeight: 600 }}
        >
          स्वीकृत गर्नुहोस्
        </MenuItem>
      )}
    </>
  );
};

export default SupervisorActions;
