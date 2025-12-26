import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  TableContainer,
  Typography,
} from "@mui/material";
import axios from "axios";
import { useBaseURL } from "../../../../Context/BaseURLProvider";
import ReusePayroleNos from "../../../ReuseableComponents/ReusePayroleNos";
import { useForm } from "react-hook-form";

const OfficeWiseParoleSummarySheet = () => {
  const BASE_URL = useBaseURL();
  const [summaryType, setSummaryType] = useState( "office" ); // office | gender
  const [rows, setRows] = useState( [] );
  const [totals, setTotals] = useState( [] );
  const [loading, setLoading] = useState( false );

  const { control, watch } = useForm();
  const payrole_no_id = watch( "payrole_no_id" );

  const genderMap = { Male: "पुरुष", Female: "महिला", Other: "अन्य" };

  // Fetch summary
  const fetchSummary = useCallback( async () => {
    try {
      setLoading( true );

      const params = new URLSearchParams( {
        mode: 'office',
        type: summaryType,
        ...( payrole_no_id && { payrole_no_id } ),
      } );

      const res = await axios.get(
        `${ BASE_URL }/payrole/summary/office_wise?${ params.toString() }`
      );

      setRows( res.data.rows || [] );
      setTotals( res.data.totals || [] );
    } catch ( err ) {
      console.error( "Failed to fetch summary", err );
    } finally {
      setLoading( false );
    }
  }, [summaryType, payrole_no_id, BASE_URL] );

  useEffect( () => {
    fetchSummary();
  }, [summaryType, fetchSummary] );

  // Export Excel
  const handleExport = () => {
    const params = new URLSearchParams( {
      mode: 'office',
      type: summaryType,
      ...( payrole_no_id && { payrole_no_id } ),
    } );

    // Open the export route in a new tab to download Excel
    window.open(
      `${ BASE_URL }/payrole/summary/office_wise/export?${ params.toString() }`,
      "_blank"
    );
  };

  return (
    <Box p={2}>
      <Typography variant="h6" gutterBottom>
        Payrole Summary Report
      </Typography>

      {/* Filters */}
      <Box display="flex" flexWrap="wrap" gap={2} alignItems="center" mb={2}>
        <ReusePayroleNos name="payrole_no_id" label="प्यारोल संख्या" control={control} />

        <Button variant="outlined" onClick={fetchSummary}>
          Search
        </Button>

        <ToggleButtonGroup
          value={summaryType}
          exclusive
          size="small"
          onChange={( e, val ) => val && setSummaryType( val )}
        >
          {/* <ToggleButton value="office">Office Summary</ToggleButton>
          <ToggleButton value="gender">Gender-wise Summary</ToggleButton> */}
        </ToggleButtonGroup>

        <Button variant="contained" color="success" onClick={handleExport}>
          Export Excel
        </Button>
      </Box>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell><b>कार्यालय</b></TableCell>
              {summaryType === "gender" && <TableCell><b>लिङ्ग</b></TableCell>}
              <TableCell align="right">सिफारिस संख्या</TableCell>
              <TableCell align="right">हेर्न बाँकी</TableCell>
              <TableCell align="right">योग्य</TableCell>
              <TableCell align="right">अयोग्य</TableCell>
              <TableCell align="right">कागजात अपुग</TableCell>
              <TableCell align="right">छलफल</TableCell>
              <TableCell align="right">पास</TableCell>
              <TableCell align="right">फेल</TableCell>
              <TableCell align="right">अदालतबाट पास</TableCell>
              <TableCell align="right">अदालतबाट फेल</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {!loading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={summaryType === "gender" ? 9 : 8} align="center">
                  No data found
                </TableCell>
              </TableRow>
            )}

            {rows.map( ( row, index ) => (
              <TableRow key={index}>
                <TableCell>{row.group_name}</TableCell>

                {summaryType === "gender" && (
                  <TableCell>{genderMap[row.gender] || "अन्य"}</TableCell>
                )}

                <TableCell align="right">{row.total_parole}</TableCell>
                <TableCell align="right">{row.parole_unseen}</TableCell>
                <TableCell align="right">{row.parole_yogya}</TableCell>
                <TableCell align="right">{row.parole_ayogya}</TableCell>
                <TableCell align="right">{row.parole_lack_of_paper_work}</TableCell>
                <TableCell align="right">{row.parole_chalfal}</TableCell>
                <TableCell align="right">{row.parole_pass}</TableCell>
                <TableCell align="right">{row.parole_fail}</TableCell>

                <TableCell align="right">{row.court_pass}</TableCell>
                <TableCell align="right">{row.court_fail}</TableCell>
              </TableRow>
            ) )}

            <TableRow>
              <TableCell><b>जम्मा</b></TableCell>
              {summaryType === "gender" && <TableCell><b>लिङ्ग</b></TableCell>}
              <TableCell align="right">{totals.parole_sifaris}</TableCell>
              <TableCell align="right">{totals.parole_unseen}</TableCell>
              <TableCell align="right">{totals.parole_yogya}</TableCell>
              <TableCell align="right">{totals.parole_ayogya}</TableCell>
              <TableCell align="right">{totals.parole_lack_of_paper_work}</TableCell>
              <TableCell align="right">{totals.parole_chalfal}</TableCell>
              <TableCell align="right">{totals.parole_pass}</TableCell>
              <TableCell align="right">{totals.parole_fail}</TableCell>
              <TableCell align="right">{totals.court_pass}</TableCell>
              <TableCell align="right">{totals.court_fail}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default OfficeWiseParoleSummarySheet;
