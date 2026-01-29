import { MenuItem } from "@mui/material";

const OfficeAdminActions = ( { status, onForward, onApprove } ) => {
  return (
    <>
      {/* Forward to next level */}
      {payrole_status < 16 && (
        <MenuItem onClick={onForward}>
          कारागार प्रशासकबाट अगाडि पठाउनुहोस्
        </MenuItem>
      )}

      {(payrole_status === 16 || payrole_status===17) && (
        <MenuItem onClick={onApprove}>
          अदालतको निर्णय राख्नुहोस्
        </MenuItem>
      )}

      {/* Approve / Reject (only when allowed by parent) */}
      {/* {status === 2 && (
        <MenuItem onClick={onApprove} sx={{ color: "success.main" }}>
          स्वीकृत / अस्वीकृत गर्नुहोस्
        </MenuItem>
      )} */}
    </>
  );
};

export default OfficeAdminActions;
