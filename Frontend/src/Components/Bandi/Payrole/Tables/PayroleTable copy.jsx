// This file is a fully optimized version of your PayroleTable.jsx
// It modularizes filters, actions, and rows, improves performance,
// and prevents accessibility warnings with per-row menu handling.

import React, { useEffect, useState, Fragment } from "react";
import {
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Button, Menu, MenuItem, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions, Typography
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import axios from "axios";
import Swal from "sweetalert2";
import { calculateBSDate } from "../../../../../Utils/dateCalculator";
import PayroleResultModal from "../Dialogs/PayroleResultModal";
import PayroleTableFilters from "./PayroleTableFilters";
import PayroleActionMenu from "./PayroleActionMenu";
import { useBaseURL } from "../../../../Context/BaseURLProvider";

const PayroleTable = () => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [filters, setFilters] = useState({});
  const [modals, setModals] = useState({ result: null });
  const [anchorElMap, setAnchorElMap] = useState({});
  const BASE_URL = useBaseURL();

  const fetchData = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/payrole/get_payroles`, {
        params: {
          page,
          limit: rowsPerPage,
          ...filters
        },
        withCredentials: true
      });
      setData(res.data.Result || []);
    } catch (err) {
      console.error("Error fetching payrole data:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, rowsPerPage, filters]);

  const handleMenuOpen = (event, id) => {
    setAnchorElMap(prev => ({ ...prev, [id]: event.currentTarget }));
  };

  const handleMenuClose = (id) => {
    setAnchorElMap(prev => ({ ...prev, [id]: null }));
  };

  const openResultModal = (row) => setModals({ result: row });
  const closeModals = () => setModals({ result: null });

  const handleResultSave = () => {
    closeModals();
    fetchData();
  };

  return (
    <Paper sx={{ p: 2 }}>
      <PayroleTableFilters onChange={setFilters} />

      <TableContainer>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>क्र.सं.</TableCell>
              <TableCell>कैदीको नाम</TableCell>
              <TableCell>उमेर</TableCell>
              <TableCell>मुद्दा विवरण</TableCell>
              <TableCell>प्यारोल अवधि</TableCell>
              <TableCell>कार्य</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {data.map((row, index) => {
              const dateInfo = calculateBSDate(row.thuna_date_bs, row.release_date_bs);
              const anchorEl = anchorElMap[row.bandi_id];

              return (
                <Fragment key={row.bandi_id}>
                  <TableRow hover>
                    <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                    <TableCell>{row.bandi_name}</TableCell>
                    <TableCell>{row.current_age}</TableCell>
                    <TableCell>
                      {row.muddas?.map((m, i) => (
                        <Typography key={i} variant="body2">{m.mudda_name}</Typography>
                      ))}
                    </TableCell>
                    <TableCell>
                      {dateInfo.formattedDuration}
                      <br />
                      {dateInfo.percentage}
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Actions">
                        <IconButton onClick={(e) => handleMenuOpen(e, row.bandi_id)}>
                          <MoreVertIcon />
                        </IconButton>
                      </Tooltip>
                      <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={() => handleMenuClose(row.bandi_id)}
                      >
                        <PayroleActionMenu
                          data={row}
                          onResultClick={() => openResultModal(row)}
                          onClose={() => handleMenuClose(row.bandi_id)}
                        />
                      </Menu>
                    </TableCell>
                  </TableRow>
                </Fragment>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {modals.result && (
        <PayroleResultModal
          open={!!modals.result}
          data={modals.result}
          onClose={closeModals}
          onSave={handleResultSave}
        />
      )}
    </Paper>
  );
};

export default PayroleTable;
