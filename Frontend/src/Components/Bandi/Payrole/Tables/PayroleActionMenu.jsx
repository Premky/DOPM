import React, { useState } from "react";
import { MenuItem, Button } from "@mui/material";
import { pdf } from "@react-pdf/renderer";
import BandiFullReportPDF from "../View/BandiFullReportPDF";
import { useBaseURL } from "../../../../Context/BaseURLProvider";
import { useAuth } from "../../../../Context/AuthContext";
import ForwardToKapraDialog from "../Dialogs/ForwardToKapraDialog";
import Swal from "sweetalert2";
import axios from "axios";

import PayroleApplicationDocx from "../Exports/ParoleApplicationDocx";
import PayroleFileCoverDocx from "../Exports/PayroleFileCoverDocx";
import PayroleNoPunrabedanDocx from "../Exports/PayroleNoPunrabedanDocx";
import PayroleResultModal from "../Dialogs/PayroleResultModal";

const handleViewPayrole = async ( row ) => {

  const doc = <BandiFullReportPDF bandiData={row} />;
  const blob = await pdf( doc ).toBlob();
  saveAs( blob, `bandi_report_${ row.bandi_id }.pdf` );
};

const PayroleActionMenu = ( { data, onResultClick, onClose } ) => {
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
  const handleForward = () => {
    setForwardModalOpen( true );
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
      // refetchPayrole();
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
      // refetchPayrole();
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
      <PayroleResultModal
        open={approvalModalOpen}
        onClose={() => setApprovalModalOpen( false )}
        onSave={handleApprovalSave}
        data={data}
      />
      <a
        href={`/bandi/view_saved_record/${ data?.bandi_id }`}
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <MenuItem>विवरण हेर्नुहोस् </MenuItem>
        {/* <MenuItem>{data.payrole_status}</MenuItem> */}
      </a>

      <MenuItem><PayroleApplicationDocx data={data} /> </MenuItem>
      <MenuItem><PayroleFileCoverDocx data={data} /> </MenuItem>
      <MenuItem><PayroleNoPunrabedanDocx data={data} /> </MenuItem>

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
              </>
            )
            }
          </>
        )
      }

      {
        authState.role_name === "office_admin" ? ( <>
          <MenuItem onClick={handleForward}>Forward</MenuItem>
          {/* <MenuItem >{authState.payrole_status}</MenuItem> */}
          {( data.status_id == 10 ) ? ( <>
            <MenuItem onClick={handleTransferDialog}>Transfer</MenuItem>
          </> ) : ( data.status_id == 11 ) ? ( <>
            <MenuItem onClick={handleAcceptReject}>Approve/Reject</MenuItem>
          </> ) : ( data.payrole_status == 10 ) &&
          ( <>
            <MenuItem onClick={handleForward}>Forward</MenuItem>
            {/* <MenuItem onClick={handleReject}>Backward</MenuItem> */}
          </> )}
        </> ) :
          ( <></>
            // authState.role_name === "supervisor" || authState.role_name === "headoffice_approver" ? (
            //    <>
            //   <MenuItem onClick={handleForward}>Forward</MenuItem>
            //   {/* <MenuItem onClick={handleReject}>Backward</MenuItem> */}
            // </> ) : ( <>

            // </> )
          )
      }

      {
        authState.role_name === "supervisor" || authState.role_name === "headoffice_approver" ? (
          <>
            <MenuItem onClick={handleForward} >
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


// {
//   forwardRoles.includes( authState.role_name ) && (
//     <>
//       {( data.status_id <= 11 ) && ( <>
//         <MenuItem onClick={handleApproval}>स्विकृत</MenuItem>
//         <MenuItem onClick={handleForward}>Forward</MenuItem>
//       </> )}
//       {/* <MenuItem onClick={handleReject}>Backward</MenuItem> */}
//     </>
//   )
// }