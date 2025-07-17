import React from "react";
import { MenuItem } from "@mui/material";

const PayroleActionMenu = ({ data, onResultClick, onClose }) => {
  const status = data?.payrole_status;
  const officeId = data?.current_office_id;

  const handleAction = (action) => {
    switch (action) {
      case "result":
        onResultClick();
        break;
      case "view":
        console.log("View clicked for", data.bandi_name);
        break;
      case "forward":
        console.log("Forward clicked");
        break;
      default:
        break;
    }
    onClose();
  };

  return (
    <>
      {/* Example: Head office gets decision access */}
      {status === 2 && (officeId === 1 || officeId === 2) && (
        <MenuItem onClick={() => handleAction("result")}>निर्णय राख्ने</MenuItem>
      )}

      {/* View Details always available */}
      <MenuItem onClick={() => handleAction("view")}>विवरण हेर्नुहोस्</MenuItem>

      {/* Example: Forwarding to DOPM */}
      {status === 1 && officeId !== 1 && (
        <MenuItem onClick={() => handleAction("forward")}>DOPM मा पठाउनुहोस्</MenuItem>
      )}
    </>
  );
};

export default PayroleActionMenu;
