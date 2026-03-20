import React, { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  TableContainer,
  Collapse,
  Typography,
} from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";
import axios from "axios";
import ReuseKaragarOffice from "../../ReuseableComponents/ReuseKaragarOffice";
import ReuseInput from "../../ReuseableComponents/ReuseInput";
import { useForm } from "react-hook-form";
import { useBaseURL } from "../../../Context/BaseURLProvider";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { Box } from "@mui/system";

const PrisonBlocksForm = () => {
  const BASE_URL = useBaseURL();
  const [blocks, setBlocks] = useState( [] );
  const [loading, setLoading] = useState( false );
  const [open, setOpen] = useState( false );
  const [editingBlock, setEditingBlock] = useState( null );

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm( {
    mode: "onBlur",
    defaultValues: {
      prison_id: "",
      block_name: "",
      capacity: "",
      description: "",
    },
  } );

  const [groupedData, setGroupedData] = useState( [] );

  // ✅ Fetch blocks
  const fetchBlocks = async () => {
    setLoading( true );
    try {
      const res = await axios.get( `${ BASE_URL }/public/prison_blocks`, {
        withCredentials: true,
      } );
      setBlocks( res.data.Result || [] );
      setGroupedData( res.data.GroupedResult || [] );
      //   console.log(res.data.Result)
    } catch ( err ) {
      console.error( "Fetch error:", err );
    } finally {
      setLoading( false );
    }
  };

  useEffect( () => {
    fetchBlocks();
  }, [] );


  const handleOpen = ( block = null ) => {
    if ( block ) {
      setEditingBlock( block );
      reset( {
        prison_id: block.prison_id,
        block_name: block.block_name,
        capacity: block.capacity || "",
        male_count: block.male_count || "",
        female_count: block.female_count || "",
        other_count: block.other_count || "",
        total_count: block.total_bandi || "",
        description: block.description || "",
      } );
    } else {
      setEditingBlock( null );
      reset();
    }
    setOpen( true );
  };

  const handleClose = () => setOpen( false );

  // ✅ Create / Update
  const onSubmit = async ( data ) => {
    try {
      if ( editingBlock ) {
        await axios.put(
          `${ BASE_URL }/admin/prison_blocks/${ editingBlock.id }`,
          data,
          { withCredentials: true }
        );
      } else {
        await axios.post( `${ BASE_URL }/admin/prison_blocks`, data, {
          withCredentials: true,
        } );
      }
      fetchBlocks();
      handleClose();
    } catch ( error ) {
      console.error( "Save error:", error );
      alert( "Failed to save block!" );
    }
  };

  // ✅ Delete
  const handleDelete = async ( id ) => {
    if ( window.confirm( "Are you sure you want to delete this block?" ) ) {
      try {
        await axios.delete( `${ BASE_URL }/admin/prison_blocks/${ id }`, {
          withCredentials: true,
        } );
        fetchBlocks();
      } catch ( err ) {
        console.error( "Delete error:", err );
        alert( "Failed to delete block!" );
      }
    }
  };

  function Row( { row, handleOpen, handleDelete } ) {
    const [open, setOpen] = React.useState( false );

    return (
      <>
        {/* Parent Row (Prison) */}
        <TableRow>
          <TableCell>
            <IconButton onClick={() => setOpen( !open )}>
              {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          </TableCell>

          <TableCell>{row.prison_name}</TableCell>
          <TableCell>{row.total_capacity}</TableCell>
          <TableCell>{row.total_male}</TableCell>
          <TableCell>{row.total_female}</TableCell>
          <TableCell>{row.total}</TableCell>
        </TableRow>

        {/* Child Row (Blocks) */}
        <TableRow>
          <TableCell colSpan={5} sx={{ p: 0 }}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box sx={{ m: 2 }}>
                <Typography variant="h6">Blocks</Typography>

                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>ब्लक</TableCell>
                      <TableCell>क्षमता</TableCell>
                      <TableCell>पुरुष</TableCell>
                      <TableCell>महिला</TableCell>
                      <TableCell>अन्य</TableCell>
                      <TableCell>जम्मा</TableCell>
                      <TableCell>विवरण</TableCell>
                      <TableCell>#</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {row.blocks.map( ( block ) => (
                      <TableRow key={block.id}>
                        <TableCell>{block.block_name}</TableCell>
                        <TableCell>{block.capacity}</TableCell>
                        <TableCell>{block.male_count}</TableCell>
                        <TableCell>{block.female_count}</TableCell>
                        <TableCell>{block.other_count}</TableCell>
                        <TableCell>{block.total_bandi}</TableCell>
                        <TableCell>{block.description}</TableCell>
                        <TableCell>
                          <IconButton onClick={() => handleOpen( block )}>
                            <Edit />
                          </IconButton>
                          <IconButton onClick={() => handleDelete( block.id )}>
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ) )}
                  </TableBody>

                </Table>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      </>
    );
  }
  return (
    <div>
      <Button variant="contained" onClick={() => handleOpen()}>
        Add Block
      </Button>

      {loading ? (
        <CircularProgress sx={{ mt: 3 }} />
      ) : (
        <Paper sx={{ mt: 2 }}>
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell />
                  <TableCell>सि.नं.</TableCell>
                  <TableCell>कारागार</TableCell>
                  <TableCell>क्षमता</TableCell>
                  <TableCell>पुरुष</TableCell>
                  <TableCell>महिला</TableCell>
                  <TableCell>अन्य</TableCell>
                  <TableCell>जम्मा</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {groupedData.map( ( row ) => (
                  <Row
                    key={row.prison_id}
                    row={row}
                    handleOpen={handleOpen}
                    handleDelete={handleDelete}
                  />
                ) )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Dialog Form */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{editingBlock ? "Edit Block" : "Add Block"}</DialogTitle>
        <DialogContent dividers>
          <ReuseKaragarOffice
            label="कारागार कार्यालय"
            name="prison_id"
            control={control}
            rules={{ required: "कारागार कार्यालय अनिवार्य छ" }}
            error={errors.prison_id}
          />

          <ReuseInput
            name="block_name"
            label="ब्लक"
            control={control}
            rules={{ required: "ब्लक अनिवार्य छ" }}
            error={errors.block_name}
            fullWidth
          />

          <ReuseInput
            name="capacity"
            label="क्षमता"
            type="number"
            control={control}
            rules={{ required: "क्षमता अनिवार्य छ" }}
            error={errors.capacity}
            fullWidth
          />

          <ReuseInput
            name="description"
            label="विवरण"
            control={control}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit( onSubmit )}
            disabled={isSubmitting}
          >
            {editingBlock ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PrisonBlocksForm;
