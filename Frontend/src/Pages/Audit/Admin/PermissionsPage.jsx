import React, { useState } from "react";
import { Tabs, Tab, Box } from "@mui/material";
// import ManagePermissions from "../../components/Permissions/ManagePermissions";

import ManagePermissions from "../../../Components/Permissions/ManagePermissions";
import RolePermissions from "../../../Components/Permissions/RolePermissions";


const PermissionsPage = () => {
  const [tab, setTab] = useState(0);

  return (
    <Box>
      <Tabs value={tab} onChange={(e,v) => setTab(v)}>
        <Tab label="Permissions" />
        <Tab label="Role Permissions" />
        <Tab label="User Permissions" />
      </Tabs>

      <Box mt={2}>
        {tab === 0 && <ManagePermissions />}
        {tab === 1 && <RolePermissions />}
        {/* {tab === 2 && <UserPermissions />} */}
      </Box>
    </Box>
  );
};

export default PermissionsPage;
