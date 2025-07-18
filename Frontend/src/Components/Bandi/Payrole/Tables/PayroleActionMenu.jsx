import React from "react";
import { MenuItem } from "@mui/material";
import { pdf } from "@react-pdf/renderer";
import BandiFullReportPDF from "../View/BandiFullReportPDF";
import { useBaseURL } from "../../../../Context/BaseURLProvider";


const handleViewPayrole = async ( row ) => {
  const doc = <BandiFullReportPDF bandiData={row} />;
  const blob = await pdf( doc ).toBlob();
  saveAs( blob, `bandi_report_${ row.bandi_id }.pdf` );
};

const PayroleActionMenu = ( { data, onResultClick, onClose } ) => {
  const BASE_URL=useBaseURL();
  console.log(BASE_URL)
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

  return (
    <>
      {/* Example: Head office gets decision access */}
      {status === 2 && ( officeId === 1 || officeId === 2 ) && (
        <MenuItem onClick={() => handleAction( "result" )}>निर्णय राख्ने</MenuItem>
      )}

      {/* View Details always available */}
      <MenuItem
        onClick={() => {
          handleViewPayrole( data );
          onClose();
        }}
      >
        विवरण हेर्नुहोस्
      </MenuItem>

      {/* Example: Forwarding to DOPM */}
      {status === 1 && officeId !== 1 && (
        <MenuItem onClick={() => handleAction( "forward" )}>DOPM मा पठाउनुहोस्</MenuItem>
      )}
    </>
  );
};

export default PayroleActionMenu;
