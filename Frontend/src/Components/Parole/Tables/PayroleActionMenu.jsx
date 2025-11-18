import React, { useState } from "react";
import { MenuItem, Button } from "@mui/material";
import { pdf } from "@react-pdf/renderer";
import { useBaseURL } from "../../../Context/BaseURLProvider";
import { useAuth } from "../../../Context/AuthContext";
import ForwardToKapraDialog from "../Dialogs/ForwardToKapraDialog";
import Swal from "sweetalert2";
import axios from "axios";

import PayroleApplicationDocx from "../Exports/ParoleApplicationDocx";
import PayroleFileCoverDocx from "../Exports/PayroleFileCoverDocx";
import PayroleNoPunrabedanDocx from "../Exports/PayroleNoPunrabedanDocx";
import PayroleResultModal from "../Dialogs/PayroleResultModal";
import PayroleCharacterDocx from "../Exports/PayroleCharacterDocx";
import ForwardDialog4Bibhag from "../Dialogs/ForwardDialog4Bibhag";

const handleViewPayrole = async ( row ) => {

  const doc = <BandiFullReportPDF bandiData={row} />;
  const blob = await pdf( doc ).toBlob();
  saveAs( blob, `bandi_report_${ row.bandi_id }.pdf` );
};

const PayroleActionMenu = ( { oldStatus, data, onResultClick, onClose, refetchAll } ) => {
  const BASE_URL = useBaseURL();
  const { state: authState } = useAuth();

  const status = data?.payrole_status;
  const officeId = data?.current_office_id;

  const handleAction = ( action ) => {
    switch ( action ) {
      case "result":
        onResultClick();
        break;
      case "view":
        // console.log("View clicked for", data.bandi_name);
        <PDFDownloadLink
          document={<BandiFullReportPDF
            bandiData={data}
          />}
          fileName={`bandi_${ selectedBandi?.id }_report.pdf`}
        />;
        break;
      case "forward":
        console.log( "Forward clicked" );
        break;
      default:
        break;
    }
    onClose();
  };

  const [forwardModalOpen, setForwardModalOpen] = useState( false );
  const [forwardModalOpen4dopm, setForwardModalOpen4dopm] = useState( false );
  const handleForward = () => {
    setForwardModalOpen( true );
  };

  const handleForward4dopm = () => {
    setForwardModalOpen4dopm( true );
  };
  const [approvalModalOpen, setApprovalModalOpen] = useState( false );
  const handleApproval = () => {
    setApprovalModalOpen( true );
  };

  const handleForwardSave = async ( updatedData ) => {
    // console.log(updatedData)
    try {
      await axios.put(
        `${ BASE_URL }/payrole/update_payrole/${ updatedData.payrole_id }`,
        updatedData,
        { withCredentials: true } // ✅ Fix: put this inside an object
      );
      refetchAll();
      Swal.fire( 'सफल भयो!', 'डेटा सफलतापूर्वक अपडेट गरियो।', 'success' );
    } catch ( err ) {
      console.error( err );
      Swal.fire( 'त्रुटि!', 'डेटा अपडेट गर्न सकिएन।', 'error' );
    }
  };

  const handleApprovalSave = async ( updatedData ) => {
    console.log( updatedData );
    try {
      await axios.put(
        `${ BASE_URL }/payrole/update_payrole_status/${ updatedData.payrole_id }`,
        updatedData,
        { withCredentials: true } // ✅ Fix: put this inside an object
      );
      refetchAll();
      Swal.fire( 'सफल भयो!', 'डेटा सफलतापूर्वक अपडेट गरियो।', 'success' );
    } catch ( err ) {
      console.error( err );
      Swal.fire( 'त्रुटि!', 'डेटा अपडेट गर्न सकिएन।', 'error' );
    }
  };


  return (
    <>
      <ForwardToKapraDialog
        open={forwardModalOpen}
        onClose={() => setForwardModalOpen( false )}
        onSave={handleForwardSave}
        editingData={data}
      />
      <ForwardDialog4Bibhag
        open={forwardModalOpen4dopm}
        onClose={() => setForwardModalOpen4dopm( false )}
        onSave={handleForwardSave}
        editingData={data}
      />
      <PayroleResultModal
        oldStatus={oldStatus}
        open={approvalModalOpen}
        onClose={() => setApprovalModalOpen( false )}
        onSave={handleApprovalSave}
        data={data}
      />
      {/* <Paro
        oldStatus={oldStatus}
        open={approvalModalOpen}
        onClose={() => setApprovalModalOpen( false )}
        onSave={handleApprovalSave}
        data={data}
      /> */}
      <a
        href={`/parole/view_saved_record/${ data?.bandi_id }`}
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <MenuItem>विवरण हेर्नुहोस् </MenuItem>
        {/* <MenuItem>{data.payrole_status}</MenuItem> */}
      </a>

      {
        authState.role_id <= 2 && ( <>
          <MenuItem><PayroleApplicationDocx data={data} /> </MenuItem>
          <MenuItem><PayroleFileCoverDocx data={data} /> </MenuItem>
          <MenuItem><PayroleNoPunrabedanDocx data={data} /> </MenuItem>
          <MenuItem><PayroleCharacterDocx data={data} /> </MenuItem>
        </> )

      }

      {
        status === 2 && ( officeId === 1 || officeId === 2 ) && (
          <MenuItem onClick={onResultClick}>निर्णय राख्ने</MenuItem>
        )
      }

      {
        authState.role_name === "clerk" && (
          <>
            {data.status_id >= 10 ? (
              <>
                {/* <MenuItem onClick={handleSend}>पठाउनुहोस्</MenuItem> */}
              </>
            ) : (
              <>
                <MenuItem onClick={handleForward}>
                  <Button variant='outline'>कार्यालय प्रमुखमा पेश गर्नुहोस्</Button>
                </MenuItem>

                {oldStatus === "under_parole" && (
                  <MenuItem onClick={handleApproval}>
                    <Button variant="outlined" color="success">
                      Approve
                    </Button>
                  </MenuItem>
                )}
              </>
            )
            }
          </>
        )
      }

      {
        authState.role_name === "office_admin" ? (
          <>
            {/* Forward is always shown for office_admin */}
            <MenuItem onClick={handleForward}>Forward</MenuItem>

            {/* Show Approve only when oldStatus === 'under_parole' */}
            {oldStatus === "under_parole" && (
              <MenuItem onClick={handleApproval}>
                <Button variant="outlined" color="success">Approve</Button>
              </MenuItem>
            )}

            {/* Status-based actions */}
            {data.status_id === 10 ? (
              <MenuItem onClick={handleTransferDialog}>Transfer</MenuItem>
            ) : data.status_id === 11 ? (
              <MenuItem onClick={handleAcceptReject}>Approve/Reject</MenuItem>
            ) : (
              // If payrole_status is 10, show Forward again (if needed)
              data.payrole_status === 10 && (
                <MenuItem onClick={handleForward}>Forward</MenuItem>
              )
            )}
          </>
        ) : (
          // Non-office_admin roles currently display nothing
          <></>
        )
      }


      {
        authState.role_name === "supervisor" || authState.role_name === "headoffice_approver" ? (
          <>
            <MenuItem onClick={handleForward4dopm} >
              <Button variant="outlined" color="warning">
                Forward/Backward
              </Button>
            </MenuItem>
            <MenuItem onClick={handleApproval}>
              <Button variant="outlined" color="success">
                Approve
              </Button></MenuItem>
          </> ) : ( <>
          </> )
      }


    </>
  );
};

export default PayroleActionMenu;
