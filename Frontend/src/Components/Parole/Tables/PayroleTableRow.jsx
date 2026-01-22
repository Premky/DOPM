import React, { Fragment, memo, useCallback } from "react";
import {
  TableRow,
  TableCell,
  Checkbox,
  IconButton,
  Box,
  TableContainer
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import StatusChip from "./StatusChip";
import NepaliDate from 'nepali-datetime';
import { calculateBSDate } from "../../../../Utils/dateCalculator";
import { maxHeight } from "@mui/system";
import { resolveParoleStatus } from "./resolveParoleStatus";

const PayroleTableRow = ( {
  data,
  index,
  kaidiMuddas,
  bandiFines,
  bandiNoPunarabedan,
  isCheckboxNotVisible,
  onCheck,
  onMenuOpen
} ) => {
  const current_date = new NepaliDate().format( 'YYYY-MM-DD' );
  const rowSpan = kaidiMuddas.length || 1;
  const firstMudda = kaidiMuddas[0] || {};

  // Stable checkbox change handler
  const handleCheck = useCallback( () => {
    onCheck( data.payrole_id, !data.is_checked );
  }, [data.payrole_id, data.is_checked, onCheck] );

  const kaidDuration = calculateBSDate( data.thuna_date_bs, data.release_date_bs );
  const bhuktanDuration = calculateBSDate( data.thuna_date_bs, current_date, kaidDuration );
  const bakiDuration = calculateBSDate( current_date, data.release_date_bs, kaidDuration );
  const hirasatDays = data?.hirasat_days || 0;
  const hirasatMonths = data?.hirasat_months || 0;
  const hirasatYears = data?.hirasat_years || 0;
  let totalKaidDuration;
  let totalBhuktanDuration;
  let totalBakiDuration;
  if ( hirasatDays > 0 || hirasatMonths > 0 || hirasatYears > 0 ) {
    totalKaidDuration = calculateBSDate( data.thuna_date_bs, data.release_date_bs, 0, hirasatYears, hirasatMonths, hirasatDays );
    totalBhuktanDuration = calculateBSDate( data.thuna_date_bs, current_date, totalKaidDuration, hirasatYears, hirasatMonths, hirasatDays );
    totalBakiDuration = calculateBSDate( current_date, data.release_date_bs, totalKaidDuration );
  }


  const statusBgMap = {
    yogya: "#badef8ff" ,    // blue
    aayogya: "#f8bbb5ff",   // red
    pass: "#acfcb3ff", // green
    fail: "rgb(248, 144, 135)",     // orange
    chalfal: "#fcebc8ff", // yellow
    lackofpaper: "#6F6F6F ", // grey
  };

  const status = resolveParoleStatus( data );
  const rowBgColor = statusBgMap[status.color] || "transparent";

  const stickyStyle = ( left, z = 3 ) => ( {
    position: "sticky",
    left,
    zIndex: z,
    background: rowBgColor
  } );

  return (
    <Fragment>

      <TableRow
        hover
      >

        {!isCheckboxNotVisible && (
          <TableCell
            rowSpan={rowSpan}
            sx={stickyStyle( 0, 3 )}
          >
            <Checkbox
              checked={Boolean( data.is_checked )}
              onChange={handleCheck}
            />
          </TableCell>
        )}


        <TableCell rowSpan={rowSpan} sx={stickyStyle( isCheckboxNotVisible ? 0 : 50, 3 )}>{index}</TableCell>
        <TableCell rowSpan={rowSpan} sx={stickyStyle( isCheckboxNotVisible ? 50 : 100, 3 )}> {resolveParoleStatus( data ).label}
          {/* <StatusChip row={data} /> */}
        </TableCell>
        {/* <TableCell rowSpan={rowSpan}>{data.payrole_no_id}</TableCell> */}
        <TableCell rowSpan={rowSpan} sx={stickyStyle( isCheckboxNotVisible ? 100 : 160, 3 )}>{data.current_office_name}</TableCell>

        <TableCell rowSpan={rowSpan} sx={stickyStyle( isCheckboxNotVisible ? 160 : 250, 3 )}>
          <b>{data.bandi_name}</b>
          <Box fontSize="0.75rem">
            {data.nationality === "स्वदेशी"
              ? `${ data.city_name_np }-${ data.wardno }, ${ data.district_name_np }`
              : `${ data.bidesh_nagarik_address_details }, ${ data.country_name_np }`}
          </Box>
        </TableCell>
        <TableCell rowSpan={rowSpan} >{data.office_bandi_id}</TableCell>

        <TableCell rowSpan={rowSpan}>
          {data.current_age}
          <br />
          {data.gender === "Male" ? "पुरुष" :
            data.gender === "Female" ? "महिला" : "अन्य"}
        </TableCell>
        {/* <TableCell rowSpan={rowSpan}>
         
        </TableCell> */}
        <TableCell rowSpan={rowSpan}>{data.country_name_np} </TableCell>

        {/* Mudda (first row) */}
        <TableCell>{firstMudda.mudda_name} <br /> {firstMudda.mudda_no}</TableCell>
        <TableCell>{firstMudda.vadi}</TableCell>
        <TableCell>{firstMudda.mudda_office}</TableCell>

        <TableCell rowSpan={rowSpan}>{data.thuna_date_bs}</TableCell>
        <TableCell rowSpan={rowSpan}>
          {/* कैद अवधि */}
          {( data.hirasat_days || data.hirasat_months || data.hirasat_years ) ? (
            <>
              जम्मा कैदः <br />
              {totalKaidDuration?.formattedDuration}
              <hr />
              हिरासत/थुना अवधीः <br />
              {data?.hirasat_years || 0} | {data?.hirasat_months || 0} | {data?.hirasat_days || 0}
              <hr />
              बेरुजु कैदः <br />
            </>
          ) : null}
          {kaidDuration?.formattedDuration}
        </TableCell>
        <TableCell rowSpan={rowSpan}>{data.release_date_bs}</TableCell>
        <TableCell rowSpan={rowSpan}>
          {/*भुक्तान अवधी*/}
          {( data.hirasat_days || data.hirasat_months || data.hirasat_years ) ? ( <>
            {totalBhuktanDuration?.formattedDuration}
            <hr />
            {totalBhuktanDuration?.percentage != null ? `${ totalBhuktanDuration.percentage }%` : '–'}
          </> ) : (
            <>
              {bhuktanDuration?.formattedDuration} <hr />
              {bhuktanDuration?.percentage}%
            </>
          )}
        </TableCell>
        <TableCell rowSpan={rowSpan}>
          {( data.hirasat_days || data.hirasat_months || data.hirasat_years ) ? ( <>
            {totalBakiDuration?.formattedDuration}
            <hr />
            {totalBakiDuration?.percentage != null ? `${ totalBakiDuration.percentage }%` : '–'}
          </> ) : (
            <>
              {bakiDuration?.formattedDuration} <hr />
              {bakiDuration?.percentage}%
            </>
          )}
        </TableCell>
        <TableCell
          rowSpan={kaidiMuddas.length || 1}
          style={bandiNoPunarabedan.length === 0 ? { background: 'red' } : {}}
        >
          {bandiNoPunarabedan.map( ( noPunrabedan, i ) => (
            <>
              <Fragment key={`noPunrabedan-${ data.id }-${ i }`}>
                {i + 1}. {noPunrabedan.punarabedan_office}को च.नं. {noPunrabedan.punarabedan_office_ch_no}, मिति {noPunrabedan.punarabedan_office_date} गतेको पत्र ।
                <hr />
              </Fragment>
            </>

          ) )}
        </TableCell>
        <TableCell rowSpan={kaidiMuddas.length || 1}>
          {bandiFines
            .filter( ( fine ) => fine.deposit_ch_no && fine.deposit_ch_no !== '' )
            .map( ( fine, i ) => (
              <div key={`fine-${ data.id }-${ i }`}>
                {i + 1}. {fine.deposit_office}को च.नं. {fine.deposit_ch_no}, मिति {fine.deposit_date} गतेको पत्रबाट रु.
                {fine.deposit_amount} {fine.fine_name_np}{" "}
                {fine.amount_deposited === 1 ? 'बुझाएको' :
                  <span style={{ color: 'red' }}>नबुझाएको</span>
                } ।
                <hr />
              </div>
            ) )}
        </TableCell>
        {/* <TableCell rowSpan={rowSpan}>{data.court_decision}</TableCell> */}


        <TableCell rowSpan={rowSpan}>
          {( data.remarks !== '' || data.remarks !== null ) && 'कारागारकोः'} {data.remarks} <br />
          {( data.dopm_remarks !== '' || data.remarks !== null ) && 'विभागको:'} {data.dopm_remarks}
        </TableCell>

        <TableCell rowSpan={rowSpan}>
          <IconButton
            size="small"
            onClick={( e ) =>
              onMenuOpen( e, {
                ...data,
                kaidiMuddas,
                bandiFines,
                bandiNoPunarabedan
              } )
            }
          >
            <MoreVertIcon />
          </IconButton>
        </TableCell>
      </TableRow>

      {/* extra muddas */}
      {kaidiMuddas.slice( 1 ).map( ( m, i ) => (
        <TableRow key={i} hover>
          {/* <TableCell></TableCell> */}
          <TableCell>{m.mudda_name} {m.mudda_no && ( m.mudda_no )}</TableCell>
          <TableCell>{m.vadi}</TableCell>
          <TableCell>{m.mudda_office}</TableCell>
        </TableRow>
      ) )}
    </Fragment>
  );
};

// Only re-render if relevant row data changes
export default memo( PayroleTableRow, ( prevProps, nextProps ) => {
  return (
    prevProps.data.is_checked === nextProps.data.is_checked &&
    prevProps.data.payrole_id === nextProps.data.payrole_id &&
    prevProps.index === nextProps.index &&
    prevProps.kaidiMuddas === nextProps.kaidiMuddas &&
    prevProps.bandiFines === nextProps.bandiFines &&
    prevProps.bandiNoPunarabedan === nextProps.bandiNoPunarabedan &&
    prevProps.isCheckboxNotVisible === nextProps.isCheckboxNotVisible
  );
} );
