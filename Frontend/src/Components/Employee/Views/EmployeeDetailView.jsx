import React, { useEffect, useState } from "react";
import { Box, Tabs, Tab, Paper } from "@mui/material";
import { useParams } from "react-router-dom";
import { getEmployeeById } from "../services/employeeService";
import { useAuth } from "../../../Context/AuthContext";

// import EmployeeHeader from "./sections/EmployeeHeader";
// import EmployeeCompleteness from "./sections/EmployeeCompleteness";

import PersonalTab from "./tabs/PersonalTab";
import JobTab from "./tabs/JobTab";
import AddressTab from "./tabs/AddressTab";
import AuditTab from "./tabs/AuditTab";
import EmployeeCompleteness from "../Forms/sections/EmployeeCompleteness";

const EmployeeDetailView = () => {
  const { id } = useParams();
  const { state: auth } = useAuth();
  const [employee, setEmployee] = useState(null);
  const [tab, setTab] = useState(0);

  const fetchEmployee = async () => {
    const res = await getEmployeeById(id);
    setEmployee(res.data || res);
  };

  useEffect(() => { fetchEmployee(); }, [id]);

  if (!employee) return null;

  return (
    <Box p={3}>
      {/* <EmployeeHeader employee={employee} /> */}

      <EmployeeCompleteness employee={employee} />

      <Paper sx={{ mt: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="व्यक्तिगत विवरण" />
          <Tab label="नियुक्ति / पद" />
          <Tab label="ठेगाना" />
          <Tab label="Audit Log" />
        </Tabs>

        {tab === 0 && <PersonalTab employee={employee} refresh={fetchEmployee} />}
        {tab === 1 && <JobTab employee={employee} refresh={fetchEmployee} />}
        {tab === 2 && <AddressTab employee={employee} refresh={fetchEmployee} />}
        {tab === 3 && <AuditTab employeeId={id} />}
      </Paper>
    </Box>
  );
};

export default EmployeeDetailView;
