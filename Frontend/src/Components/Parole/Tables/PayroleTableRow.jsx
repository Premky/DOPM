import React, { Fragment, memo, useCallback } from "react";
import { VariableSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Checkbox,
  IconButton,
  Box
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";

import NepaliDate from 'nepali-datetime';
import { addBSTime, calculateBSDate, convertDaysToBSYMD } from "../../../../Utils/dateCalculator";
import { resolveParoleStatus } from "./resolveParoleStatus";

const isValidBSDate = (date) => date && date !== "0000-00-00";

// 🔥 Row Component (FULL LOGIC PRESERVED)
const Row = memo(({ index, style, data }) => {
  const {
    rows,
    onCheck,
    onMenuOpen
  } = data;

  const rowData = rows[index];

  const {
    data: d,
    kaidiMuddas,
    bandiFines,
    bandiNoPunarabedan
  } = rowData;

  const current_date = new NepaliDate().format('YYYY-MM-DD');
  const firstMudda = kaidiMuddas[0] || {};

  const handleCheck = useCallback(() => {
    onCheck(d.payrole_id, !d.is_checked);
  }, [d, onCheck]);

  const kaidDuration = calculateBSDate(d.thuna_date_bs, d.release_date_bs);
  const bhuktanDuration = calculateBSDate(d.thuna_date_bs, current_date, kaidDuration);
  const bakiDuration = calculateBSDate(current_date, d.release_date_bs, kaidDuration);

  const hirasat = {
    years: d?.hirasat_years || 0,
    months: d?.hirasat_months || 0,
    days: d?.hirasat_days || 0
  };

  const escapeDurationDays = d?.total_escape_duration_days || 0;

  let totalKaidDuration, totalBhuktanDuration, totalBakiDuration;

  if (hirasat.years || hirasat.months || hirasat.days || escapeDurationDays) {
    totalKaidDuration = calculateBSDate(d.thuna_date_bs, d.release_date_bs, 0, hirasat);
    totalBhuktanDuration = calculateBSDate(d.thuna_date_bs, current_date, totalKaidDuration, hirasat, escapeDurationDays);
    totalBakiDuration = calculateBSDate(current_date, d.release_date_bs, totalKaidDuration, {}, -escapeDurationDays);
  }

  let updated_release_date = null;

  if (isValidBSDate(d?.release_date_bs) && escapeDurationDays > 0) {
    const escapedDuration = convertDaysToBSYMD(escapeDurationDays);
    try {
      updated_release_date = addBSTime(d.release_date_bs, escapedDuration);
    } catch {
      updated_release_date = d.release_date_bs;
    }
  }

  return (
    <Box style={style}>
      <TableRow hover>

        <TableCell>
          <Checkbox
            checked={Boolean(d.is_checked)}
            onChange={handleCheck}
          />
        </TableCell>

        <TableCell>{index + 1}</TableCell>
        <TableCell>{resolveParoleStatus(d).label}</TableCell>
        <TableCell>{d.current_office_name}</TableCell>

        <TableCell>
          <b>{d.bandi_name}</b>
          <Box fontSize="0.75rem">
            {d.nationality === "स्वदेशी"
              ? `${d.city_name_np}-${d.wardno}, ${d.district_name_np}`
              : `${d.bidesh_nagarik_address_details}, ${d.country_name_np}`}
          </Box>
        </TableCell>

        <TableCell>{d.office_bandi_id}</TableCell>
        <TableCell>{d.current_age}</TableCell>
        <TableCell>{d.country_name_np}</TableCell>

        <TableCell>
          {firstMudda.mudda_name}<br />{firstMudda.mudda_no}
        </TableCell>

        <TableCell>{firstMudda.vadi}</TableCell>

        <TableCell>
          {firstMudda.mudda_office}<br />{firstMudda.mudda_phesala_antim_office_date}
        </TableCell>

        <TableCell>{d.thuna_date_bs}</TableCell>

        <TableCell>
          {totalKaidDuration?.formattedDuration || kaidDuration?.formattedDuration}
        </TableCell>

        <TableCell>
          {d.release_date_bs}
          {escapeDurationDays > 0 && (
            <>
              <br />{escapeDurationDays} दिन
              <br />{updated_release_date}
            </>
          )}
        </TableCell>

        <TableCell>
          {totalBhuktanDuration?.formattedDuration || bhuktanDuration?.formattedDuration}
        </TableCell>

        <TableCell>
          {totalBakiDuration?.formattedDuration || bakiDuration?.formattedDuration}
        </TableCell>

        <TableCell>
          {bandiNoPunarabedan.map((n, i) => (
            <div key={i}>{i + 1}. {n.punarabedan_office}</div>
          ))}
        </TableCell>

        <TableCell>
          {bandiFines.map((f, i) => (
            <div key={i}>{i + 1}. {f.deposit_amount}</div>
          ))}
        </TableCell>

        <TableCell>{d.remarks}</TableCell>

        <TableCell>
          <IconButton
            size="small"
            onClick={(e) => onMenuOpen(e, rowData)}
          >
            <MoreVertIcon />
          </IconButton>
        </TableCell>

      </TableRow>
    </Box>
  );
});

// 🔥 Main Virtualized Table (FULL UI SAME)
const VirtualizedPayroleTable = ({ rows = [], onCheck, onMenuOpen }) => {

  const getRowHeight = (index) => {
    const row = rows[index];
    const extra = row.kaidiMuddas?.length > 1 ? (row.kaidiMuddas.length * 40) : 60;
    return extra;
  };

  return (
    <Box sx={{ height: "80vh", width: "100%" }}>

      {/* Header stays SAME */}
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>#</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Office</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>ID</TableCell>
            <TableCell>Age</TableCell>
            <TableCell>Country</TableCell>
            <TableCell>Mudda</TableCell>
            <TableCell>Vadi</TableCell>
            <TableCell>Office</TableCell>
            <TableCell>Thuna</TableCell>
            <TableCell>Kaid</TableCell>
            <TableCell>Release</TableCell>
            <TableCell>Bhuktan</TableCell>
            <TableCell>Baki</TableCell>
            <TableCell>No Appeal</TableCell>
            <TableCell>Fines</TableCell>
            <TableCell>Remarks</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
      </Table>

      {/* Virtualized Body */}
      <AutoSizer>
        {({ height, width }) => (
          <List
            height={height}
            width={width}
            itemCount={rows.length}
            itemSize={getRowHeight}
            itemData={{ rows, onCheck, onMenuOpen }}
          >
            {Row}
          </List>
        )}
      </AutoSizer>

    </Box>
  );
};

export default VirtualizedPayroleTable;