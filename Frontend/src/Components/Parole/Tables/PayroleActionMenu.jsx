import React, { useState } from "react";
import { MenuItem } from "@mui/material";
import Swal from "sweetalert2";
import axios from "axios";

import { useBaseURL } from "../../../Context/BaseURLProvider";
import { useAuth } from "../../../Context/AuthContext";

import ForwardToKapraDialog from "../Dialogs/ForwardToKapraDialog";
import ForwardDialog4Bibhag from "../Dialogs/ForwardDialog4Bibhag";
import PayroleResultModal from "../Dialogs/PayroleResultModal";

import ExportActions from "./ExportActions";
import ClerkActions from "./TableActions/ClerkActions";
import OfficeAdminActions from "./TableActions/OfficeAdminActions";
import SupervisorActions from "./TableActions/SupervisorActions";
import ParoleCourtDecisionModal from "../Dialogs/ParoleCourtDecisionModal";

/**
 * PAYROLE STATUS MAP
 */
const PAYROLE_STATUS = {
  INITIATED: 1,
  PENDING_OFFICE_ADMIN: 2,
  REJECTED_OFFICE_ADMIN: 3,
  PENDING_SUPERVISOR: 4,
  REJECTED_SUPERVISOR: 5,
  PENDING_ADMIN: 6,
  REJECTED_ADMIN: 7,
  TO_BOARD: 14,
  BOARD_DECISION: 15,
  TO_COURT: 16,
  COURT_DECISION: 17
};

const PayroleActionMenu = ( { data, refetchAll } ) => {
  const BASE_URL = useBaseURL();
  const { state: authState } = useAuth();

  const role = authState.role_name;
  const status = data?.payrole_status;

  /** ROLE FLAGS **/
  const isClerk = role === "clerk";
  const isOfficeAdmin = role === "office_admin";
  const isSupervisor = ["supervisor", "headoffice_approver"].includes( role );

  /** PERMISSION FLAGS **/
  const canExportDocs = authState.role_id <= 2 && status <= PAYROLE_STATUS.TO_BOARD;

  const canGiveResult =
    status === PAYROLE_STATUS.PENDING_OFFICE_ADMIN &&
    [1, 2].includes( data.current_office_id );

  /** Dialog State **/
  const [forwardKapraOpen, setForwardKapraOpen] = useState( false );
  const [forwardBibhagOpen, setForwardBibhagOpen] = useState( false );
  const [courtDecisionOpen, setCourtDecisionOpen] = useState( false );
  const [approvalOpen, setApprovalOpen] = useState( false );

  /** API HANDLERS **/
  const handleForwardSave = async ( updateData ) => {
    try {
      await axios.put(
        `${ BASE_URL }/payrole/update_payrole/${ updateData.payrole_id }`,
        updateData,
        { withCredentials: true }
      );
      Swal.fire( "सफल भयो!", "फाइल अगाडि पठाइयो।", "success" );
      refetchAll();
    } catch ( err ) {
      console.error( err );
      Swal.fire( "त्रुटि!", "फाइल पठाउन सकिएन।", "error" );
    }
  };

  const handleApprovalSave = async ( updateData ) => {
    try {
      await axios.put(
        `${ BASE_URL }/payrole/update_payrole_status/${ updateData.payrole_id }`,
        updateData,
        { withCredentials: true }
      );
      Swal.fire( "सफल भयो!", "निर्णय सुरक्षित गरियो।", "success" );
      refetchAll();
    } catch ( err ) {
      console.error( err );
      Swal.fire( "त्रुटि!", "निर्णय सुरक्षित गर्न सकिएन।", "error" );
    }
  };

  const handleCourtDecision = async ( updateData ) => {
    console.log(updateData)
    try {
      await axios.put(
        `${ BASE_URL }/payrole/update_parole_court_decision/${ updateData.payrole_id }`,
        updateData,
        { withCredentials: true }
      );
      Swal.fire( "सफल भयो!", "निर्णय सुरक्षित गरियो।", "success" );
      refetchAll();
    } catch ( err ) {
      console.error( err );
      Swal.fire( "त्रुटि!", "निर्णय सुरक्षित गर्न सकिएन।", "error" );
    }
  };
  return (
    <>
      {/* ================= DIALOGS ================= */}
      <ForwardToKapraDialog
        open={forwardKapraOpen}
        onClose={() => setForwardKapraOpen( false )}
        onSave={handleForwardSave}
        editingData={data}
      />

      <ForwardDialog4Bibhag
        open={forwardBibhagOpen}
        onClose={() => setForwardBibhagOpen( false )}
        onSave={handleForwardSave}
        editingData={data}
      />

      <PayroleResultModal
        open={approvalOpen}
        onClose={() => setApprovalOpen( false )}
        onSave={handleApprovalSave}
        data={data}
      />

      <ParoleCourtDecisionModal
        open={courtDecisionOpen}
        onClose={()=>setCourtDecisionOpen( false )}
        onSave={handleCourtDecision}
        data={data}
      />

      {/* ================= COMMON ACTIONS ================= */}

      {/* View Details */}
      <a
        href={`/parole/view_saved_record/${ data?.bandi_id }`}
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <MenuItem>विवरण हेर्नुहोस्</MenuItem>
      </a>

      {/* Export */}
      {canExportDocs && <ExportActions data={data} />}

      {/* Result Entry */}
      {canGiveResult && (
        <MenuItem onClick={() => setApprovalOpen( true )}>
          निर्णय राख्ने
        </MenuItem>
      )}

      {/* ================= ROLE BASED ACTIONS ================= */}

      {isClerk && (
        <ClerkActions
          status={status}
          onForward={() => setForwardKapraOpen( true )}
        />
      )}

      {isOfficeAdmin && (
        <OfficeAdminActions
          status={status}
          onForward={() => setForwardKapraOpen( true )}
          onApprove={() => setCourtDecisionOpen( true )}
        />
      )}

      {isSupervisor && (
        <SupervisorActions
          status={status}
          onForward={() => setForwardBibhagOpen( true )}
          onApprove={() => setApprovalOpen( true )}
        />
      )}
    </>
  );
};

export default PayroleActionMenu;
