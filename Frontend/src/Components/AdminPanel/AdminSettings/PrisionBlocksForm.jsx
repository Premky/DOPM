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
} from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";
import axios from "axios";
import ReuseKaragarOffice from "../../ReuseableComponents/ReuseKaragarOffice";
import ReuseInput from "../../ReuseableComponents/ReuseInput";
import { useForm } from "react-hook-form";
import { useBaseURL } from "../../../Context/BaseURLProvider";

const PrisonBlocksForm = () => {
  const BASE_URL = useBaseURL();
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "onBlur",
    defaultValues: {
      prison_id: "",
      block_name: "",
      capacity: "",
      description: "",
    },
  });

  // ✅ Fetch blocks
  const fetchBlocks = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/public/prison_blocks`, {
        withCredentials: true,
      });
      setBlocks(res.data.Result || []);
    //   console.log(res.data.Result)
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlocks();
  }, []);

  const handleOpen = (block = null) => {
    if (block) {
      setEditingBlock(block);
      reset({
        prison_id: block.prison_id,
        block_name: block.block_name,
        capacity: block.capacity || "",
        description: block.description || "",
      });
    } else {
      setEditingBlock(null);
      reset();
    }
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  // ✅ Create / Update
  const onSubmit = async (data) => {
    try {
      if (editingBlock) {
        await axios.put(
          `${BASE_URL}/admin/prison_blocks/${editingBlock.id}`,
          data,
          { withCredentials: true }
        );
      } else {
        await axios.post(`${BASE_URL}/admin/prison_blocks`, data, {
          withCredentials: true,
        });
      }
      fetchBlocks();
      handleClose();
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to save block!");
    }
  };

  // ✅ Delete
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this block?")) {
      try {
        await axios.delete(`${BASE_URL}/admin/prison_blocks/${id}`, {
          withCredentials: true,
        });
        fetchBlocks();
      } catch (err) {
        console.error("Delete error:", err);
        alert("Failed to delete block!");
      }
    }
  };

  return (
    <div>
      <Button variant="contained" onClick={() => handleOpen()}>
        Add Block
      </Button>

      {loading ? (
        <CircularProgress sx={{ mt: 3 }} />
      ) : (
        <Paper sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>कारागार कार्यालय</TableCell>
                <TableCell>ब्लकको नाम</TableCell>
                <TableCell>क्षमता</TableCell>
                <TableCell>विवरण</TableCell>
                <TableCell>#</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {blocks.map((block) => (
                <TableRow key={block.id}>
                  <TableCell>{block.letter_address}</TableCell>
                  <TableCell>{block.block_name}</TableCell>
                  <TableCell>{block.capacity}</TableCell>
                  <TableCell>{block.description}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpen(block)}>
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(block.id)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
            onClick={handleSubmit(onSubmit)}
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
