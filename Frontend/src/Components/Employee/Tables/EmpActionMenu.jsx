import React, { useState } from "react";
import { MenuItem, Button } from "@mui/material";
import { useBaseURL } from "../../../Context/BaseURLProvider";
import { useAuth } from "../../../Context/AuthContext";
import Swal from "sweetalert2";
import axios from "axios";
import { deleteEmployee } from "../services/employeeService";
import { saveAs } from "file-saver";
// import EmployeeProfilePDF from "../PDF/EmployeeProfilePDF";

const EmpActionMenu = ({
  currentStatus,
  employee,
  onClose,
  refetchAll,
  onEdit,
  onTransfer,
}) => {
  // console.log(employee)
  const BASE_URL = useBaseURL();
  const { state: authState } = useAuth();

  const handleViewProfilePDF = async () => {
    const { pdf } = await import("@react-pdf/renderer");
    const doc = <EmployeeProfilePDF employee={employee} />;
    const blob = await pdf(doc).toBlob();
    saveAs(blob, `employee_${employee.emp_id}_profile.pdf`);
    onClose?.();
  };

  const handleDelete = async () => {
    const res = await Swal.fire({
      title: "Confirm Delete",
      text: "Are you sure you want to delete this employee?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
    });

    if (!res.isConfirmed) return;

    try {
      await deleteEmployee(employee.emp_id);
      Swal.fire("Deleted", "Employee deleted successfully", "success");
      refetchAll?.();
      onClose?.();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Delete failed", "error");
    }
  };

  return (
    <>
      <MenuItem
        component="a"
        href={`/emp/view_employee/${employee.emp_id}`}
        target="_blank"
      >
        विवरण हेर्नुहोस्
      </MenuItem>

      <MenuItem onClick={handleViewProfilePDF}>
        PDF प्रोफाइल
      </MenuItem>

      {/* <MenuItem onClick={() => { onEdit?.(employee); onClose?.(); }}>
        Edit
      </MenuItem> */}

      {/* <MenuItem onClick={handleDelete}>
        Delete
      </MenuItem> */}

      <MenuItem onClick={() => { onTransfer?.(employee); onClose?.(); }}>
        Transfer
      </MenuItem>

      {authState.role_name === "office_admin" && currentStatus === "pending" && (
        <MenuItem>
          <Button variant="outlined" color="success">
            Approve
          </Button>
        </MenuItem>
      )}
    </>
  );
};

export default EmpActionMenu;
