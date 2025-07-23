import React, { useState } from "react";
import { MenuItem } from "@mui/material";
import { pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import { useBaseURL } from "../../../Context/BaseURLProvider";
import BandiFullReportPDF from "../../Bandi/Payrole/View/BandiFullReportPDF";
import { useAuth } from "../../../Context/AuthContext";
import ForwardDialog from "../Dialogs/ForwardDialog";
import Swal from "sweetalert2";
import ApprovalDialog from "../Dialogs/ApprovalDialog";

import axios from "axios";
import TransferDialog from "../Dialogs/TransferDialog";
import AcceptRejectTransferDialog from "../Dialogs/AcceptRejectTransferDialog";

const TableActionMenu = ( { data, onResultClick, onClose } ) => {
  const BASE_URL = useBaseURL();
  const { state: authState } = useAuth();
  const status = data?.payrole_status;
  const officeId = data?.current_office_id;

  const [openForwardDialog, setOpenForwardDialog] = useState( false );
  const [openApprovalDialog, setOpenApprovalDialog] = useState( false );
  const [openTransferDialog, setOpenTransferDialog] = useState( false );
  const [acceptRejectDialog, setAcceptRejectDialog] = useState( false );

  const handleViewBandi = async () => {
    const doc = <BandiFullReportPDF bandiData={data} />;
    const blob = await pdf( doc ).toBlob();
    saveAs( blob, `bandi_report_${ data.bandi_id }.pdf` );
  };

  const handleSave = async ( data ) => {
    console.log( "Saving data:", data );
    // console.log( "Saving data:" );
    try {
      await axios.put(
        `${ BASE_URL }/bandiTransfer/update_bandi_transfer_history/${ data.transfer_id }`,
        data,
        { withCredentials: true }
      );

      await Swal.fire( 'सफल भयो!', 'डेटा सफलतापूर्वक अपडेट गरियो।', 'success' );
      // ✅ Now close after user sees the alert
      setOpenForwardDialog( false );
      setOpenApprovalDialog( false );

    } catch ( err ) {
      console.error( err );

      await Swal.fire( 'त्रुटि!', 'डेटा अपडेट गर्न सकिएन।', 'error' );
      // Close even on error after alert
      setOpenForwardDialog( false );
      setOpenApprovalDialog( false );
    } finally {
      setOpenForwardDialog( false );
      setOpenApprovalDialog( false );
    }
  };
  const handleApprove = async ( data ) => {
    console.log( "Saving data:", data );
    // console.log( "Saving data:" );
    try {
      await axios.put(
        `${ BASE_URL }/bandiTransfer/update_bandi_transfer_history/${ data.transfer_id }`,
        data,
        { withCredentials: true }
      );

      await Swal.fire( 'सफल भयो!', 'डेटा सफलतापूर्वक अपडेट गरियो।', 'success' );
      // ✅ Now close after user sees the alert
      setOpenForwardDialog( false );
      setOpenApprovalDialog( false );

    } catch ( err ) {
      console.error( err );

      await Swal.fire( 'त्रुटि!', 'डेटा अपडेट गर्न सकिएन।', 'error' );
      // Close even on error after alert
      setOpenForwardDialog( false );
      setOpenApprovalDialog( false );
    } finally {
      setOpenForwardDialog( false );
      setOpenApprovalDialog( false );
    }
  };

  const handleAcceptReject = () => {
    setAcceptRejectDialog( true );
    // onClose();
  };


  const handleAcceptRejectSave1 = async ( data ) => {
    console.log( "Saving data:", data );
    // console.log( "Saving data:" );
    try {
      await axios.put(
        `${ BASE_URL }/bandiTransfer/update_bandi_transfer_history/${ data.transfer_id }`,
        data,
        { withCredentials: true }
      );

      await Swal.fire( 'सफल भयो!', 'डेटा सफलतापूर्वक अपडेट गरियो।', 'success' );
      // ✅ Now close after user sees the alert
      setOpenForwardDialog( false );
      setOpenApprovalDialog( false );

    } catch ( err ) {
      console.error( err );

      await Swal.fire( 'त्रुटि!', 'डेटा अपडेट गर्न सकिएन।', 'error' );
      // Close even on error after alert
      setOpenForwardDialog( false );
      setOpenApprovalDialog( false );
    } finally {
      setOpenForwardDialog( false );
      setOpenApprovalDialog( false );
    }
  };

  const handleForward = () => {
    setOpenForwardDialog( true );
    // onClose();
  };

  const handleApproval = () => {
    setOpenApprovalDialog( true );
    // onClose();
  };

  const handleTransfer = async ( data ) => {
    console.log( "Saving data:", data );
    // console.log( "Saving data:" );
    try {
      await axios.put(
        `${ BASE_URL }/bandiTransfer/update_bandi_transfer_history/${ data.transfer_id }`,
        data,
        { withCredentials: true }
      );

      await Swal.fire( 'सफल भयो!', 'डेटा सफलतापूर्वक अपडेट गरियो।', 'success' );
      // ✅ Now close after user sees the alert
      setOpenForwardDialog( false );
      setOpenApprovalDialog( false );

    } catch ( err ) {
      console.error( err );

      await Swal.fire( 'त्रुटि!', 'डेटा अपडेट गर्न सकिएन।', 'error' );
      // Close even on error after alert
      setOpenForwardDialog( false );
      setOpenApprovalDialog( false );
    } finally {
      setOpenForwardDialog( false );
      setOpenApprovalDialog( false );
    }
  };

  const handleTransferDialog = () => {
    setOpenTransferDialog( true );
    // onClose();
  };

  const handleReject = () => {
    console.log( "Rejection logic goes here" );
    onClose();
  };

  const forwardRoles = ["supervisor", "headoffice_approver", "top_level"];

  return (
    <>
      <ForwardDialog
        open={openForwardDialog}
        onClose={() => setOpenForwardDialog( false )}
        editingData={data} // 👈 you probably want to pass editing data here    
        onSave={handleSave}
      />
      <ApprovalDialog
        open={openApprovalDialog}
        onClose={() => setOpenApprovalDialog( false )}
        editingData={data} // 👈 you probably want to pass editing data her
        onSave={handleApprove}
      />
      <TransferDialog
        open={openTransferDialog}
        onClose={() => setOpenTransferDialog( false )}
        editingData={data} // 👈 you probably want to pass editing data her
        onSave={handleTransfer}
      />
      <AcceptRejectTransferDialog
        open={acceptRejectDialog}
        onClose={() => setAcceptRejectDialog( false )}
        editingData={data}
        onSave={handleApprove}
      />

      {/* <MenuItem onClick={handleViewBandi}>PDF</MenuItem>; */}
      <a
        href={`/bandi/view_saved_record/${ data?.bandi_id }`}
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <MenuItem>विवरण हेर्नुहोस्</MenuItem>
      </a>

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
                  कार्यालय प्रमुखमा पेश गर्नुहोस्
                </MenuItem>
              </>
            )
            }
          </>
        )
      }

      {
        authState.role_name === "office_admin" && ( <>
          {( data.status_id == 10 ) ? ( <>
            <MenuItem onClick={handleTransferDialog}>Transfer</MenuItem>
          </> ) : ( data.status_id == 11 ) ? ( <>
            <MenuItem onClick={handleAcceptReject}>Approve/Reject</MenuItem>
          </> ) : ( data.status < 10 ) &&
          ( <>
            <MenuItem onClick={handleForward}>Forward</MenuItem>
            {/* <MenuItem onClick={handleReject}>Backward</MenuItem> */}
          </> )}
        </> )
      }

      {
        forwardRoles.includes( authState.role_name ) && (
          <>
            {( data.status_id <= 11 ) && ( <>
                <MenuItem onClick={handleApproval}>स्विकृत</MenuItem>
                <MenuItem onClick={handleForward}>Forward</MenuItem>
            </>)}
              {/* <MenuItem onClick={handleReject}>Backward</MenuItem> */}
            </>
            )
      }

            {
              status === 1 && officeId !== 1 && officeId !== 2 && (
                <MenuItem onClick={handleForward}>DOPM मा पठाउनुहोस्</MenuItem>
              )
            }
          </>
        );
};

      export default TableActionMenu;
